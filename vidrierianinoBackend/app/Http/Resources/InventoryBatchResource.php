<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * InventoryBatchResource
 *
 * Transforma un lote de inventario para consumo del frontend.
 * Expone dimensiones físicas y métricas de stock para la tabla Master-Detail.
 *
 * Unidades retornadas: dependen del tipo de variante (m², ml, kg o pza).
 */
class InventoryBatchResource extends JsonResource
{
    public function toArray($request): array
    {
        $dims = is_array($this->dimensions) ? $this->dimensions : [];

        // Construir descripción legible de las dimensiones para el frontend
        // Ej: "3.60 x 2.50 m" para vidrio en área
        $dimensionLabel = $this->buildDimensionLabel($dims);

        return [
            'id' => $this->id,
            'batch_code' => $this->batch_code,
            'physical_quantity' => $this->physical_quantity,
            'dimensions' => $dims,
            'dimension_label' => $dimensionLabel, // String legible para la UI
            'location' => $this->location,
            'status' => $this->status,
            'purchase_order_id' => $this->purchase_order_id,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    /**
     * Construye una etiqueta descriptiva de las dimensiones del lote.
     *
     * Ejemplos:
     * - ['width'=>3.6, 'height'=>2.5]  → "3.60 x 2.50 m"
     * - ['length'=>6.0]                → "6.00 ml"
     * - ['weight'=>50.0]               → "50.00 kg"
     * - []                             → "—"
     *
     * @param array $dims
     * @return string
     */
    private function buildDimensionLabel(array $dims): string
    {
        if (!empty($dims['width']) && !empty($dims['height'])) {
            return number_format($dims['width'], 2) . ' × ' . number_format($dims['height'], 2) . ' m';
        }

        if (!empty($dims['length'])) {
            return number_format($dims['length'], 2) . ' ml';
        }

        if (!empty($dims['weight'])) {
            return number_format($dims['weight'], 2) . ' kg';
        }

        return '—';
    }
}
