<?php

namespace App\Actions;

use App\Models\ProductVariant;

/**
 * CalculateFinalPriceAction
 * 
 * Action para calcular el precio final de venta según el modo de pricing.
 * 
 * Lógica de Negocio Vidriería Nino:
 * - FIXED mode: Retorna el precio manual definido
 * - MARKUP mode: Calcula dinámicamente basado en el mejor costo de proveedor
 *   final_price = best_offer_cost * (1 + markup_percentage/100)
 * 
 * Ejemplo MARKUP con 35%:
 * - Mejor oferta: $2,000/m²
 * - Markup: 35%
 * - final_price = $2,000 * 1.35 = $2,700/m²
 * 
 * Usa bcmath para precisión decimal exacta (importante para cálculos de dinero).
 */
class CalculateFinalPriceAction
{
    public function __construct(
        private CalculateBestOfferAction $bestOfferAction
    ) {
    }

    /**
     * Ejecuta la acción.
     * 
     * @param ProductVariant $variant
     * @return string Precio final (formato decimal con 4 decimales)
     */
    public function execute(ProductVariant $variant): string
    {
        // Modo FIXED: Usar precio manual
        if ($variant->pricing_mode === 'fixed') {
            return (string) $variant->price;
        }

        // Modo MARKUP: Calcular sobre el mejor costo de proveedor
        $bestOffer = $this->bestOfferAction->execute($variant);

        // Si no hay ofertas activas, usar precio fijo como fallback
        if (!$bestOffer) {
            return (string) ($variant->price ?? '0.0000');
        }

        // Calcular markup usando bcmath para precisión exacta
        // markup_multiplier = 1 + (markup_percentage / 100)
        $markupMultiplier = bcadd(
            '1.00',
            bcdiv((string) ($variant->markup_percentage ?? 0), '100', 4),
            4
        );

        // final_price = base_cost * multiplier
        return bcmul((string) $bestOffer->base_unit_cost, $markupMultiplier, 4);
    }

    /**
     * Calcula y retorna el desglose del precio (útil para reportes).
     * 
     * @param ProductVariant $variant
     * @return array ['mode', 'base_cost', 'markup_percentage', 'final_price', 'supplier_name']
     */
    public function executeWithBreakdown(ProductVariant $variant): array
    {
        $finalPrice = $this->execute($variant);

        // Obtener información del proveedor si es modo markup
        $bestOffer = null;
        $supplierName = null;

        if ($variant->pricing_mode === 'markup') {
            $bestOffer = $this->bestOfferAction->execute($variant);
            $supplierName = $bestOffer?->supplier->name ?? 'Sin proveedor';
        }

        return [
            'mode' => $variant->pricing_mode,
            'base_cost' => $bestOffer?->base_unit_cost ?? null,
            'markup_percentage' => $variant->markup_percentage,
            'final_price' => $finalPrice,
            'supplier_name' => $supplierName,
        ];
    }
}
