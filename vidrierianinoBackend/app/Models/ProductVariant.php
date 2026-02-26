<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'price',
        'sale_unit_id',
        'width',
        'height',
        'length', // Dimensiones físicas
        'total_dimension', // Cache (m2/ml)
        'pricing_mode',
        'markup_percentage',
        'stock_quantity',
        'min_stock',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:4',
        'width' => 'decimal:4',
        'height' => 'decimal:4',
        'length' => 'decimal:4',
        'total_dimension' => 'decimal:4',
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
     * Dimensiones permitidas/configuradas para esta variante (One-to-Many).
     */
    public function dimensions()
    {
        return $this->hasMany(ProductVariantDimension::class);
    }

    /**
     * Lotes de inventario físico asociados a esta variante.
     * Fuente de verdad para el stock real del sistema.
     *
     * @return HasMany
     */
    public function inventoryBatches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    /**
     * Formas de empaque/compra disponibles (ej: Caja x 30).
     */
    public function packagings()
    {
        return $this->hasMany(ProductVariantPackaging::class);
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

    /**
     * Calcula el stock total abstracto a partir de los inventory_batches activos.
     *
     * Lógica por tipo de unidad de venta:
     * - Área (m²): SUM(physical_quantity * width * height)  → retorna metros cuadrados totales
     * - Longitud (ml): SUM(physical_quantity * length)      → retorna metros lineales totales
     * - Peso (kg): SUM(physical_quantity * weight)          → retorna kg totales
     * - Unidad (pza): SUM(physical_quantity)               → retorna piezas totales
     *
     * Los valores nulos en JSON de dimensiones (accesorios simples) se tratan como 0
     * para evitar errores en productos sin dimensiones configuradas.
     *
     * Usa bcmath para precisión decimal exacta en cálculos de vidriería.
     *
     * @return Attribute Retorna el total en la unidad abstracta correspondiente.
     */
    protected function totalAbstractStock(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Cargar batches activos (available y con qty > 0)
                $activeBatches = $this->inventoryBatches
                    ->filter(fn($b) => $b->status === 'available' && (float) $b->physical_quantity > 0);

                // Obtener el tipo de unidad de venta (area, length, weight, unit)
                $unitType = $this->saleUnit?->type ?? 'unit';

                $total = '0.0000';

                foreach ($activeBatches as $batch) {
                    $qty = (string) ($batch->physical_quantity ?? 0);
                    $dims = is_array($batch->dimensions) ? $batch->dimensions : [];

                    if ($unitType === 'area') {
                        // m² = physical_quantity * width * height
                        $width  = (string) ($dims['width']  ?? 0);
                        $height = (string) ($dims['height'] ?? 0);
                        $area   = bcmul($width, $height, 4);
                        $total  = bcadd($total, bcmul($qty, $area, 4), 4);

                    } elseif ($unitType === 'length') {
                        // ml = physical_quantity * length
                        $length = (string) ($dims['length'] ?? 0);
                        $total  = bcadd($total, bcmul($qty, $length, 4), 4);

                    } elseif ($unitType === 'weight') {
                        // kg = physical_quantity * weight
                        $weight = (string) ($dims['weight'] ?? 0);
                        $total  = bcadd($total, bcmul($qty, $weight, 4), 4);

                    } else {
                        // Unidades simples: solo sumar physical_quantity
                        $total = bcadd($total, $qty, 4);
                    }
                }

                return $total;
            }
        );
    }

    /**
     * Calcula la valorización total del inventario de esta variante.
     *
     * Fórmula: total_abstract_stock * mejor_costo_proveedor
     *
     * Si no hay ofertas de proveedor disponibles, usa el precio de venta como fallback
     * para dar una estimación conservadora del valor en stock.
     *
     * Impacto en el negocio: Permite calcular el valor monetario total del inventario
     * y detectar el costo de capital inmovilizado.
     *
     * @return Attribute Retorna el total valorizado en la moneda local.
     */
    protected function inventoryValuation(): Attribute
    {
        return Attribute::make(
            get: function () {
                $stock = $this->total_abstract_stock ?? '0.0000';

                // Usar el mejor costo de proveedor si está disponible
                $bestOffer = $this->inventoryBatches
                    ->whereIn('status', ['available'])
                    ->first();

                // Obtener costo base: intentar desde el mejor offer, fallback al precio de venta
                $cost = '0.0000';
                if ($this->relationLoaded('supplierOffers')) {
                    $cheapestOffer = $this->supplierOffers
                        ->where('is_active', true)
                        ->sortBy(fn($o) => (float) $o->base_unit_cost)
                        ->first();
                    if ($cheapestOffer) {
                        $cost = (string) $cheapestOffer->base_unit_cost;
                    }
                }

                // Fallback al precio de venta si no hay costo de proveedor
                if ($cost === '0.0000' && $this->price) {
                    $cost = (string) $this->price;
                }

                return bcmul((string) $stock, $cost, 4);
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
