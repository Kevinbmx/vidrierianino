<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Add branch_id to supplier_contacts
 *
 * Un contacto puede pertenecer a una sucursal específica del proveedor.
 * Es nullable: un contacto puede existir sin sucursal asignada (ej. gerente general).
 *
 * Impacto en el negocio: Permite saber qué vendedora atiende en qué local.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('supplier_contacts', function (Blueprint $table) {
            $table->foreignId('branch_id')
                ->nullable()
                ->after('supplier_id')
                ->constrained('supplier_branches')
                ->nullOnDelete(); // Si se borra la sucursal, el contacto queda sin sucursal
        });
    }

    public function down(): void
    {
        Schema::table('supplier_contacts', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });
    }
};
