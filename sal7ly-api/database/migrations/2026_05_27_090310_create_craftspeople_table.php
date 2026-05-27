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
        Schema::create('craftspeople', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 150)->unique();
            $table->string('mobile', 20);
            $table->string('password');
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('city', 100);
            $table->text('bio');
            $table->string('avatar_path', 255)->nullable();
            $table->smallInteger('years_experience')->nullable();
            $table->boolean('availability')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->string('subscription_tier', 20)->default('free');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->boolean('is_badge_verified')->default(false);
            $table->integer('credits_balance')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('craftspeople');
    }
};
