<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function me(Request $request)
    {
        $role = $request->user() instanceof User ? 'user' : 'craftsman';

        return response()->json([
            'status' => true,
            'role' => $role,
            'account' => $request->user(),
        ]);
    }
}
