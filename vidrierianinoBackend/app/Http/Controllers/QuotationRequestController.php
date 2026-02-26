<?php

namespace App\Http\Controllers;

use App\Models\QuotationRequest;
use App\Models\QuotationRequestItem;
use App\Models\QuotationRequestSupplier;
use App\Http\Resources\QuotationRequestResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Actions\AnalyzeQuotationAction;
use App\Actions\GeneratePurchaseOrderAction;
use App\Services\RFQDistributionService;

class QuotationRequestController extends Controller
{
    public function index()
    {
        // Solo retornar las RFQ Padres (parent_id = null) con sus hijos cargados
        return QuotationRequestResource::collection(
            QuotationRequest::with(['items', 'suppliers', 'children.suppliers', 'children.items'])
                ->whereNull('parent_id')
                ->latest()
                ->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'deadline' => 'required|date',
            'comments' => 'nullable|string',
            'items' => 'required|array|min:1',
            'suppliers' => 'nullable|array', // Opcional
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // 1. Crear RFQ
            $rfq = QuotationRequest::create([
                'code' => 'RFQ-' . now()->format('YmdHis'),
                'deadline' => $validated['deadline'],
                'comments' => $validated['comments'] ?? null,
                'created_by' => auth()->id() ?? \App\Models\User::first()->id,
                'status' => 'draft' // Siempre nace en draft
            ]);

            // 2. Crear Items
            foreach ($validated['items'] as $item) {
                QuotationRequestItem::create([
                    'quotation_request_id' => $rfq->id,
                    'product_variant_id' => $item['product_variant_id'],
                    'quantity' => $item['quantity'],
                    'unit_id' => $item['unit_id'] ?? 1,
                    'notes' => $item['notes'] ?? null
                ]);
            }

            // 3. Invitar Proveedores (Opcional, legacy support o si se reactiva en UI)
            if (!empty($validated['suppliers'])) {
                foreach ($validated['suppliers'] as $supplierId) {
                    QuotationRequestSupplier::create([
                        'quotation_request_id' => $rfq->id,
                        'supplier_id' => $supplierId,
                        'status' => 'pending',
                        'sent_at' => now()
                    ]);
                }
                // Si se invitaron proveedores, podría pasar a 'ready' o mantenerse en 'draft' 
                // hasta distribuir. Mantendremos 'draft' según requerimiento.
            }

            return new QuotationRequestResource($rfq->load(['items', 'suppliers']));
        });
    }

    public function show($id)
    {
        $rfq = QuotationRequest::with([
            'items.unit', // Cargar unidad del item
            'items.productVariant.saleUnit', // Cargar unidad base de la variante
            'suppliers',
            'responses',
            'children.suppliers',
            'children.items.productVariant',
            'children.responses',
            'children.items.unit'
        ])->findOrFail($id);

        return new QuotationRequestResource($rfq);
    }

    public function analyze($id, AnalyzeQuotationAction $action)
    {
        $rfq = QuotationRequest::with(['items.productVariant', 'responses.supplier'])->findOrFail($id);
        $scenarios = $action->execute($rfq);

        return response()->json([
            'data' => [
                'rfq_id' => $rfq->id,
                'scenarios' => $scenarios
            ]
        ]);
    }

    public function generatePurchaseOrder($id, Request $request, GeneratePurchaseOrderAction $action)
    {
        $rfq = QuotationRequest::findOrFail($id);

        $validated = $request->validate([
            'selected_response_ids' => 'required|array|min:1',
            'selected_response_ids.*' => 'exists:quotation_responses,id'
        ]);

        $orders = $action->execute($rfq, $validated['selected_response_ids'], auth()->user() ?? \App\Models\User::first());

        return response()->json([
            'message' => 'Órdenes de Compra generadas exitosamente',
            'data' => $orders
        ]);
    }

    /**
     * GET /api/quotation-requests/{id}/smart-matrix
     * Retorna la matriz pre-calculada de supplier-items basada en supplier_product_offers
     */
    public function getSmartMatrix($id, RFQDistributionService $service)
    {
        $rfq = QuotationRequest::with('items')->findOrFail($id);

        if ($rfq->parent_id !== null) {
            return response()->json(['error' => 'Solo se puede distribuir RFQs Padre'], 400);
        }

        $matrix = $service->generateSmartMatrix($rfq);

        return response()->json([
            'rfq_id' => $rfq->id,
            'matrix' => $matrix // { supplier_id: [item_ids] }
        ]);
    }

    /**
     * POST /api/quotation-requests/{id}/distribute
     * Distribuye la RFQ Padre en RFQs Hijas
     */
    public function distribute($id, Request $request, RFQDistributionService $service)
    {
        $rfq = QuotationRequest::with('items')->findOrFail($id);

        if ($rfq->parent_id !== null) {
            return response()->json(['error' => 'Solo se puede distribuir RFQs Padre'], 400);
        }

        $validated = $request->validate([
            'supplier_item_matrix' => 'required|array',
            'submission_channel' => 'required|string|in:whatsapp,email,portal,manual'
        ]);

        $children = $service->distribute(
            $rfq,
            $validated['supplier_item_matrix'],
            $validated['submission_channel']
        );

        return response()->json([
            'message' => 'RFQs distribuidas exitosamente',
            'parent_rfq_id' => $rfq->id,
            'children_count' => $children->count(),
            'children' => QuotationRequestResource::collection($children)
        ]);
    }

    /**
     * POST /api/quotation-requests/{id}/add-supplier
     * Invita a un proveedor individualmente creando una RFQ Hija.
     */
    public function addSupplier($id, Request $request)
    {
        $rfq = QuotationRequest::with('items')->findOrFail($id);

        if ($rfq->parent_id !== null) {
            return response()->json(['error' => 'Solo se pueden invitar proveedores a la RFQ Padre'], 400);
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id'
        ]);
        $supplierId = $request->supplier_id;

        // Verificar si ya existe como hijo
        $exists = QuotationRequest::where('parent_id', $rfq->id)
            ->whereHas('suppliers', function ($q) use ($supplierId) {
                $q->where('supplier_id', $supplierId);
            })->exists();

        if ($exists) {
            return response()->json(['message' => 'El proveedor ya está invitado a esta cotización'], 422);
        }

        return DB::transaction(function () use ($rfq, $supplierId) {
            // 1. Crear RFQ Hija
            $count = QuotationRequest::where('parent_id', $rfq->id)->count();
            $suffix = chr(65 + $count); // A, B, C...

            $child = QuotationRequest::create([
                'parent_id' => $rfq->id,
                'code' => $rfq->code . '-' . $suffix,
                'deadline' => $rfq->deadline,
                'comments' => $rfq->comments,
                'created_by' => auth()->id() ?? \App\Models\User::first()->id,
                'status' => 'draft' // Inicial, pendiente de envío
            ]);

            // 2. Asociar Proveedor (Pivot)
            QuotationRequestSupplier::create([
                'quotation_request_id' => $child->id,
                'supplier_id' => $supplierId,
                'status' => 'pending', // No enviado aún
                'sent_at' => null
            ]);

            // 3. Copiar Items del Padre al Hijo (Todos)
            foreach ($rfq->items as $item) {
                $childItem = QuotationRequestItem::create([
                    'quotation_request_id' => $child->id,
                    'product_variant_id' => $item->product_variant_id,
                    'quantity' => $item->quantity,
                    'unit_id' => $item->unit_id,
                    'notes' => $item->notes
                ]);

                // 4. Crear Response placeholder
                \App\Models\QuotationResponse::create([
                    'quotation_request_id' => $child->id,
                    'quotation_request_item_id' => $childItem->id,
                    'supplier_id' => $supplierId,
                ]);
            }

            return new QuotationRequestResource($child->load('suppliers', 'items'));
        });
    }
}
