<?php

namespace App\Actions;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CancelPurchaseOrderAction
{
    /**
     * Cancela una Orden de Compra y libera los ítems de la RFQ asociada para re-adjudicación.
     * 
     * @param PurchaseOrder $po
     * @param User $user
     * @param string $reason
     */
    public function execute(PurchaseOrder $po, User $user, string $reason)
    {
        return DB::transaction(function () use ($po, $user, $reason) {
            // 1. Validar estado actual
            if ($po->status === PurchaseOrder::STATUS_CANCELLED) {
                throw new \Exception("La orden ya está cancelada.");
            }
            if ($po->status === PurchaseOrder::STATUS_COMPLETED) {
                // Warning: Cancelar una orden completada requiere reversar inventario
                // Aquí asumimos que solo se cancela antes de recibir
            }

            // 2. Actualizar PO
            $po->status = PurchaseOrder::STATUS_CANCELLED;
            $po->cancellation_reason = $reason;
            $po->cancelled_at = now();
            // $po->cancelled_by = $user->id; // Si existiera columna
            $po->save();

            // 3. Liberar ítems de la RFQ (QuotationResponse)
            // Buscar todas las respuestas asociadas a los items de esta PO
            foreach ($po->items as $item) {
                if ($item->quotation_response_id) {
                    $response = $item->quotationResponse;
                    if ($response) {
                        $response->is_awarded = false;
                        $response->save();
                    }
                }
            }

            // 4. Actualizar estado de la RFQ si es necesario
            if ($po->quotation_request_id) {
                $rfq = $po->quotationRequest;
                // Si todas las POs de esta RFQ están canceladas, volver a estado 'responses_received'?
                // O simplemente dejar en 'awarded' pero permitir nueva adjudicación parcial.
                // Mejor: Verificar si queda alguna respuesta 'awarded'
                $awardedCount = $rfq->responses()->where('is_awarded', true)->count();

                if ($awardedCount === 0) {
                    $rfq->status = 'responses_received'; // Volver a estado previo
                    $rfq->save();
                }
            }

            return $po;
        });
    }
}
