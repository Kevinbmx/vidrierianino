<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Supplier Product Offers Table
 * 
 * Tabla central para almacenar ofertas comerciales específicas de proveedores.
 * 
 * Lógica de Negocio:
 * - Permite que el mismo producto tenga ofertas de diferentes proveedores
 *   con distintos formatos de empaque/plancha.
 * - Las dimensiones físicas (width, height, length) permiten calcular el
 *   "base_unit_cost" (costo normalizado por m² o metro lineal) para comparar
 *   automáticamente cuál proveedor es más económico.
 * 
 * Ejemplo: Vidrio Float 5mm
 * - Proveedor A: plancha 2.14x3.30m a $15,000 → $2,124/m²
 * - Proveedor B: plancha 2.00x3.00m a $12,000 → $2,000/m² ← Mejor oferta
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('supplier_product_offers', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();

            // Datos de compra
            $table->decimal('cost', 12, 4); // Precio de compra por unidad de compra
            $table->foreignId('purchase_unit_id')->constrained('units_of_measure');

            // 🔥 DIMENSIONES FÍSICAS DE COMPRA (para cálculo de costo base)
            // Todas en metros para consistencia
            $table->decimal('purchase_width', 8, 4)->nullable();  // Ancho en metros
            $table->decimal('purchase_height', 8, 4)->nullable(); // Alto en metros
            $table->decimal('purchase_length', 8, 4)->nullable(); // Largo en metros

            // Metadata comercial
            $table->boolean('is_preferred')->default(false); // Proveedor preferido para este producto
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable(); // Ej: "Entrega en 3 días", "Requiere mínimo 10 unidades"

            $table->timestamps();

            // Índices para optimizar consultas
            $table->index('supplier_id');
            $table->index('product_variant_id');
            $table->index(['product_variant_id', 'is_active']);
            $table->index('is_preferred');

            // Constraint: Un proveedor no puede tener múltiples ofertas activas para la misma variante
            // (pero sí puede tener históricas is_active=false)
            $table->unique(['supplier_id', 'product_variant_id', 'is_active'], 'unique_active_offer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_product_offers');
    }
};
