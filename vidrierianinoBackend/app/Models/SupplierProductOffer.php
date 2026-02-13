<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * SupplierProductOffer Model
 * 
 * Representa una oferta comercial específica de un proveedor para una variante de producto.
 * 
 * Lógica de Negocio Vidriería Nino:
 * - Permite comparar proveedores que venden el mismo material en diferentes formatos.
 * - Calcula automáticamente el "base_unit_cost" (costo normalizado por m² o metro lineal)
 *   para identificar la oferta más económica.
 * 
 * Ejemplo Real:
 * Vidrio Float 5mm
 * - Proveedor A: plancha 2.14x3.30m a $15,000 → base_unit_cost = $2,124.25/m²
 * - Proveedor B: plancha 2.00x3.00m a $12,000 → base_unit_cost = $2,000.00/m² ← Mejor
 */
class SupplierProductOffer extends Model
{
    protected $fillable = [
        'supplier_id',
        'product_variant_id',
        'cost',
        'purchase_unit_id',
        'purchase_width',
        'purchase_height',
        'purchase_length',
        'is_preferred',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'cost' => 'decimal:4',
        'purchase_width' => 'decimal:4',
        'purchase_height' => 'decimal:4',
        'purchase_length' => 'decimal:4',
        'is_preferred' => 'boolean',
        'is_active' => 'boolean',
    ];

    // ========== RELACIONES ==========

    /**
     * Proveedor que ofrece este producto.
     * 
     * @return BelongsTo
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Variante de producto ofrecida.
     * 
     * @return BelongsTo
     */
    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Unidad de medida en la que el proveedor vende.
     * 
     * @return BelongsTo
     */
    public function purchaseUnit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'purchase_unit_id');
    }

    // ========== ATRIBUTOS CALCULADOS (ACCESSORS) ==========

    /**
     * Calcula el costo por unidad base según las dimensiones físicas.
     * 
     * Impacto en el negocio: Permite comparar proveedores que venden
     * en diferentes formatos normalizando a la misma unidad de medida.
     * 
     * Lógica de cálculo:
     * - Área (m²): costo / (ancho * alto)
     * - Longitud (metro lineal): costo / largo
     * - Unidad: costo / 1 (sin normalización)
     * 
     * Usa bcmath para precisión decimal exacta.
     * 
     * @return Attribute
     */
    protected function baseUnitCost(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Si no hay unidad de compra cargada, retornar el costo directo
                if (!$this->purchaseUnit) {
                    return $this->cost;
                }

                // Caso 1: Unidad de ÁREA (m²)
                if ($this->purchaseUnit->isArea() && $this->purchase_width && $this->purchase_height) {
                    $area = bcmul((string) $this->purchase_width, (string) $this->purchase_height, 4);

                    // Evitar división por cero
                    if (bccomp($area, '0', 4) === 0) {
                        return $this->cost;
                    }

                    return bcdiv((string) $this->cost, $area, 4);
                }

                // Caso 2: Unidad de LONGITUD (metro lineal)
                if ($this->purchaseUnit->isLength() && $this->purchase_length) {
                    // Evitar división por cero
                    if (bccomp((string) $this->purchase_length, '0', 4) === 0) {
                        return $this->cost;
                    }

                    return bcdiv((string) $this->cost, (string) $this->purchase_length, 4);
                }

                // Caso 3: Unidad SIMPLE (ej: tornillos, paquetes)
                // El costo ya es por unidad, no requiere normalización
                return $this->cost;
            }
        );
    }

    /**
     * Calcula el área total de la plancha/pieza (si aplica).
     * 
     * Impacto: Útil para calcular rendimiento y desperdicio.
     * 
     * @return Attribute
     */
    protected function totalArea(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->purchase_width && $this->purchase_height) {
                    return bcmul((string) $this->purchase_width, (string) $this->purchase_height, 4);
                }
                return null;
            }
        );
    }

    // ========== SCOPES ==========

    /**
     * Scope para obtener solo ofertas activas.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para obtener solo ofertas preferidas.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePreferred($query)
    {
        return $query->where('is_preferred', true);
    }

    // ========== MÉTODOS DE NEGOCIO ==========

    /**
     * Marca esta oferta como preferida y desmarca las demás del mismo variant.
     * 
     * Impacto: Facilita la selección rápida del proveedor predeterminado.
     * 
     * @return void
     */
    public function markAsPreferred(): void
    {
        // Desmarcar todas las ofertas de esta variante
        static::where('product_variant_id', $this->product_variant_id)
            ->update(['is_preferred' => false]);

        // Marcar esta como preferida
        $this->update(['is_preferred' => true]);
    }
}
