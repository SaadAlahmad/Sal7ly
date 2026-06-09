<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Craftsman;
use App\Models\JobRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_craftsman_can_apply_to_jobs(): void
    {
        /** @var Craftsman $craftsman */
        $craftsman = Craftsman::factory()->create(['is_verified' => true]);
        $request = JobRequest::factory()->create(['city' => "{$craftsman->city}"]);
        $response = $this->actingAs($craftsman)->postJson('api/applications', [
            'request_id' => $request->id,
            'cover_letter' => 'Test cover letter.',
            'proposed_price' => 250,
        ]);
        $response->assertCreated();
        $response->assertJson([
            'status' => true,
            'message' => 'Application sent successfully.',
        ]);
        $this->assertDatabaseHas('applications', [
            'cover_letter' => 'Test cover letter.',
            'proposed_price' => 250,
        ]);
    }

    public function test_unverified_craftsman_can_not_apply_to_jobs(): void
    {
        /** @var Craftsman $craftsman */
        $craftsman = Craftsman::factory()->create(['is_verified' => false]);
        $request = JobRequest::factory()->create(['city' => "{$craftsman->city}"]);
        $response = $this->actingAs($craftsman)->postJson('api/applications', [
            'request_id' => $request->id,
            'cover_letter' => 'Test cover letter.',
            'proposed_price' => 250,
        ]);
        $response->assertForbidden();
        $response->assertJson([
            'status' => false,
            'message' => 'This action is unauthorized.',
        ]);
        $this->assertDatabaseMissing('applications', ['cover_letter' => 'Test cover letter.']);
    }

    public function test_can_not_apply_to_job_twice(): void
    {
        /** @var Craftsman $craftsman */
        $craftsman = Craftsman::factory()->create(['is_verified' => true]);
        $request = JobRequest::factory()->create(['city' => "{$craftsman->city}"]);
        $this->actingAs($craftsman)->postJson('api/applications', [
            'request_id' => $request->id,
            'cover_letter' => 'Test cover letter.',
            'proposed_price' => 250,
        ]);
        $response = $this->actingAs($craftsman)->postJson('api/applications', [
            'request_id' => $request->id,
            'cover_letter' => 'Test cover letter 2.',
            'proposed_price' => 250,
        ]);
        $response->assertStatus(500);
        $response->assertJson([
            'status' => false,
            'message' => 'You have already applied to this job.',
        ]);
        $this->assertDatabaseMissing('applications', ['cover_letter' => 'Test cover letter 2.']);
    }

    public function test_can_cancel_their_pending_applications(): void
    {
        /** @var Craftsman $craftsman */
        $craftsman = Craftsman::factory()->create(['is_verified' => false]);
        $application = Application::factory()->create(['craftsman_id' => $craftsman->id]);
        $response = $this->actingAs($craftsman)->deleteJson("api/applications/{$application->id}");
        $response->assertOk();
        $response->assertJson([
            'status' => true,
            'message' => 'Application cancelled.',
        ]);
        $application->refresh();
        $this->assertEquals('rejected', $application->status);
    }

    public function test_client_can_accept_application(): void // also test for project and conversation creation
    {
        /** @var User $user */
        $user = User::factory()->create();
        $request = JobRequest::factory()->create(['user_id' => $user->id]);
        $application = Application::factory()->create(['request_id' => $request->id]);
        $response = $this->actingAs($user)->putJson("api/applications/{$application->id}", [
            'status' => 'accepted',
        ]);
        $response->assertOk();
        $response->assertJson([
            'status' => true,
            'message' => 'Application accepted.',
        ]);
        $application->refresh();
        $this->assertDatabaseHas('applications', ['id' => $application->id, 'status' => 'accepted']);
        $this->assertDatabaseHas('projects', ['request_id' => $request->id, 'application_id' => $application->id]);
        $this->assertDatabaseHas('conversations', ['user_id' => $user->id, 'craftsman_id' => $application->craftsman_id]);
    }

    public function test_client_can_reject_application(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $request = JobRequest::factory()->create(['user_id' => $user->id]);
        $application = Application::factory()->create(['request_id' => $request->id]);
        $response = $this->actingAs($user)->putJson("api/applications/{$application->id}", [
            'status' => 'rejected',
        ]);
        $response->assertOk();
        $response->assertJson([
            'status' => true,
            'message' => 'Application rejected.',
        ]);
        $application->refresh();
        $this->assertDatabaseHas('applications', ['id' => $application->id, 'status' => 'rejected']);
    }

    public function test_client_can_not_accept_others_applications(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $application = Application::factory()->create();
        $response = $this->actingAs($user)->putJson("api/applications/{$application->id}", [
            'status' => 'accepted',
        ]);
        $response->assertForbidden();
        $response->assertJson([
            'status' => false,
            'message' => 'Action Forbidden.',
        ]);
        $application->refresh();
        $this->assertDatabaseHas('applications', ['id' => $application->id, 'status' => 'pending']);
    }
}
