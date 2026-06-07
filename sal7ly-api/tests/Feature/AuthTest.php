<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_user_can_register(): void
    {
        $response = $this->postJson('api/auth/register', [
            'role' => 'user',
            'name' => 'Test User',
            'email' => 'test@test.com',
            'mobile' => '0591234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $response->assertStatus(201);
        $response->assertJson(['status' => true]);
        $this->assertDatabaseHas('users', ['email' => 'test@test.com']);
    }

    public function test_craftsman_can_register(): void {
        $category = Category::factory()->create();
        $response = $this->postJson('api/auth/register', [
            'role' => 'craftsman',
            'name' => 'Test User',
            'email' => 'test@test.com',
            'mobile' => '0591234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'city' => 'Nablus',
            'bio' => 'Skilled Craftsman',
            'category_id' => $category->id,
            'years_experience' => '1',
        ]);
        $response->assertStatus(201);
        $response->assertJson(['status' => true]);
        $this->assertDatabaseHas('craftspeople', ['email' => 'test@test.com']);
    }

    public function test_user_can_login(): void {
        $user = User::factory()->create();
        $response = $this->postJson('api/auth/login', [
            'role' => 'user',
            'email' => $user->email,
            'password' => 'password',
        ]);
        $response->assertStatus(200);
    }

    public function test_user_can_not_login_wrong_password(): void {
        $user = User::factory()->create();
        $response = $this->postJson('api/auth/login', [
            'role' => 'user',
            'email' => $user->email,
            'password' => 'password1',
        ]);
        $response->assertStatus(401);
    }

    public function test_craftsman_can_not_login_unverified(): void {
        $craftsman = Craftsman::factory()->create(['is_verified' => false]);
        $response = $this->postJson('api/auth/login', [
            'role' => 'craftsman',
            'email' => $craftsman->email,
            'password' => 'password',
        ]);
        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_get_profile(): void {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('api/auth/me');
        $response->assertStatus(200);
        $response->assertJson(['status' => true]);
    }

    public function test_logged_in_user_can_logout(): void {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('api/auth/logout');
        $response->assertStatus(200);
        $response->assertJson(['status' => true]);
    }
}
