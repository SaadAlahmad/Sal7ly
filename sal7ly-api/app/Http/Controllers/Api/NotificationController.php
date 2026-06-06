<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $userType = $user instanceof User ? 'user' : 'craftsman';

        $notifications = Notification::where('user_id', $user->id)->where('user_type', $userType)->latest()->paginate(20);

        return response()->json(['status' => true, 'data' => $notifications]);
    }

    public function markRead(Request $request, Notification $notification) {
        $user = $request->user();
        $userType = $user instanceof User ? 'user' : 'craftsman';

        if ($notification->user_id !== $user->id || $notification->user_type !== $userType)
            return response()->json(['status' => false, 'message' => 'Forbidden.'], 403);

        if ($notification->read_at)
            return response()->json(['status' => false, 'message' => 'Notification already read.'], 422);

        $notification->read_at = now();
        $notification->save();
        return response()->json(['status' => true, 'message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request) {
        $user = $request->user();
        $userType = $user instanceof User ? 'user' : 'craftsman';

        Notification::where('user_type', $userType)->where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['status' => true, 'message' => 'Marked all notification as read.'], 200);
    }
}
