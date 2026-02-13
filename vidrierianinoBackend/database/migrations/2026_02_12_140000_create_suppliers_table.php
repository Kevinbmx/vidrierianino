<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Suppliers Table
 * 
 * Tabla para gestionar proveedores del negocio.
 * 
 * Impacto en el negocio: Centraliza la información de contacto y estado
 * de proveedores, permitiendo comparar ofertas entre múltiples fuentes.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre comercial del proveedor
            $table->string('contact_name')->nullable(); // Persona de contacto
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable(); // Observaciones (horarios, condiciones, etc.)
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices
            $table->index('is_active');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
