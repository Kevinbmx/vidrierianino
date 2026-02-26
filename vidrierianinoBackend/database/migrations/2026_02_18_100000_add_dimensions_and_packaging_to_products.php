<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Agregar dimensiones a product_variants
        Schema::table('product_variants', function (Blueprint $table) {
            // Dimensiones Físicas de la "Pieza Maestra" (Unidad de Inventario)
            $table->decimal('width', 8, 4)->nullable()->after('sale_unit_id')->comment('Ancho en metros (para vidrios/planchas)');
            $table->decimal('height', 8, 4)->nullable()->after('width')->comment('Alto en metros (para vidrios/planchas)');
            $table->decimal('length', 8, 4)->nullable()->after('height')->comment('Largo en metros (para perfiles/barras)');

            // Área/Longitud Total calculada (cache para búsquedas)
            $table->decimal('total_dimension', 10, 4)->nullable()->after('length')->comment('m2 totales o ml totales según corresponda');
        });

        // 2. Crear tabla de Empaques (Conversiones)
        Schema::create('product_variant_packagings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();

            $table->string('name'); // Ej: "Caja", "Paquete", "Atado"
            $table->decimal('quantity', 10, 4); // Factor de conversión: Ej: 30 (planchas x caja)

            $table->text('description')->nullable();
            $table->boolean('is_default_purchase')->default(false); // Si es la forma habitual de compra

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_packagings');

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['width', 'height', 'length', 'total_dimension']);
        });
    }
};
