<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lead_appointment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained(); // Who made the action
            $table->string('type'); // 'scheduled', 'cancelled', 'rescheduled', 'completed'
            $table->dateTime('appointment_at');
            $table->string('appointment_type')->nullable(); // 'visita', 'videollamada'
            $table->text('reason')->nullable(); // For cancellation
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_appointment_histories');
    }
};
