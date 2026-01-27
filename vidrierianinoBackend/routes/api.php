<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

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
});

Route::post('/contact', [App\Http\Controllers\MailController::class, 'send']);
