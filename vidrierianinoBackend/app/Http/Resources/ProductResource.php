<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ProductResource
 * 
 * Transforma el modelo Product con sus variantes y categoría.
 */
class ProductResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,

            // Relaciones
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),

            // Datos calculados
            'has_stock' => $this->when($this->relationLoaded('variants'), fn() => $this->hasStock()),
            'cheapest_price' => $this->when(
                $this->relationLoaded('variants'),
                fn() => $this->cheapestVariant()?->price
            ),

            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
