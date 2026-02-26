<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SupplierBranchResource
 *
 * Serializa una sucursal de proveedor para la API.
 * Incluye sus contactos cuando están cargados.
 */
class SupplierBranchResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'name' => $this->name,
            'city' => $this->city,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'notes' => $this->notes,
            'is_main' => $this->is_main,
            'created_at' => $this->created_at?->toDateTimeString(),

            // Contactos de esta sucursal (solo cuando estén cargados)
            'contacts' => $this->when(
                $this->relationLoaded('contacts'),
                fn() => $this->contacts->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'role' => $c->role,
                    'phone' => $c->phone,
                    'email' => $c->email,
                    'notes' => $c->notes,
                    'is_primary' => $c->is_primary,
                    'branch_id' => $c->branch_id,
                ])
            ),
        ];
    }
}
