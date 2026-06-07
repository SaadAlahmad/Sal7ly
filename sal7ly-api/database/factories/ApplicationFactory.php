<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Craftsman;
use App\Models\JobRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_id' => JobRequest::factory(),
            'craftsman_id' => Craftsman::factory(),
            'cover_letter' => fake()->paragraph(),
            'proposed_price' => fake()->numberBetween(200, 1500),
            'status' => 'pending',
            'closure_reason' => null,
        ];
    }
}
