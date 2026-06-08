<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Craftsman;
use App\Models\JobRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class JobRequestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_client_can_create_job_request(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $response = $this->actingAs($user)->postJson('api/requests', [
            'category_id' => $category->id,
            'title' => 'Test Title',
            'details' => 'Test Details 123',
            'city' => 'Nablus',
            'location' => 'Old City 123 street',
            'budget' => 500,
        ]);
        $response->assertStatus(201);
        $response->assertJson(['status' => true]);
    }

    public function test_craftsman_can_not_create_job_request(): void {
        /** @var Craftsman $craftsman */
        $craftsman = Craftsman::factory()->create();
        $category = Category::factory()->create();
        $response = $this->actingAs($craftsman)->postJson('api/requests', [
            'category_id' => $category->id,
            'title' => 'Test Title',
            'details' => 'Test Details 123',
            'city' => 'Nablus',
            'location' => 'Old City 123 street',
            'budget' => 500,
        ]);
        $response->assertStatus(403);
        $response->assertJson(['status' => false]);
    }

    public function test_client_can_view_their_own_requests(): void {
        /** @var User $user */
        $user = User::factory()->create();
        $request = JobRequest::factory()->create(['user_id' => $user->id]);
        $response = $this->actingAs($user)->getJson('api/requests');
        $response->assertStatus(200);
        $response->assertJson(['status' => true]);
        $response->assertJsonFragment([
            'id' => $request->id,
        ]);
    }

    public function test_craftsman_can_view_filtered_requests_by_city_category(): void {
        $category = Category::factory()->create();
        /** @var Craftsman $craftsman */
        $craftsman = Craftsman::factory()->create(['category_id' => $category->id]);
        $requestA = JobRequest::factory()->create(['city' => $craftsman->city, 'category_id' => $category->id]);
        $requestB = JobRequest::factory()->create(['city' => 'Ramallah', 'category_id' => $category->id]);
        $requestC = JobRequest::factory()->create(['city' => $craftsman->city,'category_id' => Category::factory()->create()->id,]);
        $response = $this->actingAs($craftsman)->getJson('api/requests');
        $response->assertStatus(200);
        $response->assertJson(['status' => true]);
        $data = collect($response->json('data'));
        $ids = $data->pluck('id');
        $this->assertTrue($ids->contains($requestA->id));
        $this->assertFalse($ids->contains($requestB->id)); // Different City => shouldn't appear
        $this->assertFalse($ids->contains($requestC->id)); // Different Category => shouldn't appear
    }

    public function test_client_can_update_rqeuest(): void {
        /** @var User $user */
        $user = User::factory()->create();
        $request = JobRequest::factory()->create(['user_id' => $user->id]);
        $response = $this->actingAs($user)->putJson("api/requests/{$request->id}", [
            'title' => 'Updated Title',
            'details' => 'Updated Details',
            'city' => 'Jenin',
            'location' => 'Updated Location',
            'budget' => '250',
        ]);
        $response->assertOk();
        $response->assertJson([
            'status' => true,
            'message' => 'Job request updated successfully',
        ]);
        $response->assertJsonPath('data.title', 'Updated Title');
        $response->assertJsonPath('data.city', 'Jenin');
        $response->assertJsonPath('data.budget', '250.00');
        $this->assertDatabaseHas('requests', [
            'id' => $request->id,
            'title' => 'Updated Title',
            'city' => 'Jenin',
            'location' => 'Updated Location',
        ]);
    }

    public function test_client_can_not_update_someone_elses_request(): void {
        $userA = User::factory()->create(); // owns the request
        /** @var User $userB */
        $userB = User::factory()->create(); // tries to modify request
        $request = JobRequest::factory()->create(['user_id' => $userA->id]);
        $response = $this->actingAs($userB)->putJson("api/requests/{$request->id}", [
            'title' => 'Updated Title',
            'details' => 'Updated Details',
            'city' => 'Jenin',
            'location' => 'Updated Location',
            'budget' => '250',
        ]);
        $response->assertStatus(403);
        $request->refresh();
        $this->assertNotEquals('Updated Title', $request->title);
        $this->assertNotEquals('Updated Details', $request->details);
        $this->assertNotEquals('Jenin', $request->city);
    }

    public function test_client_can_close_their_own_request(): void {
        /** @var User $user */
        $user = User::factory()->create();
        $request = JobRequest::factory()->create(['user_id' => $user->id]);
        $response = $this->actingAs($user)->delete("api/requests/{$request->id}");
        $response->assertOk();
            $response->assertJson([
            'status' => true,
            'message' => 'Job request closed.',
        ]);
        $request->refresh();
        $this->assertEquals('closed', $request->status);
        $this->assertEquals('user', $request->closure_reason);
    }
}
