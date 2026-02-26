<?php

namespace App\Actions;

use App\Models\PurchaseOrder;
use App\Models\User;
use App\Services\MasterPriceUpdaterService;
use Illuminate\Support\Facades\DB;

class ConfirmPurchaseOrderAction
{
    protected MasterPriceUpdaterService $priceUpdater;

    public function __construct(MasterPriceUpdaterService $priceUpdater)
    {
        $this->priceUpdater = $priceUpdater;
    }

    /**
     * Confirma una Orden de Compra y sincroniza los precios con el catálogo maestro.
     * 
     * @param PurchaseOrder $po
     * @param User $user
     */
    public function execute(PurchaseOrder $po, User $user)
    {
        return DB::transaction(function () use ($po, $user) {
            // 1. Cambiar estado
            $po->status = PurchaseOrder::STATUS_CONFIRMED;
            $po->confirmed_by = $user->id;
            $po->confirmed_at = now();
            $po->save();

            // 2. Sincronización de Catálogo Maestro (delegado al servicio)
            $this->priceUpdater->syncFromPurchaseOrder($po);

            return $po;
        });
    }
}
