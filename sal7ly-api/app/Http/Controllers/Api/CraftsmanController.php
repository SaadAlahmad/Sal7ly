<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Craftsman\UpdateCraftsmanProfileRequest;
use App\Models\Craftsman;
use App\Models\Project;
use App\Models\Review;
use Illuminate\Http\Request;

class CraftsmanController extends Controller
{
    public function index(Request $request) {
        $query = Craftsman::where('is_verified', true);

        if ($request->query('city'))
            $query->where('city', $request->query('city'));

        if ($request->query('category_id'))
            $query->where('category_id', $request->query('category_id'));

        return response()->json(['status' => true, 'data' => $query->get()]);
    }

    public function show(Craftsman $craftsman) {
        if (!$craftsman->is_verified)
            return response()->json(['status' => false, 'message' => 'Craftsman not found.'], 404);

        $projectIds = Project::where('craftsman_id', $craftsman->id)->pluck('id');
        $reviews = Review::whereIn('project_id', $projectIds)
            ->where('direction', 'client_to_craftsman')
            ->where('status', 'visible')->get();

        $craftsman->load(['rating', 'category', 'worksamples']);

        return response()->json([
            'status' => true,
            'data' => $craftsman,
            'reviews' => $reviews,
        ]);
    }

    public function updateProfile(UpdateCraftsmanProfileRequest $request) {
        $craftsman = $request->user();
        $craftsman->fill($request->validated());
        $craftsman->save();
        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully.',
            'data' => $craftsman,
        ]);
    }
}
