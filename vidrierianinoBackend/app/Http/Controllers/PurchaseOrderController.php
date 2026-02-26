<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Http\Request;
use App\Actions\ConfirmPurchaseOrderAction;
use App\Actions\CancelPurchaseOrderAction;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        return PurchaseOrder::with(['supplier', 'items.productVariant'])->latest()->paginate(10);
    }

    public function show($id)
    {
        return PurchaseOrder::with(['supplier', 'items.productVariant', 'items.unit'])->findOrFail($id);
    }

    public function confirm($id, ConfirmPurchaseOrderAction $action)
    {
        $po = PurchaseOrder::findOrFail($id);

        // Validación básica
        if ($po->status !== 'draft' && $po->status !== 'sent') {
            return response()->json(['error' => 'La orden ya está confirmada o cancelada'], 422);
        }

        $user = auth()->user() ?? User::first(); // Fallback temporal

        $confirmedOrder = $action->execute($po, $user);

        return response()->json([
            'message' => 'Orden de Compra confirmada y precios sincronizados con el catálogo maestro.',
            'data' => $confirmedOrder
        ]);
    }

    public function receive($id, \App\Actions\ReceivePurchaseOrderAction $action)
    {
        $po = PurchaseOrder::with('items')->findOrFail($id);
        $user = auth()->user() ?? User::first();

        try {
            $receivedOrder = $action->execute($po, $user);
            return response()->json([
                'message' => 'Orden recibida en almacén. Lotes de inventario generados.',
                'data' => $receivedOrder
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function cancel($id, Request $request, CancelPurchaseOrderAction $action)
    {
        $po = PurchaseOrder::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|min:5'
        ]);

        $user = auth()->user() ?? User::first();

        $cancelledOrder = $action->execute($po, $user, $validated['reason']);

        return response()->json([
            'message' => 'Orden de Compra cancelada. Los ítems cotizados han sido liberados para nueva adjudicación.',
            'data' => $cancelledOrder
        ]);
    }
}
