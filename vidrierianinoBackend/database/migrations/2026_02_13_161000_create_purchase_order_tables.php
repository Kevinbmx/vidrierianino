<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Ej: PO-2026-001

            $table->foreignId('supplier_id')->constrained();
            $table->foreignId('quotation_request_id')->nullable()->constrained(); // Link a la RFQ de origen

            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();

            // Estado: draft, sent, confirmed, partially_received, received, cancelled
            $table->string('status')->default('draft');

            // Totales
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->string('currency')->default('BOB');

            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable(); // Para auditoría de cancelaciones

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('confirmed_by')->nullable()->constrained('users');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained();
            $table->foreignId('unit_id')->constrained('units_of_measure');

            $table->decimal('quantity', 12, 4);
            $table->decimal('unit_price', 14, 4); // Precio unitario pactado
            $table->decimal('total_line', 14, 2);

            $table->foreignId('quotation_response_id')->nullable()->constrained()->nullOnDelete(); // Link al precio cotizado específico origen

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
