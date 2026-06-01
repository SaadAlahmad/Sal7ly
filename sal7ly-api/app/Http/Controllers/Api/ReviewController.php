<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Models\Craftsman;
use App\Models\Project;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index() {

    }

    public function myReviews() {

    }

    public function store(StoreReviewRequest $request) {
        $user = $request->user();
        $project = Project::where('id', $request->input('project_id'))->first();

        if(($user instanceof User && $project->user_id !== $user->id) || ($user instanceof Craftsman && $project->craftsman_id !== $user->id))
            return response()->json(['status' => false, 'message' => 'Unauthorized.'], 403);
        if($project->status !== 'completed') return response()->json(['status' => false, 'message' => 'Project not completed'], 403);
        if ($user instanceof User && $request->input('direction') !== 'client_to_craftsman')
            return response()->json(['status' => false, 'message' => 'Clients can only post client_to_craftsman reviews.'], 403);
        if ($user instanceof Craftsman && $request->input('direction') !== 'craftsman_to_client')
            return response()->json(['status' => false, 'message' => 'Craftsmen can only post craftsman_to_client reviews.'], 403);

        if($user instanceof User) {
            Review::where('project_id', $project->id)->where('direction', 'client_to_craftsman')->where('status', 'visible')->update(['status' => 'hidden']);
        } else {
            Review::where('project_id', $project->id)->where('direction', 'craftsman_to_client')->where('status', 'visible')->update(['status' => 'hidden']);
        }
        $review = new Review();
        $review->project_id = $project->id;
        $review->fill($request->only(['direction', 'rating', 'review_text']));
        $review->save();
        return response()->json([
            'status' => true,
            'message' => 'Review posted successfully.',
            'data' => $review,
        ], 201);
    }

    public function destroy() {

    }
}
