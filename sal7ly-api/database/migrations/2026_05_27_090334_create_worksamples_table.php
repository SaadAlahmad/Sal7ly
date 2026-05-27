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
        Schema::create('worksamples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('craftsman_id')->constrained('craftspeople')->cascadeOnDelete();
            $table->string('file_path', 255);
            $table->string('file_type', 20);
            $table->string('title', 150)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worksamples');
    }
};
