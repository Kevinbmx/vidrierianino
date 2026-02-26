<?php

namespace App\Services;

use App\Models\SupplierProductOffer;
use App\Models\SupplierProductOfferHistory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * SupplierProductOfferService
 * 
 * Gestiona la lógica de negocio para ofertas de proveedores de productos.
 * 
 * Responsabilidades:
 * - CRUD completo de ofertas de proveedores
 * - Cálculo automático de costo base normalizado (costo por m² o metro lineal)
 * - Auditoría automática: registra historial al actualizar ofertas
 * - Comparación de ofertas entre proveedores para un mismo producto
 * 
 * Impacto de Negocio:
 * - Facilita encontrar el proveedor más económico para cada producto
 * - Permite rastrear incrementos de precios y negociar mejores tarifas
 * - Mantiene histórico completo para análisis de tendencias
 */
class SupplierProductOfferService
{
    /**
     * Obtiene todas las ofertas activas con relaciones cargadas.
     * 
     * @return Collection
     */
    public function getAllActiveOffers(): Collection
    {
        return SupplierProductOffer::with([
            'supplier',
            'productVariant.product',
            'purchaseUnit'
        ])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Obtiene las ofertas activas de un producto específico.
     * 
     * Útil para comparar precios entre proveedores al momento de comprar.
     * 
     * @param int $productVariantId
     * @return Collection
     */
    public function getOffersByProductVariant(int $productVariantId): Collection
    {
        return SupplierProductOffer::with([
            'supplier',
            'purchaseUnit'
        ])
            ->where('product_variant_id', $productVariantId)
            ->where('is_active', true)
            ->orderBy('is_preferred', 'desc') // Preferidos primero
            ->get();
    }

    /**
     * Obtiene las ofertas activas de un proveedor específico.
     * 
     * @param int $supplierId
     * @return Collection
     */
    public function getOffersBySupplier(int $supplierId): Collection
    {
        return SupplierProductOffer::with([
            'productVariant.product',
            'purchaseUnit'
        ])
            ->where('supplier_id', $supplierId)
            ->where('is_active', true)
            ->get();
    }

    /**
     * Crea una nueva oferta de proveedor.
     * 
     * Lógica de Negocio:
     * - Si is_preferred es true, desmarca otras ofertas preferidas del mismo proveedor/producto
     * - Registra el evento de creación en el historial
     * 
     * @param array $data
     * @return SupplierProductOffer
     */
    public function createOffer(array $data): SupplierProductOffer
    {
        return DB::transaction(function () use ($data) {
            // Si esta oferta se marca como preferida, desmarcamos las anteriores
            if ($data['is_preferred'] ?? false) {
                $this->unmarkPreferredOffers(
                    $data['product_variant_id'],
                    $data['supplier_id'] ?? null
                );
            }

            $offer = SupplierProductOffer::create($data);

            // Registrar creación en historial
            $this->recordHistory($offer, 'created', $data['changed_by_user_id'] ?? null);

            return $offer->load(['supplier', 'productVariant', 'purchaseUnit']);
        });
    }

    /**
     * Actualiza una oferta existente.
     * 
     * Lógica de Negocio:
     * - Antes de actualizar, guarda snapshot del estado actual en historial
     * - Si se cambia is_preferred, actualiza otras ofertas del mismo producto
     * 
     * @param SupplierProductOffer $offer
     * @param array $data
     * @return SupplierProductOffer
     */
    public function updateOffer(SupplierProductOffer $offer, array $data): SupplierProductOffer
    {
        return DB::transaction(function () use ($offer, $data) {
            // Guardar estado actual en historial antes de modificar
            $this->recordHistory(
                $offer,
                'updated',
                $data['changed_by_user_id'] ?? null,
                $data['change_reason'] ?? null
            );

            // Si se marca como preferida, desmarcar otras
            if (isset($data['is_preferred']) && $data['is_preferred']) {
                $this->unmarkPreferredOffers(
                    $offer->product_variant_id,
                    $offer->supplier_id
                );
            }

            $offer->update($data);

            return $offer->refresh()->load(['supplier', 'productVariant', 'purchaseUnit']);
        });
    }

    /**
     * Desactiva una oferta (soft deactivation).
     * 
     * No elimina el registro, solo lo marca como inactivo para mantener histórico.
     * 
     * @param SupplierProductOffer $offer
     * @param int|null $userId
     * @param string|null $reason
     * @return bool
     */
    public function deactivateOffer(
        SupplierProductOffer $offer,
        ?int $userId = null,
        ?string $reason = null
    ): bool {
        return DB::transaction(function () use ($offer, $userId, $reason) {
            // Registrar desactivación en historial
            $this->recordHistory($offer, 'deactivated', $userId, $reason);

            return $offer->update(['is_active' => false]);
        });
    }

    /**
     * Elimina permanentemente una oferta.
     * 
     * ⚠️ PRECAUCIÓN: Borra el registro y su historial por CASCADE.
     * Solo usar si la oferta fue creada por error.
     * 
     * @param SupplierProductOffer $offer
     * @return bool
     */
    public function deleteOffer(SupplierProductOffer $offer): bool
    {
        return $offer->delete();
    }

    /**
     * Obtiene el historial completo de cambios de una oferta.
     * 
     * @param int $offerId
     * @return Collection
     */
    public function getOfferHistory(int $offerId): Collection
    {
        return SupplierProductOfferHistory::where('supplier_product_offer_id', $offerId)
            ->with(['supplier', 'productVariant', 'purchaseUnit', 'changedByUser'])
            ->orderBy('changed_at', 'desc')
            ->get();
    }

    /**
     * Compara ofertas de diferentes proveedores para un mismo producto.
     * 
     * Retorna array ordenado por costo base normalizado (menor a mayor).
     * El costo base se calcula como costo / área_o_longitud según el tipo de producto.
     * 
     * Impacto de Negocio:
     * - Permite identificar rápidamente el proveedor más económico
     * - Facilita decisiones de compra basadas en datos objetivos
     * 
     * @param int $productVariantId
     * @return Collection
     */
    public function compareOffersByPrice(int $productVariantId): Collection
    {
        $offers = $this->getOffersByProductVariant($productVariantId);

        // Calcular costo base normalizado para cada oferta
        $offers = $offers->map(function ($offer) {
            $offer->base_unit_cost = $this->calculateBaseUnitCost($offer);
            return $offer;
        });

        // Ordenar por costo base (menor a mayor)
        return $offers->sortBy('base_unit_cost')->values();
    }

    /**
     * Calcula el costo base normalizado por unidad (m² o metro lineal).
     * 
     * Lógica:
     * - Para productos planos (vidrio): costo / (ancho × alto) = costo por m²
     * - Para productos lineales (perfiles): costo / largo = costo por metro lineal
     * - Si no hay dimensiones: retorna el costo directo
     * 
     * Unidades esperadas: Dimensiones en metros, retorna costo por m² o m
     * 
     * @param SupplierProductOffer $offer
     * @return float
     */
    protected function calculateBaseUnitCost(SupplierProductOffer $offer): float
    {
        // Si tiene ancho y alto, es un producto plano (costo por m²)
        if ($offer->purchase_width && $offer->purchase_height) {
            $area = bcmul((string) $offer->purchase_width, (string) $offer->purchase_height, 4);
            if (bccomp($area, '0', 4) > 0) {
                return (float) bcdiv((string) $offer->cost, $area, 4);
            }
        }

        // Si solo tiene largo, es un producto lineal (costo por metro)
        if ($offer->purchase_length) {
            if (bccomp((string) $offer->purchase_length, '0', 4) > 0) {
                return (float) bcdiv((string) $offer->cost, (string) $offer->purchase_length, 4);
            }
        }

        // Si no hay dimensiones, retorna el costo directo
        return (float) $offer->cost;
    }

    /**
     * Desmarca todas las ofertas preferidas de un producto (excepto la del supplier especificado).
     * 
     * Lógica de Negocio:
     * Solo puede haber una oferta preferida activa por producto variant.
     * 
     * @param int $productVariantId
     * @param int|null $exceptSupplierId
     * @return void
     */
    protected function unmarkPreferredOffers(int $productVariantId, ?int $exceptSupplierId = null): void
    {
        $query = SupplierProductOffer::where('product_variant_id', $productVariantId)
            ->where('is_preferred', true)
            ->where('is_active', true);

        if ($exceptSupplierId) {
            $query->where('supplier_id', '!=', $exceptSupplierId);
        }

        $query->update(['is_preferred' => false]);
    }

    /**
     * Registra un cambio en el historial de la oferta.
     * 
     * @param SupplierProductOffer $offer
     * @param string $changeType
     * @param int|null $userId
     * @param string|null $reason
     * @return void
     */
    protected function recordHistory(
        SupplierProductOffer $offer,
        string $changeType,
        ?int $userId = null,
        ?string $reason = null
    ): void {
        SupplierProductOfferHistory::create([
            'supplier_product_offer_id' => $offer->id,
            'supplier_id' => $offer->supplier_id,
            'product_variant_id' => $offer->product_variant_id,
            'cost' => $offer->cost,
            'purchase_unit_id' => $offer->purchase_unit_id,
            'purchase_width' => $offer->purchase_width,
            'purchase_height' => $offer->purchase_height,
            'purchase_length' => $offer->purchase_length,
            'is_preferred' => $offer->is_preferred,
            'is_active' => $offer->is_active,
            'notes' => $offer->notes,
            'document_url' => $offer->document_url,
            'change_type' => $changeType,
            'changed_by_user_id' => $userId,
            'change_reason' => $reason,
            'changed_at' => now(),
        ]);
    }
}
