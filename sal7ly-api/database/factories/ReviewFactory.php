<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'direction' => fake()->randomElement(['client_to_craftsman', 'craftsman_to_client']),
            'rating' => fake()->numberBetween(1, 5),
            'review_text' => fake()->sentence(10),
            'status' => 'visible',
        ];
    }
}
