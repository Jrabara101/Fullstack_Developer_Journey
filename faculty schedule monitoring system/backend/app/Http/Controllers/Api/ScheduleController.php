<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Schedule::with('faculty');
        
        if ($request->has('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }
        
        if ($request->has('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }
        
        $schedules = $query->get();
        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'faculty_id' => 'required|exists:faculties,id',
                'course_name' => 'required|string|max:255',
                'course_code' => 'required|string|max:50',
                'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'room' => 'required|string|max:100',
                'semester' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
            ]);

            $schedule = Schedule::create($validated);
            return response()->json($schedule->load('faculty'), 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $schedule = Schedule::with('faculty')->findOrFail($id);
        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $schedule = Schedule::findOrFail($id);
            
            $validated = $request->validate([
                'faculty_id' => 'sometimes|required|exists:faculties,id',
                'course_name' => 'sometimes|required|string|max:255',
                'course_code' => 'sometimes|required|string|max:50',
                'day_of_week' => 'sometimes|required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
                'room' => 'sometimes|required|string|max:100',
                'semester' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
            ]);

            $schedule->update($validated);
            return response()->json($schedule->load('faculty'));
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();
        return response()->json(['message' => 'Schedule deleted successfully']);
    }
}
