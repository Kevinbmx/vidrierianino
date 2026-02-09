<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Appointment fields
            $table->dateTime('appointment_at')->nullable()->after('status');
            $table->enum('appointment_type', ['visita', 'videollamada'])->nullable()->after('appointment_at');
            $table->text('address_details')->nullable()->after('appointment_type');

            // Quote fields
            $table->dateTime('quote_sent_at')->nullable()->after('address_details');
            $table->decimal('quote_amount', 12, 4)->nullable()->after('quote_sent_at');
            $table->decimal('payment_advance', 12, 4)->nullable()->after('quote_amount');

            // Installation and warranty fields
            $table->dateTime('installed_at')->nullable()->after('payment_advance');
            $table->dateTime('warranty_ends_at')->nullable()->after('installed_at');
            $table->dateTime('warranty_next_check')->nullable()->after('warranty_ends_at');

            // Rejection tracking
            $table->text('rejection_reason')->nullable()->after('warranty_next_check');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'appointment_at',
                'appointment_type',
                'address_details',
                'quote_sent_at',
                'quote_amount',
                'payment_advance',
                'installed_at',
                'warranty_ends_at',
                'warranty_next_check',
                'rejection_reason',
            ]);
        });
    }
};
