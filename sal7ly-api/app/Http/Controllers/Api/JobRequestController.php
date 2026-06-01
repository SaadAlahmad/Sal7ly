<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobRequest\DeleteJobRequestRequest;
use App\Http\Requests\JobRequest\StoreJobRequestRequest;
use App\Http\Requests\JobRequest\UpdateJobRequestRequest;
use App\Models\JobRequest;
use App\Models\User;
use Illuminate\Http\Request;

class JobRequestController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();

        if ($user instanceof User) {
            $jobs = JobRequest::where('user_id', $user->id)->get();
        } else {
            $jobs = JobRequest::where('status', 'open')
                ->where('city', $user->city)
                ->where('category_id', $user->category_id)
                ->get();
        }

        return response()->json(['status' => true, 'data' => $jobs]);
    }

    public function store(StoreJobRequestRequest $request) {
        $job = new JobRequest();
        $job->fill($request->only(['title', 'details', 'city', 'location', 'budget']));
        $job->user_id = $request->user()->id;
        $job->category_id = $request->input('category_id');
        $job->save();
        return response()->json([
            'status' => true,
            'message' => 'Job posted successfully.',
            'data' => $job,
        ], 201);
    }

    public function show(JobRequest $jobRequest) {
        return response()->json([
            'status' => true,
            'data' => $jobRequest,
        ]);
    }

    public function update(UpdateJobRequestRequest $request, JobRequest $jobRequest) {
        if(!$this->isOwner($request, $jobRequest)) {
            return response()->json([
                'status' => false,
                'message' => 'Action Forbidden',
            ], 403);
        }

        if ($jobRequest->status !== 'open') {
            return response()->json([
                'status' => false,
                'message' => 'You can only edit open job requests.',
            ], 403);
        }

        $jobRequest->fill($request->validated());
        $jobRequest->save();
        return response()->json([
            'status' => true,
            'message' => 'Job request updated successfully',
            'data' => $jobRequest,
        ]);
    }

    public function destroy(DeleteJobRequestRequest $request, JobRequest $jobRequest) {
        if(!$this->isOwner($request, $jobRequest)) {
            return response()->json([
                'status' => false,
                'message' => 'Action Forbidden',
            ], 403);
        }
        if ($jobRequest->status !== 'open') {
            return response()->json([
                'status' => false,
                'message' => 'You can only close open job requests.',
            ], 403);
        }

        $jobRequest->status = 'closed';
        $jobRequest->closure_reason = 'user';
        $jobRequest->save();
        return response()->json([
            'status' => true,
            'message' => 'Job request closed.',
        ]);
    }

    private function isOwner(Request $request, JobRequest $jobRequest): bool {
        return $jobRequest->user_id === $request->user()->id;
    }

}
