<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\StoreApplicationRequest;
use App\Models\Application;
use App\Models\Conversation;
use App\Models\Craftsman;
use App\Models\JobRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();

        if($user instanceof User) {
            $applications = Application::whereRelation('jobRequest', 'user_id', $user->id)->where('status', 'pending')->get();
        } else {
            $applications = Application::where('craftsman_id', $user->id)->get();
        }
        return response()->json(['status' => true, 'data' => $applications]);
    }

    public function store(StoreApplicationRequest $request) {
        $jobRequest = JobRequest::find($request->input('request_id'));

        if ($jobRequest->status !== 'open') {
            return response()->json([
                'status' => false,
                'message' => 'This job is no longer accepting applications.',
            ], 422);
        }

        $application = new Application();
        $application->fill($request->only(['cover_letter', 'proposed_price']));
        $application->request_id = $request->input('request_id');
        $application->craftsman_id = $request->user()->id;
        $application->save();

        return response()->json([
            'status' => true,
            'message' => 'Application sent successfully.',
            'data' => $application,
        ], 201);
    }

    public function show(Request $request, Application $application) {
        $user = $request->user();
        $isOwnerCraftsman = $user instanceof Craftsman && $application->craftsman_id === $user->id;
        $isOwnerClient = $user instanceof User && $application->jobRequest->user_id === $user->id;

        if (!$isOwnerCraftsman && !$isOwnerClient) {
            return response()->json([
                'status' => false,
                'message' => 'Action Forbidden.',
            ], 403);
        }
        return response()->json([
            'status' => true,
            'data' => $application,
        ]);
    }

    public function update(Request $request, Application $application) {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['status' => false, 'message' => 'Action Forbidden.'], 403);
        }

        if ($application->jobRequest->user_id !== $user->id) {
            return response()->json(['status' => false, 'message' => 'Action Forbidden.'], 403);
        }

        if (!in_array($request->input('status'), ['accepted', 'rejected'])) {
            return response()->json(['status' => false, 'message' => 'Invalid status.'], 422);
        }

        if ($request->input('status') === 'rejected') {
            $application->status = 'rejected';
            $application->save();
            return response()->json(['status' => true, 'message' => 'Application rejected.']);
        }

        Application::where('request_id', $application->request_id)->where('id', '!=', $application->id)->update(['status' => 'rejected']);

        $application->jobRequest->status = 'assigned';
        $application->jobRequest->save();

        $project = new Project();
        $project->request_id = $application->request_id;
        $project->application_id = $application->id;
        $project->craftsman_id = $application->craftsman_id;
        $project->user_id = $application->jobRequest->user_id;
        $project->save();

        $conversation = new Conversation();
        $conversation->project_id = $project->id;
        $conversation->user_id = $application->jobRequest->user_id;
        $conversation->craftsman_id = $application->craftsman_id;
        $conversation->save();

        $application->status = 'accepted';
        $application->save();

        return response()->json([
            'status' => true,
            'message' => 'Application accepted.',
            'data' => $application,
        ]);
    }

    public function destroy(Request $request, Application $application) {
        $user = $request->user();
        if(!$user instanceof Craftsman) return response()->json(['status' => false, 'message' => 'Action Forbidden.'], 403);
        if($user->id !== $application->craftsman_id) return response()->json(['status' => false, 'message' => 'Action Forbidden.'], 403);
        if($application->status !== 'pending') return response()->json(['status' => false, 'message' => 'Action Forbidden.'], 403);

        $application->status = 'rejected';
        $application->closure_reason = 'user';
        $application->save();
        return response()->json([
            'status'  => true,
            'message' => 'Application cancelled.',
        ]);
    }
}
