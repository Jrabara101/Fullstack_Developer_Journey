<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class FacultyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $faculties = Faculty::with(['schedules', 'user'])->get();
        return response()->json($faculties);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'nullable|exists:users,id',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:faculties,email',
                'department' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'office_location' => 'nullable|string',
            ]);

            $requestUser = $request->user();
            $selfProvisioning = isset($validated['user_id']) && $validated['user_id'] == $requestUser->id;

            // Only admins may create faculty profiles for other users. A user may
            // create their own faculty profile (self-provisioning on first login).
            if (!$requestUser->isAdmin() && !$selfProvisioning) {
                return response()->json([
                    'message' => 'Forbidden. Admin access required to create a faculty profile for another user.',
                ], 403);
            }

            // If user_id is provided, check if faculty already exists for that user
            if (isset($validated['user_id'])) {
                $existingFaculty = Faculty::where('user_id', $validated['user_id'])->first();
                if ($existingFaculty) {
                    return response()->json([
                        'message' => 'Faculty record already exists for this user',
                        'faculty' => $existingFaculty
                    ], 409);
                }
            }

            $faculty = Faculty::create($validated);
            return response()->json($faculty->load('user'), 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $faculty = Faculty::with(['schedules', 'user'])->findOrFail($id);
        return response()->json($faculty);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $faculty = Faculty::findOrFail($id);

            $requestUser = $request->user();
            if (!$requestUser->isAdmin() && $requestUser->id != $faculty->user_id) {
                return response()->json([
                    'message' => 'Forbidden. You may only modify your own faculty profile.',
                ], 403);
            }

            $validated = $request->validate([
                'user_id' => 'sometimes|nullable|exists:users,id',
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:faculties,email,' . $id,
                'department' => 'sometimes|required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'office_location' => 'nullable|string',
            ]);

            // Non-admins cannot reassign which user a faculty profile belongs to.
            if (!$requestUser->isAdmin()) {
                unset($validated['user_id']);
            }

            $faculty->update($validated);
            return response()->json($faculty);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $faculty = Faculty::findOrFail($id);

        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden. Admin access required to delete faculty profiles.',
            ], 403);
        }

        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted successfully']);
    }
}
