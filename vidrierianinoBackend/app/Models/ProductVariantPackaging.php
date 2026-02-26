<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProductVariantPackaging Model
 * 
 * Define las formas de compra/empaque para una variante.
 * Ej: "Caja" = 30 unidades.
 * 
 * Lógica de Negocio:
 * - Se usa en RFQ para que el proveedor cotice por "Caja" y el sistema sepa cuántas unidades entran.
 * - Se usa en Recepción de Mercadería para convertir empaques a stock unitario.
 */
class ProductVariantPackaging extends Model
{
    protected $fillable = [
        'product_variant_id',
        'name',
        'quantity',
        'description',
        'is_default_purchase'
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'is_default_purchase' => 'boolean',
    ];

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
