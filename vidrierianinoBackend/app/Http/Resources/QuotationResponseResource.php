<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResponseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quotation_request_item_id' => $this->quotation_request_item_id,
            'supplier_id' => $this->supplier_id,
            'unit_price' => (float) $this->unit_price, // Asegurar número
            'currency' => $this->currency,
            'is_awarded' => (bool) $this->is_awarded, // Asegurar booleano
            'notes' => $this->notes,
            'updated_at' => $this->updated_at,

            'item' => new QuotationRequestItemResource($this->whenLoaded('item')),

            // Info del proveedor si está cargada
            'supplier' => $this->whenLoaded('supplier', function () {
                return [
                    'id' => $this->supplier->id,
                    'name' => $this->supplier->name
                ];
            }),
        ];
    }
}
