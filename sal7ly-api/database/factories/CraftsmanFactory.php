<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Craftsman;
use App\Models\CraftsmanRating;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Craftsman>
 */
class CraftsmanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        $email = fake()->unique()->safeEmail();
        $mobile = fake()->numerify('05########');

        return [
            'name' => $name,
            'email' => $email,
            'mobile' => $mobile,
            'category_id' => Category::factory(),
            'city' => fake()->city(),
            'bio' => fake()->paragraph(),
            'years_experience' => fake()->numberBetween(1, 30),
            'password' => Hash::make('password'),
            'is_verified' => false,
            'availability' => true,
            'status' => 'active',
            'subscription_tier' => 'free',
            'is_featured' => false,
            'is_badge_verified' => false,
            'credits_balance' => 0,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Craftsman $craftsman) {
            CraftsmanRating::create([
                'craftsman_id' => $craftsman->id,
                'reviews_count' => 0,
                'average_rating' => 0,
                'bayesian_score' => 0,
            ]);
        });
    }
}
