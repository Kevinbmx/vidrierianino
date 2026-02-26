<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tipos de Empaque (Plantillas)
        Schema::create('packaging_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Ej: "Caja Grande", "Paquete Chico"
            $table->decimal('default_quantity', 10, 4); // Ej: 30
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Plantillas de Dimensiones
        Schema::create('dimension_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Ej: "Plancha Jumbo", "Plancha Standard"

            // Dimensiones opcionales (null si no aplican)
            $table->decimal('width', 8, 4)->nullable();
            $table->decimal('height', 8, 4)->nullable();
            $table->decimal('length', 8, 4)->nullable();

            // Tipo de plantilla para filtrar en UX
            $table->enum('type', ['area', 'length', 'unit'])->default('area');

            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed básico para facilitar pruebas inmediatas
        DB::table('packaging_types')->insert([
            ['name' => 'Caja Estándar', 'default_quantity' => 30, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Media Caja', 'default_quantity' => 15, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Paquete', 'default_quantity' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Unidad Suelta', 'default_quantity' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('dimension_templates')->insert([
            ['name' => 'Plancha Standard (2.44x1.83)', 'width' => 2.44, 'height' => 1.83, 'length' => null, 'type' => 'area', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Plancha Jumbo (3.60x2.50)', 'width' => 3.60, 'height' => 2.50, 'length' => null, 'type' => 'area', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Barra 6m', 'width' => null, 'height' => null, 'length' => 6.00, 'type' => 'length', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('dimension_templates');
        Schema::dropIfExists('packaging_types');
    }
};
