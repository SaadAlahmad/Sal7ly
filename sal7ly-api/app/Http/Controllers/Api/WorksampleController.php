<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Worksample\StoreWorksampleRequest;
use App\Models\Craftsman;
use App\Models\Worksample;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorksampleController extends Controller
{
    public function index(Craftsman $craftsman) {
        $worksamples = Worksample::where('craftsman_id', $craftsman->id)->get();
        return response()->json(['status' => true, 'data' => $worksamples]);
    }

    public function store(StoreWorksampleRequest $request) {
        $user = $request->user();

        if (Worksample::where('craftsman_id', $user->id)->count() >= 10)
            return response()->json(['status' => false, 'message' => 'Worksample limit reached.'], 422);

        $file = $request->file('file');

        $worksample = new Worksample();
        $worksample->craftsman_id = $user->id;
        $worksample->fill($request->only(['title', 'description']));
        $worksample->file_type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image';
        $worksample->file_path = $file->store('worksamples', 'public');
        $worksample->save();

        return response()->json(['status' => true, 'message' => 'Worksample uploaded successfully.']);
    }

    public function update(Request $request, Worksample $worksample) {
        $user = $request->user();

        if(!$user instanceof Craftsman || $worksample->craftsman_id !== $user->id)
            return response()->json(['status' => false, 'message' => 'forbidden'], 403);

        $request->validate([
            'title' => ['sometimes', 'string', 'max:150'],
            'description' => ['sometimes', 'string'],
        ]);

        $worksample->fill($request->only(['title', 'description']));
        $worksample->save();
        return response()->json(['status' => true, 'message' => 'Worksample updated successfully'], 200);
    }

    public function destroy(Request $request, Worksample $worksample) {
        $user = $request->user();

        if(!$user instanceof Craftsman || $worksample->craftsman_id !== $user->id)
            return response()->json(['status' => false, 'message' => 'forbidden'], 403);

        Storage::delete($worksample->file_path);
        $worksample->delete();
        return response()->json(['status' => true, 'message' => 'Worksample deleted successfully.'], 200);
    }
}
