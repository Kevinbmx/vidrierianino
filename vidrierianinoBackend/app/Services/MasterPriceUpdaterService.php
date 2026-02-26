<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\SupplierProductOffer;
use App\Models\SupplierProductOfferHistory;
use Illuminate\Support\Facades\DB;

class MasterPriceUpdaterService
{
    /**
     * Sincroniza los precios del PO con el catálogo maestro.
     * Se ejecuta SOLAMENTE cuando se genera/confirma una Purchase Order.
     * 
     * @param PurchaseOrder $po
     * @return void
     */
    public function syncFromPurchaseOrder(PurchaseOrder $po): void
    {
        DB::transaction(function () use ($po) {
            foreach ($po->items as $item) {
                // Datos del precio ganador
                $supplierId = $po->supplier_id;
                $variantId = $item->product_variant_id;
                $unitId = $item->unit_id;
                $newCost = $item->unit_price;

                // Buscar oferta existente
                $offer = SupplierProductOffer::where('supplier_id', $supplierId)
                    ->where('product_variant_id', $variantId)
                    ->where('purchase_unit_id', $unitId)
                    ->first();

                if ($offer) {
                    // Actualizar existente
                    $oldCost = $offer->cost;

                    if ($oldCost != $newCost) {
                        // Registrar cambio en historial
                        SupplierProductOfferHistory::create([
                            'supplier_product_offer_id' => $offer->id,
                            'cost' => $newCost,
                            'is_preferred' => true,
                            'changed_at' => now(),
                            'changed_by' => auth()->id() ?? $po->created_by,
                            'change_reason' => "Actualización automática desde Orden de Compra #{$po->code}",
                            'change_type' => 'updated'
                        ]);
                    }

                    // Actualizar precio maestro
                    $offer->cost = $newCost;
                    $offer->is_preferred = true;
                    $offer->save();

                } else {
                    // Crear nueva oferta en catálogo maestro
                    $newOffer = SupplierProductOffer::create([
                        'supplier_id' => $supplierId,
                        'product_variant_id' => $variantId,
                        'purchase_unit_id' => $unitId,
                        'cost' => $newCost,
                        'is_preferred' => true,
                        'is_active' => true,
                        'notes' => "Creada automáticamente desde Orden de Compra #{$po->code}"
                    ]);

                    // Registro inicial en historial
                    SupplierProductOfferHistory::create([
                        'supplier_product_offer_id' => $newOffer->id,
                        'cost' => $newCost,
                        'is_preferred' => true,
                        'changed_at' => now(),
                        'changed_by' => auth()->id() ?? $po->created_by,
                        'change_reason' => "Precio inicial desde Orden de Compra #{$po->code}",
                        'change_type' => 'created'
                    ]);
                }

                // Opcional: Desmarcar otras ofertas como preferidas
                // (Si solo quieres UN preferido por producto)
                // SupplierProductOffer::where('product_variant_id', $variantId)
                //     ->where('id', '!=', $offer?->id ?? $newOffer->id)
                //     ->update(['is_preferred' => false]);
            }
        });
    }

    /**
     * Verifica si un proveedor puede cotizar ciertos ítems.
     * Útil para validación antes de envío.
     * 
     * @param int $supplierId
     * @param array $productVariantIds
     * @return array IDs de variantes que SÍ puede cotizar
     */
    public function getAvailableVariantsForSupplier(int $supplierId, array $productVariantIds): array
    {
        return SupplierProductOffer::where('supplier_id', $supplierId)
            ->whereIn('product_variant_id', $productVariantIds)
            ->where('is_active', true)
            ->pluck('product_variant_id')
            ->toArray();
    }
}
