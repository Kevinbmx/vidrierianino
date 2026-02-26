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
        'name',          // Nombre comercial de la empresa
        'rif',           // Identificación fiscal (J-12345678)
        'payment_terms', // Condiciones de pago ("30 días", "contado")
        'website',       // Sitio web (opcional)
        'notes',         // Notas internas
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ========== RELACIONES ==========

    /**
     * Contactos de este proveedor (vendedoras, gerentes, etc.).
     * Impacto en el negocio: Evita crear un proveedor por cada vendedora.
     *
     * @return HasMany
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(SupplierContact::class);
    }

    /**
     * Sucursales de este proveedor (sedes, locales).
     * Impacto en el negocio: Permite emitir RFQs a una sede específica
     * del mismo proveedor con contactos y precios diferenciados.
     *
     * @return HasMany
     */
    public function branches(): HasMany
    {
        return $this->hasMany(SupplierBranch::class);
    }

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
    /**
     * Relación con las invitaciones a cotizaciones (Tabla Pivote).
     */
    public function quotationRequestSuppliers(): HasMany
    {
        return $this->hasMany(QuotationRequestSupplier::class);
    }

    /**
     * Relación directa con las cotizaciones enviadas a través de la tabla pivote.
     */
    public function quotationRequests(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(QuotationRequest::class, 'quotation_request_suppliers')
            ->withPivot(['status', 'submission_channel', 'sent_at', 'replied_at', 'response_document_url'])
            ->withTimestamps();
    }
}
