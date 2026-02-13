<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Product Attribute Values Pivot Table
 * 
 * Relaciona variantes de productos con sus valores de atributos.
 * Ejemplo: ProductVariant "Vidrio Float SKU-001" tiene:
 * - Grosor: 5mm
 * - Color: Transparente
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();

            // Composite primary key
            $table->primary(['product_variant_id', 'attribute_value_id'], 'pav_primary');

            // Índices para búsquedas inversas
            $table->index('attribute_value_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attribute_values');
    }
};
