<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Craftsman;
use App\Models\JobRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
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
            'application_id' => Application::factory(),
            'craftsman_id' => Craftsman::factory(),
            'user_id' => User::factory(),
            'status' => 'in_progress',
            'auto_complete_at' => null,
            'completed_at' => null,
        ];
    }
}
