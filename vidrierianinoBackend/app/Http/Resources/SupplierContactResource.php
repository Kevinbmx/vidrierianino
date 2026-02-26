<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SupplierContactResource
 *
 * Serializa un contacto de proveedor para la API.
 */
class SupplierContactResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'branch_id' => $this->branch_id,   // ← necesario para agrupar contactos por sucursal
            'name' => $this->name,
            'role' => $this->role,
            'phone' => $this->phone,
            'email' => $this->email,
            'notes' => $this->notes,
            'is_primary' => $this->is_primary,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
