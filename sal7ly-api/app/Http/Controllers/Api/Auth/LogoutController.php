<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if(method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
