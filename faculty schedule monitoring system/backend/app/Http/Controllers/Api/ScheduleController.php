<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

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
            // Validate based on which format is provided
            $hasDateFormat = $request->has('date') && $request->has('time') && $request->has('duration');
            $hasDayOfWeekFormat = $request->has('day_of_week') && $request->has('start_time') && $request->has('end_time');

            if (!$hasDateFormat && !$hasDayOfWeekFormat) {
                return response()->json([
                    'errors' => [
                        'schedule_time' => ['Either date/time/duration OR day_of_week/start_time/end_time must be provided']
                    ]
                ], 422);
            }

            $validated = $request->validate([
                // Format 1: date/time/duration (from frontend)
                'date' => 'required_without_all:day_of_week,start_time,end_time|date',
                'time' => 'required_without_all:day_of_week,start_time,end_time|date_format:H:i',
                'duration' => 'required_without_all:day_of_week,start_time,end_time|integer|min:1',
                
                // Format 2: day_of_week/start_time/end_time (existing format)
                'day_of_week' => 'required_without_all:date,time,duration|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'start_time' => 'required_without_all:date,time,duration|date_format:H:i',
                'end_time' => 'required_without_all:date,time,duration|date_format:H:i|after:start_time',
                
                // Common fields
                'faculty_id' => 'nullable|exists:faculties,id',
                'title' => 'nullable|string|max:255', // Maps to course_name
                'course_name' => 'nullable|string|max:255',
                'course_code' => 'nullable|string|max:50',
                'type' => 'nullable|string|in:class,meeting,office',
                'mode' => 'nullable|string|in:on-site,online',
                'room' => 'required|string|max:100',
                'semester' => 'nullable|string|max:50',
                'description' => 'nullable|string', // Maps to notes
                'notes' => 'nullable|string',
            ]);

            $facultyId = $validated['faculty_id'] ?? null;
            if (!$facultyId) {
                $user = $request->user();
                $faculty = $user?->faculty;

                if (!$faculty) {
                    return response()->json([
                        'message' => 'No faculty record found for this user. Please create a faculty profile first.',
                    ], 404);
                }

                $facultyId = $faculty->id;
            }

            // Prepare schedule data
            $scheduleData = [
                'faculty_id' => $facultyId,
                'room' => $validated['room'],
                'semester' => $validated['semester'] ?? null,
                'notes' => $validated['description'] ?? $validated['notes'] ?? null,
            ];

            // Handle course_name (title maps to course_name)
            if (isset($validated['title'])) {
                $scheduleData['course_name'] = $validated['title'];
                // Try to extract course code from title if course_code not provided
                if (empty($validated['course_code'])) {
                    if (preg_match('/([A-Z]+\s+\d+[A-Z]?)/', $validated['title'], $matches)) {
                        $scheduleData['course_code'] = $matches[1];
                    } else {
                        $scheduleData['course_code'] = substr($validated['title'], 0, 50);
                    }
                } else {
                    $scheduleData['course_code'] = $validated['course_code'];
                }
            } elseif (isset($validated['course_name'])) {
                $scheduleData['course_name'] = $validated['course_name'];
                $scheduleData['course_code'] = $validated['course_code'] ?? substr($validated['course_name'], 0, 50);
            } else {
                // Default if neither provided
                $type = $validated['type'] ?? 'class';
                $scheduleData['course_name'] = ucfirst($type);
                $scheduleData['course_code'] = strtoupper(substr($type, 0, 3));
            }

            // Convert date/time/duration format to day_of_week/start_time/end_time
            if ($hasDateFormat) {
                $date = Carbon::parse($validated['date']);
                $scheduleData['day_of_week'] = $date->format('l'); // Full day name (Monday, Tuesday, etc.)
                
                $startTime = Carbon::createFromFormat('H:i', $validated['time']);
                $scheduleData['start_time'] = $startTime->format('H:i:s');
                
                $duration = (int) $validated['duration'];
                $endTime = $startTime->copy()->addMinutes($duration);
                $scheduleData['end_time'] = $endTime->format('H:i:s');
            } else {
                // Use existing format
                $scheduleData['day_of_week'] = $validated['day_of_week'];
                $scheduleData['start_time'] = $validated['start_time'];
                $scheduleData['end_time'] = $validated['end_time'];
            }

            $schedule = Schedule::create($scheduleData);
            return response()->json($schedule->load('faculty'), 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating schedule: ' . $e->getMessage()
            ], 500);
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
