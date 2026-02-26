<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * SupplierBranch Model
 *
 * Representa una sucursal o sede física de un proveedor.
 *
 * Impacto en el negocio: Permite registrar múltiples puntos de contacto
 * del mismo proveedor (Sucursal Centro, Sucursal Este, etc.) y agrupar
 * las vendedoras por ubicación para enviar RFQs más precisas.
 */
class SupplierBranch extends Model
{
    protected $fillable = [
        'supplier_id',
        'name',
        'city',
        'address',
        'phone',
        'email',
        'notes',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    // ========== RELACIONES ==========

    /**
     * Proveedor al que pertenece esta sucursal.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Contactos que trabajan en esta sucursal.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(SupplierContact::class, 'branch_id');
    }
}
