<?php

namespace App\Actions;

use App\Models\QuotationRequest;
use App\Models\QuotationResponse;
use Illuminate\Support\Collection;

class AnalyzeQuotationAction
{
    /**
     * Analiza las cotizaciones recibidas y devuelve escenarios de compra.
     * 
     * @param QuotationRequest $request
     * @return array Estructura con 'granular_scenario' y 'total_scenario'
     */
    public function execute(QuotationRequest $request): array
    {
        $items = $request->items;
        $responses = $request->responses;

        // 1. Scenario Granular (Mejor precio por ítem)
        $granularScenario = [];
        $granularTotal = 0;

        foreach ($items as $item) {
            // Buscar la respuesta más barata para este ítem
            $bestResponse = $responses->where('quotation_request_item_id', $item->id)
                ->whereNotNull('unit_price')
                ->sortBy('unit_price')
                ->first();

            if ($bestResponse) {
                $lineTotal = $bestResponse->unit_price * $item->quantity;
                $granularScenario[] = [
                    'item_id' => $item->id,
                    'product_name' => $item->productVariant->name, // Asumiendo carga previa
                    'supplier_id' => $bestResponse->supplier_id,
                    'supplier_name' => $bestResponse->supplier->name,
                    'unit_price' => $bestResponse->unit_price,
                    'quantity' => $item->quantity,
                    'line_total' => $lineTotal,
                    'response_id' => $bestResponse->id
                ];
                $granularTotal += $lineTotal;
            }
        }

        // 2. Scenario Total (Mejor proveedor global)
        // Solo consideramos proveedores que cotizaron TODOS los ítems requeridos
        // O al menos, calculamos el total de lo que cotizaron.

        $supplierTotals = [];
        foreach ($responses as $response) {
            if ($response->unit_price === null)
                continue;

            $supplierId = $response->supplier_id;
            if (!isset($supplierTotals[$supplierId])) {
                $supplierTotals[$supplierId] = [
                    'supplier_id' => $supplierId,
                    'supplier_name' => $response->supplier->name,
                    'total_amount' => 0,
                    'items_count' => 0,
                    'responses' => []
                ];
            }

            // Buscar cantidad del ítem
            $item = $items->find($response->quotation_request_item_id);
            if ($item) {
                $lineTotal = $response->unit_price * $item->quantity;
                $supplierTotals[$supplierId]['total_amount'] += $lineTotal;
                $supplierTotals[$supplierId]['items_count']++;
                $supplierTotals[$supplierId]['responses'][] = $response->id;
            }
        }

        // Filtrar proveedores que tengan cotizados todos los ítems (o la mayoría)
        // Para simplificar, ordenamos por total_amount
        usort($supplierTotals, fn($a, $b) => $a['total_amount'] <=> $b['total_amount']);

        $bestTotalScenario = $supplierTotals[0] ?? null;

        return [
            'granular' => [
                'type' => 'BEST_MIX',
                'items' => $granularScenario,
                'total_cost' => $granularTotal,
                'savings' => ($bestTotalScenario ? $bestTotalScenario['total_amount'] - $granularTotal : 0)
            ],
            'total' => [
                'type' => 'SINGLE_SUPPLIER',
                'best_supplier' => $bestTotalScenario,
                'all_suppliers' => $supplierTotals // Para mostrar ranking
            ]
        ];
    }
}
