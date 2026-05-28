<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Craftsman;
use App\Models\CraftsmanRating;
use App\Models\User;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
    public function register(RegisterRequest $request) {
        $role = $request->input('role');

        if($role === 'craftsman') {
            $data = $request->only(['name', 'email', 'mobile', 'password', 'city', 'bio', 'years_experience']);
            $account = new Craftsman();
            $account->fill($data);
            $account->category_id = $request->input('category_id');
            $account->save();
            CraftsmanRating::create([
                'craftsman_id'   => $account->id,
                'reviews_count'  => 0,
                'average_rating' => 0,
                'bayesian_score' => 0,
            ]);
        } else {
            $data = $request->only(['name', 'email', 'mobile', 'password']);
            $account = User::create($data);
        }

        $token = $account->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Registration Successful.',
            'token' => $token,
            'account' => $account,
        ], 201);
    }
}
