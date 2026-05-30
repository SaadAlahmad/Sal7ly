<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\JobRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function() {
    Route::post('register', [RegisterController::class, 'register']);
    Route::post('login', [LoginController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function() {
        Route::post('logout', [LogoutController::class, 'logout']);
        Route::get('me', [MeController::class, 'me']);
    });
});

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
    Route::put('applications/{application}', [ApplicationController::class, 'update']);
    Route::delete('applications/{application}', [ApplicationController::class, 'destroy']);
});

