<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Supplier Product Offer History Table
 * 
 * Tabla de auditoría para rastrear cambios históricos en las ofertas de proveedores.
 * 
 * Lógica de Negocio:
 * - Permite rastrear la evolución de precios y condiciones de cada proveedor.
 * - Facilita análisis de tendencias de precios y toma de decisiones de compra.
 * - Cada vez que se actualiza una oferta activa, se registra el estado anterior.
 * 
 * Ejemplo de uso:
 * - Ver cómo ha variado el precio del vidrio Float 5mm del Proveedor A
 *   en los últimos 6 meses para negociar mejores tarifas.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('supplier_product_offer_history', function (Blueprint $table) {
            $table->id();

            // Relación con la oferta original
            $table->foreignId('supplier_product_offer_id')
                ->constrained('supplier_product_offers')
                ->cascadeOnDelete();

            // Snapshot de datos históricos (copia del estado anterior)
            $table->foreignId('supplier_id')->constrained();
            $table->foreignId('product_variant_id')->constrained();

            // Datos de compra históricos
            $table->decimal('cost', 12, 4);
            $table->foreignId('purchase_unit_id')->constrained('units_of_measure');

            // Dimensiones físicas históricas
            $table->decimal('purchase_width', 8, 4)->nullable();
            $table->decimal('purchase_height', 8, 4)->nullable();
            $table->decimal('purchase_length', 8, 4)->nullable();

            // Metadata histórica
            $table->boolean('is_preferred');
            $table->boolean('is_active');
            $table->text('notes')->nullable();
            $table->string('document_url', 500)->nullable();

            // Metadata de auditoría
            $table->enum('change_type', ['created', 'updated', 'deactivated'])->default('updated');
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('change_reason')->nullable(); // Ej: "Incremento de precios del proveedor"

            $table->timestamp('changed_at'); // Momento exacto del cambio
            $table->timestamps(); // created_at del registro histórico

            // Índices para consultas de análisis (nombres cortos para MySQL)
            $table->index('supplier_product_offer_id', 'spoh_offer_idx');
            $table->index(['product_variant_id', 'changed_at'], 'spoh_variant_date_idx');
            $table->index('changed_at', 'spoh_changed_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_product_offer_history');
    }
};
