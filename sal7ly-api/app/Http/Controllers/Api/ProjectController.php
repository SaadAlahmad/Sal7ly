<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\RaiseDisputeRequest;
use App\Models\Craftsman;
use App\Models\Dispute;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();

        if ($user instanceof User) {
            $projs = Project::where('user_id', $user->id)->get();
        } else {
            $projs = Project::where('craftsman_id', $user->id)->get();
        }

        return response()->json(['status' => true, 'data' => $projs]);
    }

    public function show(Request $request, Project $proj) {
        $user = $request->user();
        if(($user instanceof User && $user->id !== $proj->user_id) || ($user instanceof Craftsman && $user->id !== $proj->craftsman_id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }
        return response()->json(['status' => true, 'data' => $proj]);
    }

    public function complete(Request $request, Project $proj) {
        $user = $request->user();
        if(!$user instanceof Craftsman || $user->id !== $proj->craftsman_id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }
        if($proj->status !== 'in_progress') {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden.',
            ], 403);
        } else {
            $proj->status = 'pending_completion';
            $proj->auto_complete_at = now()->addDays(7);
            $proj->save();
            return response()->json([
                'status' => true,
                'message' => 'Project marked as complete by craftsman. Awaiting user confirmation.',
                'data' => $proj
            ]);
        }
    }

    public function confirm(Request $request, Project $proj) {
        $user = $request->user();
        if(!$user instanceof User || $user->id !== $proj->user_id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }
        if($proj->status !== 'pending_completion') {
            return response()->json([
                'status' => false,
                'message' => 'Forbidden.',
            ], 403);
        } else {
            $proj->status = 'completed';
            $proj->completed_at = now();
            $proj->save();
            return response()->json([
                'status' => true,
                'message' => 'Project marked complete.',
                'data' => $proj
            ]);
        }
    }

    public function cancel(Request $request, Project $proj) {
        $user = $request->user();
        if(($user instanceof User && $user->id !== $proj->user_id) || ($user instanceof Craftsman && $user->id !== $proj->craftsman_id)) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }
        if ($proj->status === 'completed') return response()->json(['status' => false, 'message' => 'Cannot cancel a completed project.'], 403);
        $proj->status = 'cancelled';
        $proj->save();
        return response()->json([
            'status' => true,
            'message' => 'Project canceled.',
            'data' => $proj
        ]);
    }

    public function dispute(RaiseDisputeRequest $request, Project $proj) {
        $user = $request->user();
        if(!$user instanceof User || $user->id !== $proj->user_id)
            return response()->json(['status' => false, 'message' => 'Unauthorized.'], 403);
        if ($proj->status !== 'pending_completion')
            return response()->json(['status' => false, 'message' => 'You can only raise a dispute on a pending completion project.'], 403);

        $proj->auto_complete_at = null;
        $proj->save();
        $dispute = new Dispute();
        $dispute->fill($request->validated());
        $dispute->project_id = $proj->id;
        $dispute->raised_by_id = $user->id;
        $dispute->raised_by_type = 'user';
        $dispute->save();
        return response()->json([
            'status' => true,
            'message' => 'Dispute requested successfully.',
            'data' => $dispute,
        ], 201);
    }
}
