<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * AttributeValue Model
 * 
 * Representa un valor específico de un atributo.
 * Ejemplos: "5mm", "Transparente", "Pino", "Anodizado"
 */
class AttributeValue extends Model
{
    protected $fillable = [
        'attribute_id',
        'value'
    ];

    /**
     * Atributo al que pertenece este valor.
     * 
     * @return BelongsTo
     */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    /**
     * Variantes de productos que tienen este valor de atributo.
     * 
     * @return BelongsToMany
     */
    public function productVariants(): BelongsToMany
    {
        return $this->belongsToMany(ProductVariant::class, 'product_attribute_values');
    }
}
