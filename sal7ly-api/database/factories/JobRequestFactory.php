<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\JobRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobRequest>
 */
class JobRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => fake()->sentence(4),
            'details' => fake()->paragraph(),
            'city' => fake()->city(),
            'location' => fake()->sentence(3),
            'budget' => fake()->numberBetween(200, 1000),
            'status' => 'open',
            'closure_reason' => null,
            'is_featured' => false,
        ];
    }
}
