<?php

namespace App\Actions;

use App\Models\ProductVariant;
use App\Models\SupplierProductOffer;

/**
 * CalculateBestOfferAction
 * 
 * Action para encontrar la oferta de proveedor con el menor costo base.
 * 
 * Lógica de Negocio Vidriería Nino:
 * Compara proveedores que venden en diferentes formatos (ej: planchas de
 * distintos tamaños) normalizando al costo por unidad base (m² o metro lineal).
 * 
 * Ejemplo:
 * - Proveedor A: plancha 2.14x3.30m a $15,000 → $2,124/m²
 * - Proveedor B: plancha 2.00x3.00m a $12,000 → $2,000/m² ← Mejor oferta
 * 
 * Impacto: Permite identificar automáticamente el proveedor más económico.
 */
class CalculateBestOfferAction
{
    /**
     * Ejecuta la acción.
     * 
     * @param ProductVariant $variant
     * @return SupplierProductOffer|null La oferta con menor base_unit_cost
     */
    public function execute(ProductVariant $variant): ?SupplierProductOffer
    {
        // Obtener todas las ofertas activas de esta variante
        $offers = $variant->supplierOffers()
            ->active()
            ->with(['purchaseUnit', 'supplier'])
            ->get();

        // Si no hay ofertas, retornar null
        if ($offers->isEmpty()) {
            return null;
        }

        // Ordenar por base_unit_cost (calculado en el accessor del modelo)
        // y retornar la primera (la más económica)
        return $offers->sortBy(function ($offer) {
            return $offer->base_unit_cost;
        })->first();
    }

    /**
     * Ejecuta la acción y retorna solo el costo base.
     * 
     * @param ProductVariant $variant
     * @return string|null Costo base normalizado (formato decimal con 4 decimales)
     */
    public function executeForCost(ProductVariant $variant): ?string
    {
        $bestOffer = $this->execute($variant);

        return $bestOffer ? $bestOffer->base_unit_cost : null;
    }
}
