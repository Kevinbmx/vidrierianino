<?php

namespace App\Actions;

use App\Models\QuotationRequest;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\QuotationResponse;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class GeneratePurchaseOrderAction
{
    /**
     * Genera una o múltiples Órdenes de Compra basadas en las respuestas seleccionadas.
     * 
     * @param QuotationRequest $request
     * @param array $selectedResponseIds Array de IDs de QuotationResponse elegidas
     * @param User $user Usuario que genera la orden
     */
    public function execute(QuotationRequest $request, array $selectedResponseIds, User $user)
    {
        return DB::transaction(function () use ($request, $selectedResponseIds, $user) {
            // 1. Agrupar respuestas por proveedor
            $responses = QuotationResponse::whereIn('id', $selectedResponseIds)
                ->with(['item', 'supplier'])
                ->get()
                ->groupBy('supplier_id');

            $generatedOrders = [];

            foreach ($responses as $supplierId => $supplierResponses) {
                // Crear Cabecera de PO
                $poCode = 'PO-' . now()->format('Ymd') . '-' . str_pad($request->id, 4, '0', STR_PAD_LEFT) . '-' . $supplierId;

                $po = PurchaseOrder::create([
                    'code' => $poCode,
                    'supplier_id' => $supplierId,
                    'quotation_request_id' => $request->id,
                    'order_date' => now(), // Fecha de creación
                    'status' => PurchaseOrder::STATUS_DRAFT,
                    'created_by' => $user->id,
                    'currency' => $supplierResponses->first()->currency ?? 'BOB',
                ]);

                $subtotal = 0;

                foreach ($supplierResponses as $response) {
                    $item = $response->item; // QuotationRequestItem
                    $quantity = $item->quantity;
                    $unitPrice = $response->unit_price;
                    $totalLine = $quantity * $unitPrice;

                    // Crear Ítem de PO
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $po->id,
                        'product_variant_id' => $item->product_variant_id,
                        'unit_id' => $item->unit_id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_line' => $totalLine,
                        'quotation_response_id' => $response->id
                    ]);

                    // Marcar respuesta como adjudicada
                    $response->update(['is_awarded' => true]);

                    $subtotal += $totalLine;
                }

                // Actualizar totales de PO
                $po->update([
                    'subtotal' => $subtotal,
                    'tax_amount' => 0, // Por ahora sin impuestos complejos
                    'total_amount' => $subtotal
                ]);

                $generatedOrders[] = $po;
            }

            // Actualizar estado de RFQ si todos los ítems fueron adjudicados
            // (Lógica simplificada: si se generaron POs, cambiamos a 'awarded')
            $request->update(['status' => 'awarded']);

            return $generatedOrders;
        });
    }
}
