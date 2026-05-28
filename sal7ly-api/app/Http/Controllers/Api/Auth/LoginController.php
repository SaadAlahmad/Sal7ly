<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(LoginRequest $request)
    {
        $role  = $request->input('role');
        $email = $request->input('email');

        $account = $role === 'craftsman'
            ? Craftsman::where('email', $email)->first()
            : User::where('email', $email)->first();

        if (!$account || !Hash::check($request->input('password'), $account->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if ($role === 'craftsman' && !$account->is_verified) {
            return response()->json([
                'status'  => false,
                'message' => 'Your account is pending admin approval.',
            ], 403);
        }

        if ($role === 'user' && $account->status !== 'active') {
            return response()->json([
                'status'  => false,
                'message' => 'Your account has been suspended.',
            ], 403);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Login successful.',
            'token'   => $account->createToken('auth_token')->plainTextToken,
            'account' => $account,
        ]);
    }
}
