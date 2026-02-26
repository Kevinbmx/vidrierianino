<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationRequestSupplierResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Expects a Supplier model with pivot data loaded.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // Supplier ID
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,

            // Datos del Pivot (Invitación)
            'invitation' => [
                'status' => $this->pivot->status ?? null,
                'sent_at' => $this->pivot->sent_at ?? null,
                'replied_at' => $this->pivot->replied_at ?? null,
                'response_document_url' => $this->pivot->response_document_url ?? null,
            ]
        ];
    }
}
