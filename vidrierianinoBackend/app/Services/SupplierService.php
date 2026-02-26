<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;

/**
 * SupplierService
 * 
 * Maneja la lógica de negocio para proveedores.
 * 
 * Impacto en el negocio: Centraliza operaciones CRUD de proveedores,
 * asegurando consistencia en la gestión de fuentes de abastecimiento.
 */
class SupplierService
{
    /**
     * Obtiene todos los proveedores activos.
     * 
     * @return Collection
     */
    public function getAllActive(): Collection
    {
        return Supplier::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Obtiene todos los proveedores (activos e inactivos).
     * 
     * @return Collection
     */
    public function getAll(): Collection
    {
        return Supplier::orderBy('name')->get();
    }

    public function create(array $data): Supplier
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $supplier = Supplier::create([
                'name' => $data['name'],
                'rif' => $data['rif'] ?? null,
                'payment_terms' => $data['payment_terms'] ?? null,
                'website' => $data['website'] ?? null,
                'notes' => $data['notes'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            $branch = null;
            if (!empty($data['address'])) {
                $branch = $supplier->branches()->create([
                    'name' => 'Sede Principal',
                    'address' => $data['address'],
                    'notes' => 'Creada automáticamente al registrar el proveedor.',
                    'is_main' => true,
                ]);
            }

            if (!empty($data['contact_name']) || !empty($data['phone']) || !empty($data['email'])) {
                $supplier->contacts()->create([
                    'branch_id' => $branch?->id,
                    'name' => $data['contact_name'] ?? 'Contacto Principal',
                    'phone' => $data['phone'] ?? null,
                    'email' => $data['email'] ?? null,
                    'is_primary' => true,
                ]);
            }

            return $supplier;
        });
    }

    /**
     * Actualiza un proveedor existente.
     * 
     * @param Supplier $supplier
     * @param array $data
     * @return Supplier
     */
    public function update(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);
        return $supplier->fresh();
    }

    /**
     * Elimina un proveedor.
     * 
     * Impacto: Al eliminar un proveedor, se eliminan también sus ofertas
     * (cascadeOnDelete definido en la migración).
     * 
     * @param Supplier $supplier
     * @return bool
     */
    public function delete(Supplier $supplier): bool
    {
        return $supplier->delete();
    }

    /**
     * Desactiva un proveedor (soft disable).
     * 
     * Impacto: Mantiene el historial del proveedor pero impide crear
     * nuevas ofertas o usarlo en cotizaciones futuras.
     * 
     * @param Supplier $supplier
     * @return Supplier
     */
    public function deactivate(Supplier $supplier): Supplier
    {
        $supplier->update(['is_active' => false]);

        // También desactivar todas sus ofertas activas
        $supplier->productOffers()->update(['is_active' => false]);

        return $supplier->fresh();
    }

    /**
     * Reactiva un proveedor.
     * 
     * @param Supplier $supplier
     * @return Supplier
     */
    public function activate(Supplier $supplier): Supplier
    {
        $supplier->update(['is_active' => true]);
        return $supplier->fresh();
    }
}
