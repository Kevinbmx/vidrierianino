<?php

namespace App\Services;

use App\Models\UnitOfMeasure;
use App\Models\ProductVariant;

/**
 * UOMConversionService
 * 
 * Maneja conversiones entre unidades de medida.
 * 
 * Impacto en el negocio: Permite normalizar precios de diferentes proveedores
 * que venden el mismo material en diferentes formatos (planchas vs m², barras vs ml).
 */
class UOMConversionService
{
    /**
     * Convierte cantidad de unidad de compra a unidad de venta.
     * 
     * Ejemplo: 2 planchas de 2.14x3.30 = 2 * 7.062 = 14.124 m²
     * 
     * Unidades esperadas: según conversion_factor del variant
     * Devuelve: cantidad en unidad de venta (bcmath para precisión)
     * 
     * @param ProductVariant $variant
     * @param string $purchaseQuantity Cantidad en unidad de compra
     * @return string Cantidad en unidad de venta
     */
    public function convertPurchaseToSale(ProductVariant $variant, string $purchaseQuantity): string
    {
        return bcmul($purchaseQuantity, (string) $variant->conversion_factor, 4);
    }

    /**
     * Convierte cantidad de unidad de venta a unidad de compra.
     * 
     * Ejemplo: Cliente pide 10.5 m² de vidrio.
     * Plancha rinde 7.062 m² → 10.5 / 7.062 = 1.487 planchas
     * 
     * @param ProductVariant $variant
     * @param string $saleQuantity Cantidad en unidad de venta
     * @return string Cantidad en unidad de compra
     */
    public function convertSaleToPurchase(ProductVariant $variant, string $saleQuantity): string
    {
        return bcdiv($saleQuantity, (string) $variant->conversion_factor, 4);
    }

    /**
     * Calcula cuántas unidades de compra se necesitan (redondeado hacia arriba).
     * 
     * Impacto: Evita desperdicio al calcular paquetes/planchas exactas necesarias.
     * 
     * Ejemplo: Cliente pide 10.5 m² → Se necesitan 2 planchas (no se puede comprar 1.487)
     * 
     * @param ProductVariant $variant
     * @param string $requiredSaleQuantity Cantidad requerida en unidad de venta
     * @return int Unidades de compra necesarias (redondeado hacia arriba)
     */
    public function calculateRequiredPurchaseUnits(ProductVariant $variant, string $requiredSaleQuantity): int
    {
        $purchaseUnits = $this->convertSaleToPurchase($variant, $requiredSaleQuantity);
        return (int) ceil((float) $purchaseUnits);
    }

    /**
     * Calcula el desperdicio al comprar unidades completas.
     * 
     * Impacto: Permite informar al cliente sobre material sobrante
     * o calcular costos reales incluyendo desperdicio.
     * 
     * Unidades: en unidad de venta
     * 
     * @param ProductVariant $variant
     * @param string $requiredSaleQuantity Cantidad requerida
     * @return string Material sobrante en unidad de venta
     */
    public function calculateWaste(ProductVariant $variant, string $requiredSaleQuantity): string
    {
        $requiredPurchaseUnits = $this->calculateRequiredPurchaseUnits($variant, $requiredSaleQuantity);
        $totalMaterialPurchased = $this->convertPurchaseToSale($variant, (string) $requiredPurchaseUnits);

        return bcsub($totalMaterialPurchased, $requiredSaleQuantity, 4);
    }

    /**
     * Calcula el costo total de compra incluyendo desperdicio.
     * 
     * Impacto: Muestra al cliente el costo real considerando que
     * debe comprar unidades completas (planchas, paquetes, barras).
     * 
     * @param ProductVariant $variant
     * @param string $requiredSaleQuantity
     * @return string Costo total en pesos
     */
    public function calculateTotalPurchaseCost(ProductVariant $variant, string $requiredSaleQuantity): string
    {
        $requiredPurchaseUnits = $this->calculateRequiredPurchaseUnits($variant, $requiredSaleQuantity);

        return bcmul((string) $requiredPurchaseUnits, (string) $variant->cost, 4);
    }

    /**
     * Compara costos entre dos variantes del mismo producto de diferentes proveedores.
     * 
     * Impacto: Permite elegir el proveedor más económico normalizando
     * a la misma unidad de medida.
     * 
     * @param ProductVariant $variant1
     * @param ProductVariant $variant2
     * @param string $requiredQuantity En unidad de venta
     * @return array ['variant1_cost', 'variant2_cost', 'cheaper_variant']
     */
    public function compareProviderCosts(ProductVariant $variant1, ProductVariant $variant2, string $requiredQuantity): array
    {
        $cost1 = $this->calculateTotalPurchaseCost($variant1, $requiredQuantity);
        $cost2 = $this->calculateTotalPurchaseCost($variant2, $requiredQuantity);

        return [
            'variant1_cost' => $cost1,
            'variant1_waste' => $this->calculateWaste($variant1, $requiredQuantity),
            'variant2_cost' => $cost2,
            'variant2_waste' => $this->calculateWaste($variant2, $requiredQuantity),
            'cheaper_variant' => bccomp($cost1, $cost2, 4) <= 0 ? 'variant1' : 'variant2',
            'savings' => bcsub(max($cost1, $cost2), min($cost1, $cost2), 4),
        ];
    }
}
