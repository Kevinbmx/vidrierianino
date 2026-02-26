<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SupplierResource
 *
 * Transforma el modelo Supplier en respuesta JSON para la API.
 *
 * Los datos de contacto (teléfono, email, persona) ahora
 * viven en supplier_contacts y supplier_branches — no en este recurso.
 */
class SupplierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            // ── Datos de la empresa ──────────────────────────────────────
            'id' => $this->id,
            'name' => $this->name,
            'rif' => $this->rif,
            'payment_terms' => $this->payment_terms,
            'website' => $this->website,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),

            // ── Conteo ───────────────────────────────────────────────────
            'offers_count' => $this->whenCounted('productOffers'),

            // ── Contacto principal (acceso rápido para listados / RFQs) ──
            // Cargado solo cuando se hace ->load('contacts') o ->with('contacts')
            // ── Ofertas de productos (solo en show) ───────────────────────
            'primary_contact' => $this->when(
                $this->relationLoaded('contacts'),
                fn() => $this->contacts->firstWhere('is_primary', true)?->only([
                    'id',
                    'name',
                    'role',
                    'phone',
                    'email',
                ])
            ),

            'main_branch' => $this->when(
                $this->relationLoaded('branches'),
                fn() => $this->branches->firstWhere('is_main', true)?->only([
                    'id',
                    'name',
                    'address',
                    'city',
                ])
            ),

            // ── Ofertas de productos (solo en show) ───────────────────────
            'product_offers' => $this->when(
                $this->relationLoaded('productOffers'),
                fn() => $this->productOffers->map(fn($offer) => [
                    'id' => $offer->id,
                    'is_preferred' => $offer->is_preferred,
                    'base_unit_cost' => $offer->base_unit_cost,
                    'notes' => $offer->notes,
                    'variant' => [
                        'id' => $offer->productVariant?->id,
                        'sku' => $offer->productVariant?->sku,
                        'name' => $offer->productVariant?->name,
                        'sale_unit_abbr' => $offer->productVariant?->saleUnit?->abbreviation,
                        'product' => [
                            'id' => $offer->productVariant?->product?->id,
                            'name' => $offer->productVariant?->product?->name,
                        ],
                    ],
                ])
            ),
        ];
    }
}
