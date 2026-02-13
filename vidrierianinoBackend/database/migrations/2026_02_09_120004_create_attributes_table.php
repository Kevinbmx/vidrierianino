<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Attributes and Attribute Values Tables
 * 
 * Sistema EAV (Entity-Attribute-Value) para atributos dinámicos.
 * Ejemplo: Attribute "Color" con values ["Transparente", "Ahumado", "Bronce"]
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabla de Atributos (Color, Grosor, Material, etc.)
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Color", "Grosor", "Material"
            $table->string('slug')->unique();
            $table->enum('input_type', ['text', 'number', 'select', 'color']); // Tipo de input
            $table->timestamps();
        });

        // Tabla de Valores de Atributos (5mm, 6mm, Transparente, etc.)
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value'); // "5mm", "Transparente", "Pino"
            $table->timestamps();

            // Índice para búsquedas
            $table->index('attribute_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
    }
};
