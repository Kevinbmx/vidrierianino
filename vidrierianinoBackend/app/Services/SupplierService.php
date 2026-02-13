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

    /**
     * Crea un nuevo proveedor.
     * 
     * @param array $data ['name', 'contact_name', 'email', 'phone', 'address', 'notes']
     * @return Supplier
     */
    public function create(array $data): Supplier
    {
        return Supplier::create($data);
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
