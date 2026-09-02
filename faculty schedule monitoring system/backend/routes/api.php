<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ScheduleNotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check route
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Faculty Schedule API Routes
    Route::apiResource('faculties', FacultyController::class);
    Route::apiResource('schedules', ScheduleController::class);

    // Attendance API Routes
    Route::apiResource('attendances', AttendanceController::class);

    // Notification API Routes
    Route::get('/notifications', [ScheduleNotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [ScheduleNotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}', [ScheduleNotificationController::class, 'destroy']);

    // Room API Routes
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);

    // Admin-only room routes
    Route::middleware('admin')->group(function () {
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);
    });
});

