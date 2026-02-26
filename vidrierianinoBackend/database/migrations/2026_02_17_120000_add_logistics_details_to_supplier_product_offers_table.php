<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('supplier_product_offers', function (Blueprint $table) {
            // Logística Avanzada
            $table->decimal('pack_quantity', 10, 2)->default(1)->after('purchase_unit_id')
                ->comment('Factor de empaque: Cuántas unidades base vienen en la unidad de compra. Ej: 30 si es una Caja de 30 planchas.');

            $table->string('supplier_sku')->nullable()->after('product_variant_id')
                ->comment('SKU del proveedor para referencias cruzadas en órdenes de compra.');

            $table->integer('delivery_days')->nullable()->after('notes')
                ->comment('Tiempo estimado de entrega en días hábiles.');
        });
    }

    public function down(): void
    {
        Schema::table('supplier_product_offers', function (Blueprint $table) {
            $table->dropColumn(['pack_quantity', 'supplier_sku', 'delivery_days']);
        });
    }
};
