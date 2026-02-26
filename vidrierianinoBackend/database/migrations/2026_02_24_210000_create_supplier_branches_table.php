<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Supplier Branches Table
 *
 * Permite registrar múltiples sucursales (locales, sedes) de un mismo proveedor.
 *
 * Impacto en el negocio: Al emitir una RFQ se puede elegir a qué sucursal
 * específica enviarla, comparando precios entre sedes del mismo proveedor.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('supplier_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')
                ->constrained('suppliers')
                ->cascadeOnDelete();

            $table->string('name');                    // Nombre: "Sucursal Centro", "Sede Principal"
            $table->string('city')->nullable();        // Ciudad donde está ubicada
            $table->text('address')->nullable();       // Dirección completa
            $table->string('phone')->nullable();       // Teléfono de la sucursal
            $table->string('email')->nullable();       // Email de la sucursal
            $table->text('notes')->nullable();         // Notas: "Atiende L-V 8am-5pm"
            $table->boolean('is_main')->default(false); // true = sede principal

            $table->timestamps();

            $table->index('supplier_id');
            $table->index('is_main');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_branches');
    }
};
