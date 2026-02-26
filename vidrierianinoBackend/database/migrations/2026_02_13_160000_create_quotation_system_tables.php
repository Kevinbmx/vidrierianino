<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Cabecera de Solicitud de Cotización (RFQ)
        Schema::create('quotation_requests', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Ej: RFQ-2026-001 (Padre), RFQ-2026-001-A (Hijo)

            // Jerarquía: Padre (NULL) -> Hijos (parent_id)
            $table->foreignId('parent_id')->nullable()->constrained('quotation_requests')->nullOnDelete();

            $table->date('deadline')->nullable();
            $table->string('status')->default('draft'); // draft, ready, sent, viewed, replied, analyzing, awarded, discarded, cancelled
            $table->text('comments')->nullable();

            // Auditoría
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Ítems de la Solicitud
        Schema::create('quotation_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained();

            $table->decimal('quantity', 12, 4);
            $table->foreignId('unit_id')->constrained('units_of_measure'); // Unidad solicitada

            $table->text('notes')->nullable(); // Ej: "Marca específica"
            $table->timestamps();
        });

        // 3. Proveedores Invitados (Pivot)
        Schema::create('quotation_request_suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained();

            $table->string('status')->default('pending'); // pending, viewed, replied, declined
            $table->string('submission_channel')->default('manual'); // whatsapp, email, portal, manual

            $table->dateTime('sent_at')->nullable();
            $table->dateTime('viewed_at')->nullable();
            $table->dateTime('replied_at')->nullable();

            // URL del documento de cotización recibido (PDF/Imagen)
            $table->string('response_document_url', 500)->nullable();

            $table->timestamps();

            $table->unique(['quotation_request_id', 'supplier_id'], 'unique_rfq_supplier');
        });

        // 4. Respuestas de Precios (Precios cotizados por ítem)
        Schema::create('quotation_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quotation_request_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained();

            $table->decimal('unit_price', 12, 4)->nullable(); // Precio ofertado (por unidad solicitada)

            // Campos dimensionales y de empaque (Oferta técnica)
            $table->foreignId('quoted_unit_id')->nullable()->constrained('units_of_measure'); // Unidad en la que cotizan
            $table->decimal('pack_quantity', 10, 2)->default(1); // Cuántas unidades base trae el empaque
            $table->decimal('offered_price', 15, 2)->nullable(); // Precio por la unidad de empaque cotizada
            $table->text('dimensions_description')->nullable(); // Ej: "3.60x2.50"

            $table->string('currency')->default('BOB');
            $table->boolean('is_awarded')->default(false); // Si este precio fue adjudicado

            $table->text('notes')->nullable(); // Notas específicas del ítem
            $table->timestamps();

            $table->unique(['quotation_request_item_id', 'supplier_id'], 'unique_item_supplier_response');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_responses');
        Schema::dropIfExists('quotation_request_suppliers');
        Schema::dropIfExists('quotation_request_items');
        Schema::dropIfExists('quotation_requests');
    }
};
