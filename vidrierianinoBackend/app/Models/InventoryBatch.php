<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * InventoryBatch Model
 * 
 * Representa un lote específico de material en inventario con sus dimensiones reales.
 * Fundamental para el optimizador de cortes, ya que rastrea qué recursos físicos existen.
 */
class InventoryBatch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_variant_id',
        'purchase_order_id',
        'warehouse_zone_id',
        'batch_code',
        'physical_quantity',
        'dimensions', // JSON
        'status' // available, reserved, consumed, quarantine
    ];

    protected $casts = [
        'physical_quantity' => 'decimal:4',
        'dimensions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ========== RELACIONES ==========

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function warehouseZone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class);
    }

    // ========== SCOPES ==========

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
            ->where('physical_quantity', '>', 0);
    }

    // ========== MÉTODOS DE NEGOCIO ==========

    /**
     * Obtiene el ancho y alto desde el campo JSON dimensions.
     * Útil si el producto es de tipo ÁREA (vidrio/aluminio).
     */
    public function getDimensionsAttribute(): array|null
    {
        // En Laravel los atributos JSON se decodifican automáticamente si están en $casts
        // Pero aquí sobreescribimos para asegurar estructura o validación si se desea
        $dims = $this->attributes['dimensions'] ?? null;
        if (is_string($dims)) {
            return json_decode($dims, true);
        }
        return $dims;
    }
}
