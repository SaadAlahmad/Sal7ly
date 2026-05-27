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
        Schema::create('craftsman_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('craftsman_id')->unique()->constrained('craftspeople');
            $table->integer('reviews_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->decimal('bayesian_score', 5, 4)->default(0);
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('craftsman_ratings');
    }
};
