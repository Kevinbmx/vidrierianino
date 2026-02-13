<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Units of Measure Table
 * 
 * Define las unidades de medida base del sistema.
 * Tipos: area (m²), length (ml), unit (un), weight (kg)
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('units_of_measure', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Metro Cuadrado", "Metro Lineal", "Unidad"
            $table->string('abbreviation', 10); // "m²", "ml", "un"
            $table->enum('type', ['area', 'length', 'unit', 'weight']); // Tipo de medida
            $table->timestamps();

            // Índice único para evitar duplicados
            $table->unique('abbreviation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units_of_measure');
    }
};
