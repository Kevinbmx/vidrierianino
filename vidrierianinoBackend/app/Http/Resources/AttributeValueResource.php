<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * AttributeValueResource
 * 
 * Transforma AttributeValue con su atributo padre para respuestas JSON.
 */
class AttributeValueResource extends JsonResource
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
            'value' => $this->value,
            'attribute' => $this->whenLoaded('attribute', function () {
                return [
                    'id' => $this->attribute->id,
                    'name' => $this->attribute->name,
                    'slug' => $this->attribute->slug,
                    'input_type' => $this->attribute->input_type,
                ];
            }),
        ];
    }
}
