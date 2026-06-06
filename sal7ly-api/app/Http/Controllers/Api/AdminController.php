<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Craftsman;
use App\Models\Dispute;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Review;
use App\Models\Support;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // CRAFTSPEOPLE
    public function pendingCraftspeople() {
        $unverifiedCraftspeople = Craftsman::where('is_verified', false)->where('status', 'active')->get();
        return response()->json(['status' => true, 'data' => $unverifiedCraftspeople], 200);
    }

    public function bannedCraftspeople() {
        $bannedCraftspeople = Craftsman::where('is_verified', false)->where('status', 'banned')->get();
        return response()->json(['status' => true, 'data' => $bannedCraftspeople], 200);
    }

    public function verifyCraftsman(Craftsman $craftsman) {
        if($craftsman->status === 'banned') return response()->json(['status' => false, 'message' => 'Craftsman is banned.'], 422);
        if($craftsman->is_verified) return response()->json(['status' => true, 'message' => 'no change.'], 200);

        $craftsman->is_verified = true;
        $craftsman->save();
        return response()->json(['status' => true, 'message' => 'Craftsman verified successfully.'], 200);
    }

    public function banCraftsman(Craftsman $craftsman) {
        if($craftsman->status === 'banned' || !$craftsman->is_verified)
            return response()->json(['status'=> false, 'message' => 'Craftsman already banned or not verified'], 422);

        $craftsman->status = 'banned';
        $craftsman->is_verified = false;
        $craftsman->save();

        return response()->json(['status' => true, 'message' => 'Craftsman banned'], 200);
    }

    public function unbanCraftsman(Craftsman $craftsman) {
        if($craftsman->status === 'active')
            return response()->json(['status' => true, 'message' => 'Craftsman is not banned.'], 200);

        $craftsman->status = 'active';
        $craftsman->is_verified = true;
        $craftsman->save();
        return response()->json(['status' => true, 'message' => 'Craftsman unbanned successfully.'], 200);
    }

    // USERS
    public function banUser(User $user) {
        if($user->status === 'banned') return response()->json(['status' => false, 'message' => 'User already banned.'], 422);

        $user->status = 'banned';
        $user->save();
        return response()->json(['status' => true, 'message' => 'User banned successfully.'], 200);
    }

    public function unbanUser(User $user) {
        if($user->status === 'active') return response()->json(['status' => false, 'message' => 'User not banned.'], 200);

        $user->status = 'active';
        $user->save();
        return response()->json(['status' => true, 'message' => 'User unbanned successfully.'], 200);
    }

    // DISPUTES
    public function disputes() {
        $disputes = Dispute::where('status', 'open')->get();
        return response()->json(['status' => true, 'data' => $disputes], 200);
    }

    public function resolveDispute(Request $request, Dispute $dispute) {
        $project = $dispute->project;
        $request->validate([
            'resolution_note' => ['required', 'string'],
            'outcome' => ['required', 'in:completed,cancelled'],
        ]);

        if($dispute->status === 'resolved') return response()->json(['status' => false, 'message' => 'Dispute already resolved.'], 200);
        $outcome = $request->input('outcome'); // for project (complete or cancel)
        if ($outcome === 'cancelled') {
            $project->status = 'cancelled';
        } else {
            $project->status = 'completed';
            $project->completed_at = now();
        }
        $project->save();

        $dispute->resolution_note = $request->input('resolution_note');
        $dispute->status = 'resolved';
        $dispute->save();
        return response()->json(['status' => true, 'message' => 'Dispute resolved successfully.'], 200);
    }

    // REVIEWS
    public function hideReview(Review $review) {
        if($review->status === 'hidden') return response()->json(['status' => false, 'message' => 'Review already hidden.'], 422);
        $review->status = 'hidden';
        $review->save();
        return response()->json(['status' => true, 'message' => 'Review hidden successfully.'], 200);
    }

    // SUPPORT
    public function supportTickets() {
        $tickets = Support::where('status', 'open')->get();
        return response()->json(['status' => true, 'data' => $tickets], 200);
    }

    public function updateSupportStatus(Request $request, Support $support) {
        $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved'],
        ]);

        $support->status = $request->input('status');
        $support->save();
        return response()->json(['status' => true, 'message' => 'Ticket updated successfully.', 'data' => $support]);
    }

    // CATEGORIES
    public function categories() {
        $categories = Category::all();
        return response()->json(['status' => true, 'data' => $categories], 200);
    }

    public function storeCategory(Request $request) {
        $request->validate([
            'name' => ['required', 'unique:categories,name', 'string', 'max:100'],
            'slug' => ['required', 'unique:categories,slug', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $category = new Category();
        $category->fill($request->only(['name', 'slug', 'icon', 'description']));
        $category->save();
        return response()->json(['status' => true, 'message' => 'Category added.', 'data' => $category], 200);
    }

    public function updateCategory(Request $request, Category $category) {
        $request->validate([
            'name' => ['sometimes', Rule::unique('categories', 'name')->ignore($category->id), 'string', 'max:100'],
            'slug' => ['sometimes', Rule::unique('categories', 'slug')->ignore($category->id), 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $category->fill($request->only(['name', 'slug', 'icon', 'description']));
        $category->save();
        return response()->json(['status' => true, 'message' => 'Category saved.', 'data' => $category], 200);
    }

    public function destroyCategory(Category $category) {
        if ($category->craftspeople()->count() > 0)
            return response()->json(['status' => false, 'message' => 'Cannot delete a category with craftspeople assigned to it.'], 422);

        $category->delete();
        return response()->json(['status' => true, 'message' => 'Category deleted.'], 200);
    }

    // NOTIFICATIONS
    public function sendNotification(Request $request) {
        $request->validate([
            'target_id' => ['required', 'integer'],
            'user_type' => ['required', 'string', 'in:user,craftsman'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable'],
        ]);

        $notification = new Notification();
        $notification->user_id = $request->input('target_id');
        $notification->user_type = $request->input('user_type');
        $notification->type = 'admin_warning';
        $notification->title = $request->input('title');
        $notification->body = $request->input('body');
        $notification->save();

        return response()->json(['status' => true, 'message' => 'Notification sent.', 'data' => $notification], 200);
    }
}
