<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Product Variants Table
 * 
 * Tabla central del sistema de inventario con inteligencia de compra/venta.
 * 
 * DIMENSIONES DE COMPRA: purchase_width, purchase_height, purchase_length
 * Permiten calcular el "Costo por Unidad Base" (ej: costo real por m² o por metro lineal)
 * independientemente del formato de compra del proveedor.
 * 
 * CONVERSIÓN: conversion_factor representa cuántas unidades de venta contiene
 * una unidad de compra. Ej: 1 plancha de 2.14×3.30 = 7.062 m²
 * 
 * Impacto en el negocio: Permite comparar proveedores que venden en diferentes formatos.
 */
return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            // SKU y datos básicos
            $table->string('sku')->unique();
            $table->string('name')->nullable(); // Nombre descriptivo del variant

            // Precios (usando decimal(12,4) según laravel-api-pro)
            $table->decimal('price', 12, 4); // Precio de VENTA por unidad de venta
            $table->decimal('cost', 12, 4);  // Costo de COMPRA por unidad de compra

            // Unidades de medida
            $table->foreignId('purchase_unit_id')->constrained('units_of_measure');
            $table->foreignId('sale_unit_id')->constrained('units_of_measure');

            // 🔥 DIMENSIONES DE COMPRA (para cálculo de costo base)
            // Todas en metros para consistencia
            $table->decimal('purchase_width', 8, 4)->nullable();  // Ancho en metros
            $table->decimal('purchase_height', 8, 4)->nullable(); // Alto en metros
            $table->decimal('purchase_length', 8, 4)->nullable(); // Largo en metros

            // Factor de conversión (unidades de venta por unidad de compra)
            $table->decimal('conversion_factor', 8, 4)->default(1.0000);

            // Stock y estado
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Índices para optimizar consultas
            $table->index('product_id');
            $table->index('purchase_unit_id');
            $table->index('sale_unit_id');
            $table->index(['is_active', 'stock_quantity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
