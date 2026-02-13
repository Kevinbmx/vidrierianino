<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Supplier Model
 * 
 * Representa un proveedor del negocio (vidrios, aluminios, maderas, etc.).
 * 
 * Impacto en el negocio: Centraliza la gestión de proveedores,
 * permitiendo comparar ofertas y seleccionar la más conveniente.
 */
class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_name',
        'email',
        'phone',
        'address',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ========== RELACIONES ==========

    /**
     * Ofertas de productos de este proveedor.
     * 
     * @return HasMany
     */
    public function productOffers(): HasMany
    {
        return $this->hasMany(SupplierProductOffer::class);
    }

    // ========== SCOPES ==========

    /**
     * Scope para obtener solo proveedores activos.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // ========== MÉTODOS DE NEGOCIO ==========

    /**
     * Verifica si el proveedor está activo.
     * 
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }
}
