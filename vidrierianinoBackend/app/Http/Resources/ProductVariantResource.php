<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ProductVariantResource
 *
 * Transforma ProductVariant incluyendo atributos calculados:
 * - total_abstract_stock: Stock real en unidad abstracta (m², ml, kg o pzas)
 * - inventory_valuation:  Valorización total ($)
 * - inventory_batches:    Lotes detallados para la sub-tabla del inventario
 *
 * Impacto: Esta resource es la fuente de verdad del dashboard de inventario.
 */
class ProductVariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,

            // 🔥 Precios flexibles
            'pricing_mode' => $this->pricing_mode,
            'price' => $this->price,
            'markup_percentage' => $this->markup_percentage,
            'final_price' => $this->final_price,
            'is_active' => $this->is_active,

            // Unidades de medida
            'sale_unit_id' => $this->sale_unit_id,
            'sale_unit' => new UnitOfMeasureResource($this->whenLoaded('saleUnit')),
            'sale_unit_type' => $this->saleUnit?->type,         // 'area' | 'length' | 'weight' | 'unit'
            'sale_unit_abbr' => $this->saleUnit?->abbreviation, // 'm²', 'ml', 'kg', 'pza'

            // 📦 Stock real calculado desde inventory_batches
            'total_abstract_stock' => $this->total_abstract_stock, // ej: "150.5000"
            'inventory_valuation' => $this->inventory_valuation,  // ej: "375000.0000"

            // Stock legacy (retrocompatibilidad)
            'stock_quantity' => $this->stock_quantity,
            'min_stock' => $this->min_stock,

            // 🚦 Semáforo: bajo si total_abstract_stock < min_stock
            'is_low_stock' => (float) $this->total_abstract_stock < (float) $this->min_stock,
            'has_stock' => (float) $this->total_abstract_stock > 0,

            // 🗃️ Lotes de inventario (sub-tabla desplegable en el frontend)
            'inventory_batches' => InventoryBatchResource::collection(
                $this->whenLoaded('inventoryBatches')
            ),

            // Dimensiones y empaques configurados
            'dimensions' => $this->whenLoaded('dimensions'),
            'packagings' => $this->whenLoaded('packagings'),

            // Atributos EAV
            'attributes' => AttributeValueResource::collection($this->whenLoaded('attributeValues')),

            // 🔥 Ofertas de proveedores
            'best_offer' => new SupplierProductOfferResource($this->whenLoaded('bestOffer')),
            'supplier_offers' => SupplierProductOfferResource::collection($this->whenLoaded('supplierOffers')),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
