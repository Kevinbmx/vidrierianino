<?php

namespace App\Services;

use App\Models\QuotationRequest;
use App\Models\QuotationRequestItem;
use App\Models\QuotationRequestSupplier;
use App\Models\QuotationResponse;
use App\Models\SupplierProductOffer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RFQDistributionService
{
    /**
     * Distribuye una RFQ Padre en múltiples RFQs Hijas, una por proveedor.
     * Filtra automáticamente los ítems según supplier_product_offers.
     * 
     * @param QuotationRequest $parent RFQ Padre (debe ser parent_id NULL)
     * @param array $supplierItemMatrix ['supplier_id' => [item_ids]] Matriz de selección
     * @param string $channel Canal de envío (whatsapp, email, portal, manual)
     * @return Collection Colección de RFQs hijas creadas
     */
    public function distribute(
        QuotationRequest $parent,
        array $supplierItemMatrix,
        string $channel = 'manual'
    ): Collection {
        // Validar que sea Padre
        if ($parent->parent_id !== null) {
            throw new \Exception("Solo se pueden distribuir RFQs Padre (parent_id = NULL)");
        }

        return DB::transaction(function () use ($parent, $supplierItemMatrix, $channel) {
            $children = collect();
            $childSuffix = 'A'; // A, B, C, ...

            foreach ($supplierItemMatrix as $supplierId => $itemIds) {
                if (empty($itemIds))
                    continue; // Skip si no hay items para este proveedor

                // Generar código hijo: RFQ-100-A, RFQ-100-B, etc.
                $childCode = $parent->code . '-' . $childSuffix;

                // Crear RFQ Hija
                $child = QuotationRequest::create([
                    'code' => $childCode,
                    'parent_id' => $parent->id,
                    'deadline' => $parent->deadline,
                    'status' => 'sent', // Las hijas se crean ya enviadas
                    'comments' => "Generada automáticamente desde {$parent->code}",
                    'created_by' => $parent->created_by
                ]);

                // Copiar ítems filtrados
                $parentItems = $parent->items()->whereIn('id', $itemIds)->get();

                foreach ($parentItems as $parentItem) {
                    $newItem = QuotationRequestItem::create([
                        'quotation_request_id' => $child->id,
                        'product_variant_id' => $parentItem->product_variant_id,
                        'quantity' => $parentItem->quantity,
                        'unit_id' => $parentItem->unit_id,
                        'notes' => $parentItem->notes
                    ]);

                    // Crear registro de respuesta vacío (placeholder)
                    QuotationResponse::create([
                        'quotation_request_id' => $child->id,
                        'quotation_request_item_id' => $newItem->id,
                        'supplier_id' => $supplierId,
                        'unit_price' => null,
                        'currency' => 'BOB'
                    ]);
                }

                // Crear pivote de invitación
                QuotationRequestSupplier::create([
                    'quotation_request_id' => $child->id,
                    'supplier_id' => $supplierId,
                    'status' => 'pending',
                    'submission_channel' => $channel,
                    'sent_at' => now()
                ]);

                $children->push($child);
                $childSuffix++; // Incrementar sufijo (A -> B -> C...)
            }

            // Actualizar estado del Padre
            $parent->update(['status' => 'sent']);

            return $children;
        });
    }

    /**
     * Genera automáticamente la matriz supplier-item basada en supplier_product_offers.
     * Útil para pre-selección inteligente en el Frontend.
     * 
     * @param QuotationRequest $parent
     * @return array ['supplier_id' => [item_ids]]
     */
    public function generateSmartMatrix(QuotationRequest $parent): array
    {
        $matrix = [];

        // Obtener todos los suppliers disponibles
        $allSuppliers = \App\Models\Supplier::where('is_active', true)->get();

        foreach ($allSuppliers as $supplier) {
            $matrix[$supplier->id] = [];

            // Para cada ítem del padre, verificar si el supplier tiene oferta
            foreach ($parent->items as $item) {
                $hasOffer = SupplierProductOffer::where('supplier_id', $supplier->id)
                    ->where('product_variant_id', $item->product_variant_id)
                    ->exists();

                if ($hasOffer) {
                    $matrix[$supplier->id][] = $item->id;
                }
            }
        }

        // Filtrar suppliers sin ítems
        return array_filter($matrix, fn($items) => !empty($items));
    }
}
