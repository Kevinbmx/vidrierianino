<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->dropColumn('location');
            $table->foreignId('warehouse_zone_id')->nullable()->after('product_variant_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->dropForeign(['warehouse_zone_id']);
            $table->dropColumn('warehouse_zone_id');
            $table->string('location')->nullable()->after('dimensions'); // Ej: "Estante A-3"
        });
    }
};
