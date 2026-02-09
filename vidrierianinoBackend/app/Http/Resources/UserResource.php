<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_active' => (bool) $this->is_active,
            'roles' => $this->roles->map(fn($role) => ['name' => $role->name]),
            'permissions' => $this->permissions->map(fn($perm) => ['name' => $perm->name]),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
