<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->decimal('qty', 12, 2)->default(0)->after('image');
            $table->unsignedBigInteger('het')->default(0)->after('qty')->comment('Harga Ecer Tertinggi');
        });
    }

    public function down(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            $table->dropColumn(['qty', 'het']);
        });
    }
};
