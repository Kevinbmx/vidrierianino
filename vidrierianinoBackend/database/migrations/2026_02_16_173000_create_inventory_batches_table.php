<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete(); // Trazabilidad

            // Identificación
            $table->string('batch_code')->unique(); // e.g., LOTE-2026-001

            // Cantidades Físicas
            $table->decimal('physical_quantity', 15, 4); // Cantidad real de piezas (ej: 50.00)

            // Dimensiones (Fundamental para optimización de cortes)
            // Usamos columnas separadas en lugar de JSON para facilitar consultas SQL directas si es necesario,
            // pero JSON es más flexible si hay variantes con propiedades muy distintas.
            // Siguiendo el plan, usaremos JSON para flexibilidad, pero podríamos indexar claves comunes.
            $table->json('dimensions')->nullable(); // { width: 2500, height: 3600, thickness: 5 }

            // Gestión de Ubicación y Estado
            $table->string('location')->nullable(); // Ej: "Estante A-3"
            $table->enum('status', ['available', 'reserved', 'consumed', 'quarantine'])->default('available');

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['product_variant_id', 'status']);
            $table->index('batch_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
