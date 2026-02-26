<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SupplierProductOfferHistoryResource
 * 
 * Formatea la respuesta JSON del historial de cambios.
 * 
 * Útil para mostrar auditorías y análisis de tendencias de precios.
 */
class SupplierProductOfferHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_product_offer_id' => $this->supplier_product_offer_id,

            // IDs de relaciones (snapshot)
            'supplier_id' => $this->supplier_id,
            'product_variant_id' => $this->product_variant_id,
            'purchase_unit_id' => $this->purchase_unit_id,

            // Datos históricos
            'cost' => $this->cost,
            'purchase_width' => $this->purchase_width,
            'purchase_height' => $this->purchase_height,
            'purchase_length' => $this->purchase_length,
            'is_preferred' => $this->is_preferred,
            'is_active' => $this->is_active,
            'notes' => $this->notes,
            'document_url' => $this->document_url,

            // Metadata de auditoría
            'change_type' => $this->change_type,
            'changed_by_user_id' => $this->changed_by_user_id,
            'change_reason' => $this->change_reason,
            'changed_at' => $this->changed_at?->toISOString(),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),

            // Relaciones (solo si están cargadas)
            'supplier' => SupplierResource::make($this->whenLoaded('supplier')),
            'product_variant' => ProductVariantResource::make($this->whenLoaded('productVariant')),
            'purchase_unit' => UnitOfMeasureResource::make($this->whenLoaded('purchaseUnit')),
            'changed_by_user' => UserResource::make($this->whenLoaded('changedByUser')),
        ];
    }
}
