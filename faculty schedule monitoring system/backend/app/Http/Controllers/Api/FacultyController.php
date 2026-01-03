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
        $faculties = Faculty::with('schedules')->get();
        return response()->json($faculties);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:faculties,email',
                'department' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'office_location' => 'nullable|string',
            ]);

            $faculty = Faculty::create($validated);
            return response()->json($faculty, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $faculty = Faculty::with('schedules')->findOrFail($id);
        return response()->json($faculty);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $faculty = Faculty::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:faculties,email,' . $id,
                'department' => 'sometimes|required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'office_location' => 'nullable|string',
            ]);

            $faculty->update($validated);
            return response()->json($faculty);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted successfully']);
    }
}
