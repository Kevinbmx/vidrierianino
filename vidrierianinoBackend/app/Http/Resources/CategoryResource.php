<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CategoryResource
 * 
 * Transforma el modelo Category para respuestas JSON de la API.
 */
class CategoryResource extends JsonResource
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
            'parent_id' => $this->parent_id,
            'order' => $this->order,
            'is_active' => $this->is_active,

            // Relaciones opcionales
            'parent' => $this->whenLoaded('parent', fn() => new CategoryResource($this->parent)),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'products_count' => $this->when(isset($this->products_count), $this->products_count),

            // Metadatos
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
