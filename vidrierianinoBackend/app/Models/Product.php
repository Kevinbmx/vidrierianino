<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Product Model
 * 
 * Entidad general de producto (ej: "Vidrio Float", "Varilla Madera Pino").
 * Las variaciones específicas (SKUs con precios y dimensiones) están en ProductVariant.
 * 
 * Impacto en el negocio: Permite agrupar variantes del mismo material
 * (ej: Float de 5mm y 6mm) bajo un mismo producto.
 */
class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Categoría del producto.
     * 
     * @return BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Variantes (SKUs) del producto.
     * 
     * @return HasMany
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Variantes activas del producto.
     * 
     * @return HasMany
     */
    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    /**
     * Verifica si el producto tiene stock disponible en alguna variante.
     * 
     * @return bool
     */
    public function hasStock(): bool
    {
        return $this->variants()->where('stock_quantity', '>', 0)->exists();
    }

    /**
     * Obtiene la variante con el precio más bajo.
     * 
     * Impacto: Útil para mostrar "desde $X" en listados de productos.
     * 
     * @return ProductVariant|null
     */
    public function cheapestVariant(): ?ProductVariant
    {
        return $this->variants()
            ->where('is_active', true)
            ->orderBy('price', 'asc')
            ->first();
    }
}
