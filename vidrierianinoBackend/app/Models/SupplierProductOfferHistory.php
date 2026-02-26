<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SupplierProductOfferHistory Model
 * 
 * Registro histórico de cambios en las ofertas de proveedores.
 * 
 * Lógica de Negocio:
 * - Audita todos los cambios (creación, actualización, desactivación)
 * - Permite analizar tendencias de precios a lo largo del tiempo
 * - Registra quién hizo el cambio y por qué (para trazabilidad)
 * 
 * Impacto de Negocio:
 * - Facilita negociaciones con histórico de precios
 * - Detecta incrementos anormales para solicitar justificaciones
 * - Cumple requisitos de auditoría y control de costos
 * 
 * @property int $id
 * @property int $supplier_product_offer_id
 * @property int $supplier_id
 * @property int $product_variant_id
 * @property float $cost
 * @property int $purchase_unit_id
 * @property float|null $purchase_width
 * @property float|null $purchase_height
 * @property float|null $purchase_length
 * @property bool $is_preferred
 * @property bool $is_active
 * @property string|null $notes
 * @property string|null $document_url
 * @property string $change_type
 * @property int|null $changed_by_user_id
 * @property string|null $change_reason
 * @property \Carbon\Carbon $changed_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class SupplierProductOfferHistory extends Model
{
    use HasFactory;

    protected $table = 'supplier_product_offer_history';

    protected $fillable = [
        'supplier_product_offer_id',
        'supplier_id',
        'product_variant_id',
        'cost',
        'purchase_unit_id',
        'purchase_width',
        'purchase_height',
        'purchase_length',
        'is_preferred',
        'is_active',
        'notes',
        'document_url',
        'change_type',
        'changed_by_user_id',
        'change_reason',
        'changed_at',
    ];

    protected $casts = [
        'cost' => 'decimal:4',
        'purchase_width' => 'decimal:4',
        'purchase_height' => 'decimal:4',
        'purchase_length' => 'decimal:4',
        'is_preferred' => 'boolean',
        'is_active' => 'boolean',
        'changed_at' => 'datetime',
    ];

    /**
     * Relación con la oferta original
     */
    public function supplierProductOffer(): BelongsTo
    {
        return $this->belongsTo(SupplierProductOffer::class);
    }

    /**
     * Relación con el proveedor (snapshot)
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Relación con la variante de producto (snapshot)
     */
    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Relación con la unidad de medida (snapshot)
     */
    public function purchaseUnit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'purchase_unit_id');
    }

    /**
     * Usuario que realizó el cambio
     */
    public function changedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    /**
     * Scope para filtrar por tipo de cambio
     */
    public function scopeOfType($query, string $changeType)
    {
        return $query->where('change_type', $changeType);
    }

    /**
     * Scope para cambios recientes (últimos N días)
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('changed_at', '>=', now()->subDays($days));
    }
}
