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

class ProjectTest extends TestCase
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

    public function test_craftsman_can_mark_project_complete(): void
    {
        ['craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var Craftsman $craftsman */
        $response = $this->actingAs($craftsman)->patchJson("api/projects/{$project->id}/complete");
        $response->assertOk();
        $response->assertJson(['status' => true]);
        $project->refresh();
        $this->assertEquals('pending_completion', $project->status);
        $this->assertNotNull($project->auto_complete_at);
    }

    public function test_client_can_confirm_completion(): void
    {
        ['user' => $user, 'craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var Craftsman $craftsman */
        $this->actingAs($craftsman)->patchJson("api/projects/{$project->id}/complete");
        /** @var User $user */
        $response = $this->actingAs($user)->patchJson("api/projects/{$project->id}/confirm");
        $response->assertOk();
        $project->refresh();
        $this->assertEquals('completed', $project->status);
        $this->assertNotNull($project->completed_at);
    }

    public function test_client_cannot_confirm_in_progress_project(): void
    {
        ['user' => $user, 'project' => $project] = $this->createProject();
        /** @var User $user */
        $response = $this->actingAs($user)->patchJson("api/projects/{$project->id}/confirm");
        $response->assertForbidden();
        $project->refresh();
        $this->assertEquals('in_progress', $project->status);
    }

    public function test_client_can_cancel_project(): void
    {
        ['user' => $user, 'project' => $project] = $this->createProject();
        /** @var User $user */
        $response = $this->actingAs($user)->patchJson("api/projects/{$project->id}/cancel");
        $response->assertOk();
        $project->refresh();
        $this->assertEquals('cancelled', $project->status);
    }

    public function test_craftsman_can_cancel_project(): void
    {
        ['craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var Craftsman $craftsman */
        $response = $this->actingAs($craftsman)->patchJson("api/projects/{$project->id}/cancel");
        $response->assertOk();
        $project->refresh();
        $this->assertEquals('cancelled', $project->status);
    }

    public function test_client_can_raise_dispute(): void
    {
        ['user' => $user, 'craftsman' => $craftsman, 'project' => $project] = $this->createProject();
        /** @var Craftsman $craftsman */
        $this->actingAs($craftsman)->patchJson("api/projects/{$project->id}/complete");
        /** @var User $user */
        $response = $this->actingAs($user)->postJson("api/projects/{$project->id}/dispute", [
            'reason' => 'Work was not completed properly.',
        ]);
        $response->assertCreated();
        $response->assertJson(['status' => true]);
        $project->refresh();
        $this->assertNull($project->auto_complete_at);
        $this->assertDatabaseHas('disputes', [
            'project_id' => $project->id,
            'raised_by_id' => $user->id,
            'raised_by_type' => 'user',
        ]);
    }
}
