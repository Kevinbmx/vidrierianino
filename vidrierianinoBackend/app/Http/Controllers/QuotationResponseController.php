<?php

namespace App\Http\Controllers;

use App\Models\QuotationResponse;
use Illuminate\Http\Request;

class QuotationResponseController extends Controller
{
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $response = QuotationResponse::findOrFail($id);

        // Validar datos
        $validated = $request->validate([
            'unit_price' => 'nullable|numeric|min:0',
            'offered_price' => 'nullable|numeric|min:0',
            'pack_quantity' => 'nullable|numeric|min:0.01',
            'quoted_unit_id' => 'nullable|exists:units_of_measure,id',
            'dimensions_description' => 'nullable|string|max:255',
            'currency' => 'nullable|string|size:3',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Lógica de cálculo automático
        // Si viene offered_price o pack_quantity, recalcular unit_price
        if ($request->has('offered_price') || $request->has('pack_quantity')) {
            $offeredPrice = $request->input('offered_price', $response->offered_price);
            $packQty = $request->input('pack_quantity', $response->pack_quantity ?? 1);

            // Si no hay pack_quantity en request ni en DB, usar 1
            $packQty = $packQty ?: 1;

            if ($offeredPrice !== null) {
                // unit_price = offered_price / pack_quantity
                $validated['unit_price'] = $offeredPrice / $packQty;
            }
        }

        // Si viene unit_price explícito, usarlo (override manual)
        // Pero si enviaron offered_price, el bloque anterior ya seteo unit_price.
        // Daremos prioridad al cálculo si se envían los componentes.
        if ($request->has('unit_price') && !$request->has('offered_price')) {
            $validated['unit_price'] = $request->unit_price;
        }

        $response->update($validated);

        // Actualizar estado 'replied' en el pivot si es el primer precio
        $rfqSupplier = $response->supplier->quotationRequestSuppliers()
            ->where('quotation_request_id', $response->quotation_request_id)
            ->first();

        if ($rfqSupplier && $rfqSupplier->status !== 'replied') {
            $rfqSupplier->update([
                'status' => 'replied',
                'replied_at' => now()
            ]);

            // Actualizar estado RFQ padre si corresponde (opcional)
            $response->quotationRequest->update(['status' => 'analyzing']);
        }

        return response()->json([
            'message' => 'Respuesta actualizada correctamente',
            'data' => $response
        ]);
    }
}
