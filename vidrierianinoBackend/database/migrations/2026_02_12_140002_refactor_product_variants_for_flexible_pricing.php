<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Refactor Product Variants for Flexible Pricing
 * 
 * Cambios estructurales:
 * 1. ELIMINAR campos de compra (migran a supplier_product_offers)
 * 2. AGREGAR campos de precio flexible (pricing_mode, markup_percentage)
 * 
 * Lógica de Negocio:
 * - pricing_mode = 'fixed': El precio se define manualmente (campo price)
 * - pricing_mode = 'markup': El precio se calcula automáticamente como
 *   best_offer_cost * (1 + markup_percentage/100)
 * 
 * Ejemplo:
 * - Modo 'fixed': price = $2,500/m² (definido por usuario)
 * - Modo 'markup' con 35%: price = $2,000 * 1.35 = $2,700/m² (calculado auto)
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // 1. Agregar nuevos campos de precio flexible
            $table->enum('pricing_mode', ['fixed', 'markup'])->default('fixed')->after('sale_unit_id');
            $table->decimal('markup_percentage', 5, 2)->nullable()->after('pricing_mode'); // Ej: 35.00 = 35%

            // El campo 'price' ya existe, pero cambiaremos su semántica:
            // - Si pricing_mode = 'fixed': Se usa directamente
            // - Si pricing_mode = 'markup': Se calcula dinámicamente (este campo puede quedar como cache o null)
        });

        // 2. Eliminar campos de compra (ahora viven en supplier_product_offers)
        Schema::table('product_variants', function (Blueprint $table) {
            // Primero eliminar índices y foreign keys
            $table->dropForeign(['purchase_unit_id']);
            $table->dropIndex(['purchase_unit_id']);

            // Luego eliminar columnas
            $table->dropColumn([
                'cost',
                'purchase_unit_id',
                'purchase_width',
                'purchase_height',
                'purchase_length',
                'conversion_factor'
            ]);
        });

        // 3. Actualizar registros existentes para establecer modo 'fixed' por defecto
        // (ya se hizo con el default en la definición de la columna)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir cambios (para rollback)
        Schema::table('product_variants', function (Blueprint $table) {
            // Re-agregar campos de compra
            $table->decimal('cost', 12, 4)->after('price');
            $table->foreignId('purchase_unit_id')->after('cost')->constrained('units_of_measure');
            $table->decimal('purchase_width', 8, 4)->nullable()->after('purchase_unit_id');
            $table->decimal('purchase_height', 8, 4)->nullable()->after('purchase_width');
            $table->decimal('purchase_length', 8, 4)->nullable()->after('purchase_height');
            $table->decimal('conversion_factor', 8, 4)->default(1.0000)->after('purchase_length');

            $table->index('purchase_unit_id');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            // Eliminar campos de precio flexible
            $table->dropColumn(['pricing_mode', 'markup_percentage']);
        });
    }
};
