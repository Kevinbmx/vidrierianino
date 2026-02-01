<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
        ]);

        $user->assignRole('cliente');

        return $user;
    }

    public function login(array $credentials, string $loginField): array
    {
        if (!auth()->attempt($credentials)) {
            throw ValidationException::withMessages([
                'login' => [__('auth.failed')],
            ]);
        }

        $user = auth()->user();

        if (!$user->is_active) {
            auth()->logout();
            throw ValidationException::withMessages([
                'login' => ['Your account is inactive.'],
            ]);
        }

        // Revoke all previous tokens if you want single session, or keep them for multiple devices.
        // For security, we might want to keep them or limit them. Standard Sanctum behavior is additive.

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
