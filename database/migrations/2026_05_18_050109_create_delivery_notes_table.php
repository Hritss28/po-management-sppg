<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('delivery_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('number')->unique();
            $table->date('date');
            $table->string('driver')->nullable();
            $table->string('kepada');
            $table->string('kd_sppg');
            $table->string('nama_sppg');
            $table->string('pj_sppg')->nullable();
            $table->string('whatsapp')->nullable();
            $table->text('notes')->nullable();
            $table->json('item_photos')->nullable();
            $table->boolean('has_photo')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_notes');
    }
};
