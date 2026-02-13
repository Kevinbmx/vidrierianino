<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ProductVariantResource
 * 
 * Transforma ProductVariant incluyendo atributos calculados (base_unit_cost, total_area).
 */
class ProductVariantResource extends JsonResource
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
            'sku' => $this->sku,
            'name' => $this->name,

            // 🔥 Precios flexibles
            'pricing_mode' => $this->pricing_mode,
            'price' => $this->price, // Precio fijo (solo si mode = fixed)
            'markup_percentage' => $this->markup_percentage, // % ganancia (solo si mode = markup)
            'final_price' => $this->final_price, // 🔥 Atributo calculado dinámicamente

            // Unidades de medida
            'sale_unit' => new UnitOfMeasureResource($this->whenLoaded('saleUnit')),

            // Stock
            'stock_quantity' => $this->stock_quantity,
            'min_stock' => $this->min_stock,
            'is_low_stock' => $this->isLowStock(),
            'has_stock' => $this->hasStock(),

            // Atributos EAV
            'attributes' => AttributeValueResource::collection($this->whenLoaded('attributeValues')),

            // 🔥 Mejor oferta de proveedor (si está cargada)
            'best_offer' => new SupplierProductOfferResource($this->whenLoaded('bestOffer')),

            // Ofertas de proveedores (si están cargadas)
            'supplier_offers' => SupplierProductOfferResource::collection($this->whenLoaded('supplierOffers')),

            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
