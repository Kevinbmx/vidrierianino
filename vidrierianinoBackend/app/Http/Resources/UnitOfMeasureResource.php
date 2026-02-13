<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * UnitOfMeasureResource
 * 
 * Transforma el modelo UnitOfMeasure para respuestas JSON de la API.
 */
class UnitOfMeasureResource extends JsonResource
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
            'abbreviation' => $this->abbreviation,
            'type' => $this->type,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
