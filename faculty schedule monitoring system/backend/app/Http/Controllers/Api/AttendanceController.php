<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with(['schedule', 'faculty']);

        if ($request->has('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        if ($request->has('schedule_id')) {
            $query->where('schedule_id', $request->schedule_id);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Faculty users may only view their own attendance records.
        $user = $request->user();
        if (!$user->isAdmin()) {
            $ownFaculty = $user->faculty;
            $query->where('faculty_id', $ownFaculty?->id ?? 0);
        }

        return response()->json($query->orderByDesc('date')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'date' => 'required|date',
                'status' => 'required|in:present,absent,late,excused',
                'time_in' => 'nullable|date_format:H:i',
                'time_out' => 'nullable|date_format:H:i|after:time_in',
                'remarks' => 'nullable|string',
            ]);

            $schedule = Schedule::findOrFail($validated['schedule_id']);

            $requestUser = $request->user();
            if (!$requestUser->isAdmin()) {
                $ownFaculty = $requestUser->faculty;
                if (!$ownFaculty || $ownFaculty->id != $schedule->faculty_id) {
                    return response()->json([
                        'message' => 'Forbidden. You may only record attendance for your own schedules.',
                    ], 403);
                }
            }

            $validated['faculty_id'] = $schedule->faculty_id;

            $attendance = Attendance::updateOrCreate(
                ['schedule_id' => $validated['schedule_id'], 'date' => $validated['date']],
                $validated
            );

            return response()->json($attendance->load(['schedule', 'faculty']), 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $attendance = Attendance::with(['schedule', 'faculty'])->findOrFail($id);
        return response()->json($attendance);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $attendance = Attendance::findOrFail($id);

            $requestUser = $request->user();
            if (!$requestUser->isAdmin()) {
                $ownFaculty = $requestUser->faculty;
                if (!$ownFaculty || $ownFaculty->id != $attendance->faculty_id) {
                    return response()->json([
                        'message' => 'Forbidden. You may only modify your own attendance records.',
                    ], 403);
                }
            }

            $validated = $request->validate([
                'status' => 'sometimes|required|in:present,absent,late,excused',
                'time_in' => 'nullable|date_format:H:i',
                'time_out' => 'nullable|date_format:H:i|after:time_in',
                'remarks' => 'nullable|string',
            ]);

            $attendance->update($validated);
            return response()->json($attendance->load(['schedule', 'faculty']));
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $attendance = Attendance::findOrFail($id);

        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden. Admin access required to delete attendance records.',
            ], 403);
        }

        $attendance->delete();
        return response()->json(['message' => 'Attendance record deleted successfully']);
    }
}
