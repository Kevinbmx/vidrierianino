<?php

namespace App\Actions;

use App\Models\PurchaseOrder;
use App\Models\User;
use App\Services\IncomingStockCalculator;
use Illuminate\Support\Facades\DB;
use Exception;

class ReceivePurchaseOrderAction
{
    protected $stockCalculator;

    public function __construct(IncomingStockCalculator $stockCalculator)
    {
        $this->stockCalculator = $stockCalculator;
    }

    public function execute(PurchaseOrder $po, User $user)
    {
        if ($po->status !== PurchaseOrder::STATUS_CONFIRMED) {
            throw new Exception("Solo se pueden recibir órdenes confirmadas.");
        }

        return DB::transaction(function () use ($po, $user) {
            // 1. Cambiar estado
            $po->status = PurchaseOrder::STATUS_RECEIVED;
            // Asumiendo que existe STATUS_RECEIVED, si no, usar 'completed' o similar
            // Verificaremos el modelo PurchaseOrder después.
            $po->save();

            // 2. Generar Lotes de Inventario (Dimensional Stock)
            $batches = $this->stockCalculator->generateBatchesFromPO($po);

            // 3. (Opcional) Generar Movimiento de Kardex aquí si existiera

            return $po;
        });
    }
}
