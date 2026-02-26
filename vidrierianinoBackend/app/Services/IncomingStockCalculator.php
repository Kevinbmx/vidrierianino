<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\PurchaseOrder;
use App\Models\QuotationResponse;

class IncomingStockCalculator
{
    /**
     * Calcula la cantidad física total a ingresar al inventario.
     * Normaliza la UNIDAD DE COMPRA a UNIDAD DE INVENTARIO usando el 'pack_quantity'.
     *
     * Ejemplo:
     * - Compra: 2 Cajas (quoted_unit_id: CAJA)
     * - Pack Quantity: 30 un/caja
     * - Inventario: 60 Unidades Físicas (Planchas)
     * 
     * @param float $purchaseQty Cantidad comprada (en unidad de compra)
     * @param float $packQuantity Contenido del empaque
     * @return float Cantidad física
     */
    public function calculatePhysicalQuantity(float $purchaseQty, float $packQuantity = 1.0): float
    {
        return $purchaseQty * $packQuantity;
    }

    /**
     * Genera lotes de inventario a partir de una Orden de Compra recibida.
     * 
     * @param PurchaseOrder $po
     * @return array<InventoryBatch>
     */
    public function generateBatchesFromPO(PurchaseOrder $po): array
    {
        $batches = [];

        foreach ($po->items as $idx => $item) {
            // Buscar la respuesta de cotización para obtener dimensiones y pack_quantity
            $response = QuotationResponse::where('quotation_request_item_id', $item->id /* este ID puede variar según relación PO->Item, verificar */)
                // Nota: POItem necesita linkear a QuotationRequestItem o QuotationResponse para saber qué se cotizó
                // Asumiremos que POItem tiene los datos, o buscamos la response ganadora.
                // En el modelo actual, POItem tiene product_variant_id, quantity, unit_price.
                // Falta link directo a QuotationResponse en POItem.
                // SOLUCIÓN: Buscar QuotationResponse adjudicada para ese RFQ Item.
                ->first();

            // Si la PO no viene de una RFQ directa o no se guardó el link, usamos defaults.
            // Para esta implementación inicial, asumiremos que los datos dimensionales
            // vienen en la QuotationResponse. Y necesitamos encontrarla.

            // PERO: PurchaseOrderItems actualmente no guardan `quotation_response_id`.
            // Esto es un punto débil del esquema actual. 
            // Workaround: Buscar la respuesta ganadora del proveedor para ese producto en la RFQ de la PO.

            $rfqId = $po->quotation_request_id;
            $supplierId = $po->supplier_id;
            $variantId = $item->product_variant_id;

            $winningResponse = null;

            if ($rfqId) {
                $winningResponse = QuotationResponse::whereHas('item', function ($q) use ($rfqId, $variantId) {
                    $q->where('quotation_request_id', $rfqId)
                        ->where('product_variant_id', $variantId);
                })
                    ->where('supplier_id', $supplierId)
                    ->where('is_awarded', true)
                    ->first();
            }

            $packQty = $winningResponse ? $winningResponse->pack_quantity : 1;
            $dimensionsDesc = $winningResponse ? $winningResponse->dimensions_description : null;

            // Generar dimensiones estructuradas a partir de descripción (o futuras columnas)
            // Por ahora guardamos la descripción como metadata o intentamos parsear "3.60x2.50"
            $dimensions = $this->parseDimensions($dimensionsDesc);

            $physicalQty = $this->calculatePhysicalQuantity($item->quantity, $packQty);

            if ($physicalQty > 0) {
                $batchCode = sprintf('LOTE-%s-%s-%03d', $po->code, now()->format('ymd'), $idx + 1);

                $batch = InventoryBatch::create([
                    'product_variant_id' => $variantId,
                    'purchase_order_id' => $po->id,
                    'batch_code' => $batchCode,
                    'physical_quantity' => $physicalQty,
                    'dimensions' => $dimensions, // JSON
                    'status' => 'available',
                    'location' => 'Recepción'
                ]);

                $batches[] = $batch;
            }
        }

        return $batches;
    }

    /**
     * Parsea un string de dimensiones simple "3600x2500" a JSON.
     * Asume milímetros si no se especifica unidad, o usa float directo.
     */
    private function parseDimensions(?string $desc): ?array
    {
        if (!$desc)
            return null;

        // Intento básico de parseo "3.60x2.50" o "3600x2500"
        if (preg_match('/^([\d\.]+)[xX\*]([\d\.]+)$/', trim($desc), $matches)) {
            return [
                'width' => (float) $matches[1],
                'height' => (float) $matches[2]
            ];
        }

        return ['description' => $desc];
    }
}
