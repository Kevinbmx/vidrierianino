<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\LeadController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Example of a protected route with permission middleware
    Route::get('/products', function () {
        return response()->json(['message' => 'You can see products']);
    })->middleware('permission:ver-productos');

    // Rutas para la gestion de imagenes
    Route::apiResource('images', App\Http\Controllers\ImageController::class)->except(['show']);

    // Admin Lead Management (Protected)
    Route::prefix('leads')->group(function () {
        Route::get('/', [LeadController::class, 'index']);
        Route::get('/stats', [LeadController::class, 'getDashboardStats']);
        Route::get('/{lead}', [LeadController::class, 'show']);
        Route::patch('/{lead}/status', [LeadController::class, 'updateStatus']);
        Route::post('/{lead}/appointment', [LeadController::class, 'scheduleAppointment']);
        Route::post('/{lead}/appointment/cancel', [LeadController::class, 'cancelAppointment']);
        Route::post('/{lead}/visit-done', [LeadController::class, 'markVisitDone']);
        Route::post('/{lead}/quote', [LeadController::class, 'sendQuote']);
        Route::post('/{lead}/approve', [LeadController::class, 'approveProject']);
        Route::post('/{lead}/reject', [LeadController::class, 'rejectProject']);
        Route::post('/{lead}/install', [LeadController::class, 'markInstalled']);
        Route::post('/{lead}/notes', [LeadController::class, 'addNote']);
        Route::post('/{lead}/photos', [LeadController::class, 'uploadPhoto']);
        Route::get('/{lead}/whatsapp', [LeadController::class, 'getWhatsAppLink']);
    });
});

// Public Lead Capture (STEP 1)
Route::post('/leads', [LeadController::class, 'store']);

Route::post('/contact', [App\Http\Controllers\MailController::class, 'send']);
