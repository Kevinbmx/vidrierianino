<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'message' => 'User registered successfully',
            'user' => new UserResource($user)
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = [
            $request->getLoginField() => $request->input('login'),
            'password' => $request->password,
        ];

        $data = $this->authService->login($credentials, $request->getLoginField());

        return response()->json([
            'access_token' => $data['token'],
            'token_type' => 'bearer',
            'user' => new UserResource($data['user'])
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
