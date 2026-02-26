<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SupplierContact Model
 *
 * Representa una persona de contacto dentro de un proveedor
 * (vendedoras, gerentes, encargados de compras, etc.).
 * Puede estar asociada a una sucursal específica o existir de forma independiente.
 *
 * Impacto en el negocio: Permite elegir a quién dirigir una RFQ
 * dentro de la misma empresa proveedora, sin duplicar proveedores.
 */
class SupplierContact extends Model
{
    protected $fillable = [
        'supplier_id',
        'branch_id',   // nullable: si es null, el contacto no tiene sucursal asignada
        'name',
        'role',
        'phone',
        'email',
        'notes',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    // ========== RELACIONES ==========

    /**
     * Proveedor al que pertenece este contacto.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Sucursal donde trabaja este contacto (opcional).
     * Null si el contacto no está asignado a ninguna sucursal.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(SupplierBranch::class, 'branch_id');
    }
}
