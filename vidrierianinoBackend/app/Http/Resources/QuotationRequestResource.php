<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'deadline' => $this->deadline,
            'status' => $this->status,
            'comments' => $this->comments,
            'created_at' => $this->created_at,
            'items_count' => $this->items->count(),
            'suppliers_count' => $this->suppliers->count(),
            'responses_count' => $this->responses->count(),

            // Relaciones condicionales
            'items' => QuotationRequestItemResource::collection($this->whenLoaded('items')),
            'suppliers' => QuotationRequestSupplierResource::collection($this->whenLoaded('suppliers')),
            'responses' => QuotationResponseResource::collection($this->whenLoaded('responses')),
            'children' => QuotationRequestResource::collection($this->whenLoaded('children')),
        ];
    }
}
