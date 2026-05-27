<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // for testing purposes -> done by claude
        // clients
        $clientIds = [];
        $clients = [
            ['name' => 'Ahmed Hassan',   'email' => 'ahmed@test.com',  'mobile' => '0591111111'],
            ['name' => 'Sara Khalil',    'email' => 'sara@test.com',   'mobile' => '0592222222'],
            ['name' => 'Omar Nasser',    'email' => 'omar@test.com',   'mobile' => '0593333333'],
        ];

        foreach ($clients as $client) {
            $clientIds[] = DB::table('users')->insertGetId([
                'name'              => $client['name'],
                'email'             => $client['email'],
                'mobile'            => $client['mobile'],
                'password'          => Hash::make('password'),
                'is_admin'          => false,
                'status'            => 'active',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // craftspeople
        $craftsmanIds = [];
        $categoryIds  = DB::table('categories')->pluck('id')->toArray();

        $craftspeople = [
            ['name' => 'Khalid Mansour', 'email' => 'khalid@test.com', 'mobile' => '0594444444', 'city' => 'Nablus',   'bio' => 'Expert plumber with 10 years of experience.'],
            ['name' => 'Yusuf Hamed',    'email' => 'yusuf@test.com',  'mobile' => '0595555555', 'city' => 'Ramallah', 'bio' => 'Certified electrician specializing in residential wiring.'],
            ['name' => 'Tariq Saleh',    'email' => 'tariq@test.com',  'mobile' => '0596666666', 'city' => 'Nablus',   'bio' => 'Experienced carpenter, furniture and woodwork.'],
        ];

        foreach ($craftspeople as $index => $craftsman) {
            $id = DB::table('craftspeople')->insertGetId([
                'name'              => $craftsman['name'],
                'email'             => $craftsman['email'],
                'mobile'            => $craftsman['mobile'],
                'password'          => Hash::make('password'),
                'category_id'       => $categoryIds[$index],
                'city'              => $craftsman['city'],
                'bio'               => $craftsman['bio'],
                'avatar_path'       => null,
                'years_experience'  => rand(2, 15),
                'availability'      => true,
                'is_verified'       => true,
                'subscription_tier' => 'free',
                'is_featured'       => false,
                'is_badge_verified' => false,
                'credits_balance'   => 0,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            $craftsmanIds[] = $id;

            // ratings
            DB::table('craftsman_ratings')->insert([
                'craftsman_id'   => $id,
                'reviews_count'  => 0,
                'average_rating' => 0,
                'bayesian_score' => 0,
                'updated_at'     => now(),
            ]);
        }

        // requests
        $requestIds = [];
        $requests = [
            ['user_id' => $clientIds[0], 'category_id' => $categoryIds[0], 'title' => 'Fix leaking kitchen pipe',       'details' => 'The pipe under my kitchen sink has been leaking for a week.',  'city' => 'Nablus',   'location' => 'Old City'],
            ['user_id' => $clientIds[1], 'category_id' => $categoryIds[1], 'title' => 'Install new light fixtures',     'details' => 'Need 4 ceiling light fixtures installed in the living room.',   'city' => 'Ramallah', 'location' => 'Al-Bireh'],
            ['user_id' => $clientIds[2], 'category_id' => $categoryIds[2], 'title' => 'Build a wooden bookshelf',       'details' => 'Looking for a carpenter to build a custom bookshelf.',          'city' => 'Nablus',   'location' => 'Rafidia'],
            ['user_id' => $clientIds[0], 'category_id' => $categoryIds[0], 'title' => 'Bathroom pipe replacement',      'details' => 'Old pipes need full replacement in the main bathroom.',         'city' => 'Nablus',   'location' => 'Beit Wazan'],
        ];

        foreach ($requests as $request) {
            $requestIds[] = DB::table('requests')->insertGetId([
                'user_id'        => $request['user_id'],
                'category_id'    => $request['category_id'],
                'title'          => $request['title'],
                'details'        => $request['details'],
                'city'           => $request['city'],
                'location'       => $request['location'],
                'budget'         => rand(100, 1000),
                'status'         => 'open',
                'closure_reason' => null,
                'is_featured'    => false,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        // applications
        $applicationId = DB::table('applications')->insertGetId([
            'request_id'     => $requestIds[0],
            'craftsman_id'   => $craftsmanIds[0],
            'cover_letter'   => 'I have fixed hundreds of kitchen pipes. I can come tomorrow morning.',
            'proposed_price' => 150.00,
            'status'         => 'accepted',
            'closure_reason' => null,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        // mark request as assigned
        DB::table('requests')->where('id', $requestIds[0])->update(['status' => 'assigned']);

        // project
        $projectId = DB::table('projects')->insertGetId([
            'request_id'      => $requestIds[0],
            'application_id'  => $applicationId,
            'craftsman_id'    => $craftsmanIds[0],
            'user_id'         => $clientIds[0],
            'status'          => 'in_progress',
            'auto_complete_at'=> null,
            'completed_at'    => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        // conversation
        $conversationId = DB::table('conversations')->insertGetId([
            'project_id'   => $projectId,
            'user_id'      => $clientIds[0],
            'craftsman_id' => $craftsmanIds[0],
            'created_at'   => now(),
        ]);

        // messages
        DB::table('messages')->insert([
            [
                'conversation_id' => $conversationId,
                'sender_id'       => $clientIds[0],
                'sender_type'     => 'user',
                'body'            => 'Hello, when can you come?',
                'read_at'         => now(),
                'created_at'      => now(),
            ],
            [
                'conversation_id' => $conversationId,
                'sender_id'       => $craftsmanIds[0],
                'sender_type'     => 'craftsman',
                'body'            => 'Tomorrow at 9am works for me.',
                'read_at'         => null,
                'created_at'      => now(),
            ],
        ]);
    }
}
