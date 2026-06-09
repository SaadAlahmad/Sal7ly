<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Conversation;
use App\Models\Craftsman;
use App\Models\JobRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private function createProject(): array {
        $user = User::factory()->create();
        $craftsman = Craftsman::factory()->create(['is_verified' => true]);
        $jobRequest = JobRequest::factory()->create(['user_id' => $user->id]);
        $application = Application::factory()->create([
            'request_id' => $jobRequest->id,
            'craftsman_id' => $craftsman->id,
        ]);
        $project = Project::factory()->create([
            'request_id' => $jobRequest->id,
            'application_id' => $application->id,
            'craftsman_id' => $craftsman->id,
            'user_id' => $user->id,
        ]);
        $conversation = Conversation::factory()->create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'craftsman_id' => $craftsman->id,
        ]);
        return compact('user', 'craftsman', 'jobRequest', 'application', 'project');
    }

    public function test_client_can_post_review_with_correct_direction(): void // on a complete project
    {
        ['user' => $user, 'craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var User $user */
        /** @var Craftsman $craftsman */
        $this->actingAs($craftsman)->patch("api/projects/{$project->id}/complete");
        $this->actingAs($user)->patch("api/projects/{$project->id}/confirm");

        $response = $this->actingAs($user)->postJson('api/reviews', [
            'project_id' => $project->id,
            'rating' => 4,
            'review_text' => 'Good work',
        ]);
        $response->assertCreated();
        $response->assertJson([
            'status' => true,
            'message' => 'Review posted successfully.'
        ]);
        $this->assertDatabaseHas('reviews', [
            'project_id' => $project->id,
            'direction' => 'client_to_craftsman',
            'rating' => 4,
            'review_text' => 'Good work',
        ]);
    }

    public function test_craftsman_can_post_review_with_correct_direction(): void // on a complete project
    {
        ['user' => $user, 'craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var User $user */
        /** @var Craftsman $craftsman */
        $this->actingAs($craftsman)->patch("api/projects/{$project->id}/complete");
        $this->actingAs($user)->patch("api/projects/{$project->id}/confirm");

        $response = $this->actingAs($craftsman)->postJson('api/reviews', [
            'project_id' => $project->id,
            'rating' => 4,
            'review_text' => 'very nice client',
        ]);
        $response->assertCreated();
        $response->assertJson([
            'status' => true,
            'message' => 'Review posted successfully.'
        ]);
        $this->assertDatabaseHas('reviews', [
            'project_id' => $project->id,
            'direction' => 'craftsman_to_client',
            'rating' => 4,
            'review_text' => 'very nice client',
        ]);
    }

    public function test_client_can_not_post_review_on_incomplete_project(): void
    {
        ['user' => $user, 'craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var User $user */
        $this->actingAs($user)->patch("api/projects/{$project->id}/confirm");

        $response = $this->actingAs($user)->postJson('api/reviews', [
            'project_id' => $project->id,
            'rating' => 4,
            'review_text' => 'Good work',
        ]);
        $response->assertForbidden();
        $response->assertJson([
            'status' => false,
            'message' => 'Project not completed.'
        ]);
        $this->assertDatabaseMissing('reviews', [
            'project_id' => $project->id,
        ]);
    }

    public function test_posting_new_review_hides_old_review(): void
    {
        ['user' => $user, 'craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var User $user */
        /** @var Craftsman $craftsman */
        $this->actingAs($craftsman)->patch("api/projects/{$project->id}/complete");
        $this->actingAs($user)->patch("api/projects/{$project->id}/confirm");
        $this->actingAs($user)->postJson('api/reviews', [
            'project_id' => $project->id,
            'rating' => 4,
            'review_text' => 'test review text',
        ]);
        $response = $this->actingAs($user)->postJson('api/reviews', [
            'project_id' => $project->id,
            'rating' => 4,
            'review_text' => 'Good work',
        ]);
        $response->assertCreated();
        $response->assertJson([
            'status' => true,
            'message' => 'Review posted successfully.'
        ]);
        $this->assertDatabaseHas('reviews', [
            'project_id' => $project->id,
            'review_text' => 'test review text',
            'status' => 'hidden',
        ]);
        $this->assertDatabaseHas('reviews', [
            'project_id' => $project->id,
            'review_text' => 'Good work',
            'status' => 'visible',
        ]);
    }
}
