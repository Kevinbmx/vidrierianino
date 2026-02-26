<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Supplier Contacts Table
 *
 * Permite registrar múltiples personas de contacto (vendedoras, gerentes, etc.)
 * asociadas a un proveedor, sin necesidad de crear un proveedor por vendedora.
 *
 * Impacto en el negocio: Al generar una RFQ se puede elegir a qué contacto
 * específico enviarla (vendedora, gerente, encargado de compras).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('supplier_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')
                ->constrained('suppliers')
                ->cascadeOnDelete();

            $table->string('name');                      // Nombre completo del contacto
            $table->string('role')->nullable();          // Cargo: Vendedora, Gerente, etc.
            $table->string('phone')->nullable();         // Teléfono directo / WhatsApp
            $table->string('email')->nullable();         // Email personal del contacto
            $table->string('notes')->nullable();         // Observaciones: "Solo atiende L-V"
            $table->boolean('is_primary')->default(false); // Contacto principal del proveedor

            $table->timestamps();

            $table->index('supplier_id');
            $table->index('is_primary');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_contacts');
    }
};
