<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * ProductVariant Model (REFACTORED for Flexible Pricing)
 * 
 * Representa un SKU específico con:
 * - Precio flexible: modo 'fixed' (manual) o 'markup' (% sobre mejor oferta)
 * - Relación con múltiples ofertas de proveedores (SupplierProductOffer)
 * - Cálculo dinámico de precio final según el modo configurado
 * 
 * Ejemplo de Pricing Modes:
 * - FIXED: price = $2,500/m² (definido manualmente)
 * - MARKUP 35%: final_price = mejor_oferta_cost * 1.35 = $2,000 * 1.35 = $2,700/m²
 * 
 * Impacto en el negocio: Flexibilidad total para definir precios de venta
 * ya sea fijos o dinámicos basados en el costo real de proveedores.
 */
class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'price',              // Precio fijo (usado solo si pricing_mode = 'fixed')
        'sale_unit_id',
        'pricing_mode',       // 'fixed' | 'markup'
        'markup_percentage',  // Porcentaje de ganancia (ej: 35.00 = 35%)
        'stock_quantity',
        'min_stock',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:4',
        'markup_percentage' => 'decimal:2',
        'stock_quantity' => 'integer',
        'min_stock' => 'integer',
        'is_active' => 'boolean',
    ];

    // ========== RELACIONES ==========

    /**
     * Producto al que pertenece esta variante.
     * 
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Ofertas de proveedores para esta variante.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function supplierOffers()
    {
        return $this->hasMany(SupplierProductOffer::class);
    }

    /**
     * Unidad de medida de venta.
     * 
     * @return BelongsTo
     */
    public function saleUnit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'sale_unit_id');
    }

    /**
     * Valores de atributos asignados a esta variante.
     * 
     * @return BelongsToMany
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values');
    }

    /**
     * Calcula el precio final de venta según el modo de pricing.
     * 
     * Lógica de Negocio Vidriería Nino:
     * - FIXED mode: Retorna el precio manual definido en el campo 'price'
     * - MARKUP mode: Calcula precio sobre el mejor costo de proveedor
     *   final_price = best_offer_base_cost * (1 + markup_percentage/100)
     * 
     * Ejemplo MARKUP con 35%:
     * - Mejor oferta: $2,000/m²
     * - final_price = $2,000 * 1.35 = $2,700/m²
     * 
     * Usa bcmath para precisión decimal exacta.
     * 
     * @return Attribute
     */
    protected function finalPrice(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Modo FIXED: Usar precio manual
                if ($this->pricing_mode === 'fixed') {
                    return $this->price;
                }

                // Modo MARKUP: Calcular sobre el mejor costo de proveedor
                // Obtener la oferta con menor base_unit_cost
                $bestOffer = $this->supplierOffers()
                    ->active()
                    ->with('purchaseUnit')
                    ->get()
                    ->sortBy(fn($offer) => $offer->base_unit_cost)
                    ->first();

                // Si no hay ofertas activas, usar precio fijo como fallback
                if (!$bestOffer) {
                    return $this->price ?? '0.0000';
                }

                // Calcular markup: final_price = base_cost * (1 + markup_percentage/100)
                $markupMultiplier = bcadd(
                    '1.00',
                    bcdiv((string) ($this->markup_percentage ?? 0), '100', 4),
                    4
                );

                return bcmul((string) $bestOffer->base_unit_cost, $markupMultiplier, 4);
            }
        );
    }

    // ========== MÉTODOS DE NEGOCIO ==========

    /**
     * Verifica si hay stock disponible.
     * 
     * @return bool
     */
    public function hasStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Verifica si está bajo el stock mínimo.
     * 
     * Impacto: Permite generar alertas de reabastecimiento.
     * 
     * @return bool
     */
    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->min_stock;
    }


    /**
     * Obtiene la mejor oferta activa (menor base_unit_cost).
     * 
     * Impacto en el negocio: Facilita la identificación del proveedor
     * más económico para compras y cálculos de pricing markup.
     * 
     * @return SupplierProductOffer|null
     */
    public function getBestOffer(): ?SupplierProductOffer
    {
        return $this->supplierOffers()
            ->active()
            ->with(['purchaseUnit', 'supplier'])
            ->get()
            ->sortBy(fn($offer) => $offer->base_unit_cost)
            ->first();
    }

    /**
     * Verifica si el producto usa pricing mode 'markup'.
     * 
     * @return bool
     */
    public function usesMarkupPricing(): bool
    {
        return $this->pricing_mode === 'markup';
    }

    /**
     * Verifica si el producto usa pricing mode 'fixed'.
     * 
     * @return bool
     */
    public function usesFixedPricing(): bool
    {
        return $this->pricing_mode === 'fixed';
    }
}
