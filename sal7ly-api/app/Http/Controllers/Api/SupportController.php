<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Support\StoreSupportRequest;
use App\Models\Support;
use App\Models\User;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function store(StoreSupportRequest $request) {
        $ticket = new Support();
        $ticket->fill($request->only('name', 'email', 'message'));
        if($request->user()) {
            $ticket->user_id = $request->user()->id;
            $ticket->user_type = ($request->user() instanceof User) ? 'user' : 'craftsman';
        }
        $ticket->save();
        return response()->json(['status' => true, 'message' => 'Support message sent.', 'data' => $ticket], 201);
    }
}
