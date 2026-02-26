<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cleanup Suppliers Table
 *
 * 1. Migra los datos de contacto existentes (contact_name, phone, email) a supplier_contacts
 *    antes de eliminar esas columnas — así no se pierden datos.
 *
 * 2. Elimina columnas redundantes: contact_name, email, phone, address
 *    (ya existen en supplier_contacts y supplier_branches).
 *
 * 3. Agrega campos de negocio reales a la empresa:
 *    - rif           → identificación fiscal ("J-12345678")
 *    - payment_terms → condiciones de pago ("30 días", "contado")
 *    - website       → sitio web del proveedor
 *
 * Impacto en el negocio: tabla suppliers queda como datos de la empresa,
 * sin información de personas (que va en supplier_contacts) ni
 * de ubicaciones (que va en supplier_branches).
 */
return new class extends Migration {
    public function up(): void
    {
        // ─── PASO 1: Migrar contactos existentes ──────────────────────────
        // Por cada proveedor que tenga contact_name, lo migramos a supplier_contacts
        // solo si aún no tiene contactos registrados (evitar duplicados).
        $suppliers = DB::table('suppliers')
            ->whereNotNull('contact_name')
            ->where('contact_name', '!=', '')
            ->get();

        foreach ($suppliers as $supplier) {
            $alreadyHasContacts = DB::table('supplier_contacts')
                ->where('supplier_id', $supplier->id)
                ->exists();

            if (!$alreadyHasContacts) {
                DB::table('supplier_contacts')->insert([
                    'supplier_id' => $supplier->id,
                    'branch_id' => null,
                    'name' => $supplier->contact_name,
                    'role' => null,
                    'phone' => $supplier->phone ?? null,
                    'email' => $supplier->email ?? null,
                    'notes' => null,
                    'is_primary' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ─── PASO 2: Eliminar columnas redundantes ────────────────────────
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['contact_name', 'email', 'phone', 'address']);
        });

        // ─── PASO 3: Agregar campos de empresa ────────────────────────────
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('rif')->nullable()->after('name');               // J-12345678
            $table->string('payment_terms')->nullable()->after('rif');      // "30 días", "contado"
            $table->string('website')->nullable()->after('payment_terms');  // sitio web
        });
    }

    public function down(): void
    {
        // Re-agrega las columnas eliminadas
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['rif', 'payment_terms', 'website']);
            $table->string('contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
        });
    }
};
