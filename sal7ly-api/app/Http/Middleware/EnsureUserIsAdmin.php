<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if(!$request->user() instanceof User || !$request->user()->is_admin) {
            return response()->json(['status' => false, 'message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
