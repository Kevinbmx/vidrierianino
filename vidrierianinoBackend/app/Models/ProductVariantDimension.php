<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariantDimension extends Model
{
    protected $fillable = [
        'product_variant_id',
        'name',
        'width',
        'height',
        'length',
        'weight',
        'is_default'
    ];

    protected $casts = [
        'width' => 'decimal:4',
        'height' => 'decimal:4',
        'length' => 'decimal:4',
        'weight' => 'decimal:4',
        'is_default' => 'boolean',
    ];

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
