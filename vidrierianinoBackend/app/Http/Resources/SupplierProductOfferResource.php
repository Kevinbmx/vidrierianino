<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SupplierProductOfferResource
 * 
 * Transforma el modelo SupplierProductOffer en respuesta JSON para la API.
 * Incluye el cálculo de base_unit_cost (accessor del modelo).
 */
class SupplierProductOfferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'product_variant_id' => $this->product_variant_id,

            // Datos de compra
            'cost' => $this->cost,
            'purchase_unit_id' => $this->purchase_unit_id,
            'purchase_width' => $this->purchase_width,
            'purchase_height' => $this->purchase_height,
            'purchase_length' => $this->purchase_length,

            // Cálculo automático de costo base normalizado
            'base_unit_cost' => $this->base_unit_cost,
            'total_area' => $this->total_area,

            // Metadata
            'is_preferred' => $this->is_preferred,
            'is_active' => $this->is_active,
            'notes' => $this->notes,

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),

            // Relaciones (solo si están cargadas)
            'supplier' => new SupplierResource($this->whenLoaded('supplier')),
            'purchase_unit' => new UnitOfMeasureResource($this->whenLoaded('purchaseUnit')),
            'product_variant' => new ProductVariantResource($this->whenLoaded('productVariant')),
        ];
    }
}
