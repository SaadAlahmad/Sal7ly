<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\CraftsmanController;
use App\Http\Controllers\Api\JobRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\WorksampleController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function() {
    Route::post('register', [RegisterController::class, 'register']);
    Route::post('login', [LoginController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function() {
        Route::post('logout', [LogoutController::class, 'logout']);
        Route::get('me', [MeController::class, 'me']);
    });
});

// public -> does not need auth
Route::get('craftsmen', [CraftsmanController::class, 'index']);
Route::get('craftsmen/{craftsman}', [CraftsmanController::class, 'show']);
Route::get('craftsmen/{craftsman}/worksamples', [WorksampleController::class, 'index']);
Route::post('support', [SupportController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    // requests
    Route::get('requests', [JobRequestController::class, 'index']);
    Route::post('requests', [JobRequestController::class, 'store']);
    Route::get('requests/{jobRequest}', [JobRequestController::class, 'show']);
    Route::put('requests/{jobRequest}', [JobRequestController::class, 'update']);
    Route::delete('requests/{jobRequest}', [JobRequestController::class, 'destroy']);
    // applications
    Route::get('applications', [ApplicationController::class, 'index']);
    Route::post('applications', [ApplicationController::class, 'store']);
    Route::get('applications/{application}', [ApplicationController::class, 'show']);
    Route::put('applications/{application}', [ApplicationController::class, 'update']); // ACCEPTS THE APPLICATION -> CREATES THE PROJECT & CONVERSATION
    Route::delete('applications/{application}', [ApplicationController::class, 'destroy']);
    // projects
    Route::get('projects', [ProjectController::class, 'index']);
    Route::get('projects/{proj}', [ProjectController::class, 'show']);
    Route::patch('projects/{proj}/complete', [ProjectController::class, 'complete']);
    Route::patch('projects/{proj}/confirm', [ProjectController::class, 'confirm']);
    Route::patch('projects/{proj}/cancel', [ProjectController::class, 'cancel']);
    Route::post('projects/{proj}/dispute', [ProjectController::class, 'dispute']); // CREATES DISPUTE
    // Reviews
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::get('reviews/my', [ReviewController::class, 'myReviews']);
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
    // Craftsman Profile
    Route::patch('craftsmen/profile', [CraftsmanController::class, 'updateProfile']);
    // Worksamples
    Route::post('worksamples', [WorksampleController::class, 'store']);
    Route::patch('worksamples/{worksample}', [WorksampleController::class, 'update']);
    Route::delete('worksamples/{worksample}', [WorksampleController::class, 'destroy']);
    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Craftspeople
    Route::get('craftspeople/pending', [AdminController::class, 'pendingCraftspeople']);
    Route::get('craftspeople/banned', [AdminController::class, 'bannedCraftspeople']);
    Route::patch('craftspeople/{craftsman}/verify', [AdminController::class, 'verifyCraftsman']);
    Route::patch('craftspeople/{craftsman}/ban', [AdminController::class, 'banCraftsman']);
    Route::patch('craftspeople/{craftsman}/unban', [AdminController::class, 'unbanCraftsman']);
    // Users
    Route::patch('users/{user}/ban', [AdminController::class, 'banUser']);
    Route::patch('users/{user}/unban', [AdminController::class, 'unbanUser']);
    // Disputes
    Route::get('disputes', [AdminController::class, 'disputes']);
    Route::patch('disputes/{dispute}/resolve', [AdminController::class, 'resolveDispute']);
    // Reviews
    Route::patch('reviews/{review}/hide', [AdminController::class, 'hideReview']);
    // Support
    Route::get('support', [AdminController::class, 'supportTickets']);
    Route::patch('support/{support}/status', [AdminController::class, 'updateSupportStatus']);
    // Categories
    Route::get('categories', [AdminController::class, 'categories']);
    Route::post('categories', [AdminController::class, 'storeCategory']);
    Route::put('categories/{category}', [AdminController::class, 'updateCategory']);
    Route::delete('categories/{category}', [AdminController::class, 'destroyCategory']);
    // Notifications
    Route::post('notifications/send', [AdminController::class, 'sendNotification']);
});
