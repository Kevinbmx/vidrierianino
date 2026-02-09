<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lead_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->onDelete('cascade');
            $table->string('firebase_url');
            $table->string('firebase_path')->nullable();
            $table->enum('stage', ['captura', 'visita', 'instalacion', 'garantia'])->default('captura');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('lead_id');
            $table->index('stage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_photos');
    }
};
