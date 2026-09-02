<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\ScheduleNotification;
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
        $query = Schedule::with(['faculty', 'roomDetails']);

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
     * Find schedules that overlap the given day/time window for a faculty
     * and/or room, excluding the schedule with $excludeId (used on update).
     *
     * Two time ranges overlap when: existing.start < new.end AND existing.end > new.start
     */
    private function findConflicts(string $dayOfWeek, string $startTime, string $endTime, ?int $facultyId, ?int $roomId, ?int $excludeId = null)
    {
        $query = Schedule::where('day_of_week', $dayOfWeek)
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->where(function ($q) use ($facultyId, $roomId) {
                if ($facultyId) {
                    $q->orWhere('faculty_id', $facultyId);
                }
                if ($roomId) {
                    $q->orWhere('room_id', $roomId);
                }
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->with(['faculty', 'roomDetails'])->get();
    }

    /**
     * Build a human-readable conflict error payload from conflicting schedules.
     */
    private function conflictResponse($conflicts, ?int $facultyId, ?int $roomId): JsonResponse
    {
        $facultyClashes = $conflicts->filter(fn ($s) => $facultyId && $s->faculty_id == $facultyId);
        $roomClashes = $conflicts->filter(fn ($s) => $roomId && $s->room_id == $roomId);

        $messages = [];
        if ($facultyClashes->isNotEmpty()) {
            $messages[] = 'Faculty already has a schedule that overlaps this time slot.';
        }
        if ($roomClashes->isNotEmpty()) {
            $messages[] = 'Room is already booked for an overlapping time slot.';
        }

        return response()->json([
            'message' => 'Schedule conflict detected.',
            'errors' => [
                'schedule_time' => $messages ?: ['Schedule conflict detected.'],
            ],
            'conflicts' => $conflicts->values(),
        ], 409);
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

            // A non-admin faculty user may only create schedules for themselves.
            $requestUser = $request->user();
            if (!$requestUser->isAdmin()) {
                $ownFaculty = $requestUser->faculty;
                if (!$ownFaculty || $ownFaculty->id != $facultyId) {
                    return response()->json([
                        'message' => 'Forbidden. You may only create schedules for your own faculty profile.',
                    ], 403);
                }
            }

            // Resolve room_id from the room name, if it matches an existing room.
            $roomId = Room::whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($validated['room']))])->value('id');

            // Prepare schedule data
            $scheduleData = [
                'faculty_id' => $facultyId,
                'room' => $validated['room'],
                'room_id' => $roomId,
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

            $conflicts = $this->findConflicts(
                $scheduleData['day_of_week'],
                $scheduleData['start_time'],
                $scheduleData['end_time'],
                $facultyId,
                $roomId
            );

            if ($conflicts->isNotEmpty()) {
                return $this->conflictResponse($conflicts, $facultyId, $roomId);
            }

            $schedule = Schedule::create($scheduleData);

            $this->notifyFacultyOfSchedule($schedule, 'A new schedule was created: ' . $schedule->course_name . ' on ' . $schedule->day_of_week . '.');

            return response()->json($schedule->load(['faculty', 'roomDetails']), 201);
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
        $schedule = Schedule::with(['faculty', 'roomDetails'])->findOrFail($id);
        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $schedule = Schedule::findOrFail($id);

            $requestUser = $request->user();
            if (!$requestUser->isAdmin()) {
                $ownFaculty = $requestUser->faculty;
                if (!$ownFaculty || $ownFaculty->id != $schedule->faculty_id) {
                    return response()->json([
                        'message' => 'Forbidden. You may only modify your own schedules.',
                    ], 403);
                }
            }

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
                'complete' => 'sometimes|in:Yes,No',
            ]);

            $facultyId = $validated['faculty_id'] ?? $schedule->faculty_id;
            $dayOfWeek = $validated['day_of_week'] ?? $schedule->day_of_week;
            $startTime = isset($validated['start_time']) ? $validated['start_time'] : $schedule->start_time->format('H:i');
            $endTime = isset($validated['end_time']) ? $validated['end_time'] : $schedule->end_time->format('H:i');

            $roomId = $schedule->room_id;
            if (isset($validated['room'])) {
                $roomId = Room::whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($validated['room']))])->value('id');
                $validated['room_id'] = $roomId;
            }

            if (isset($validated['day_of_week']) || isset($validated['start_time']) || isset($validated['end_time']) || isset($validated['room']) || isset($validated['faculty_id'])) {
                $conflicts = $this->findConflicts($dayOfWeek, $startTime, $endTime, $facultyId, $roomId, $schedule->id);

                if ($conflicts->isNotEmpty()) {
                    return $this->conflictResponse($conflicts, $facultyId, $roomId);
                }
            }

            $schedule->update($validated);

            $this->notifyFacultyOfSchedule($schedule, 'Your schedule for ' . $schedule->course_name . ' on ' . $schedule->day_of_week . ' was updated.');

            return response()->json($schedule->load(['faculty', 'roomDetails']));
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $schedule = Schedule::findOrFail($id);

        $requestUser = $request->user();
        if (!$requestUser->isAdmin()) {
            $ownFaculty = $requestUser->faculty;
            if (!$ownFaculty || $ownFaculty->id != $schedule->faculty_id) {
                return response()->json([
                    'message' => 'Forbidden. You may only delete your own schedules.',
                ], 403);
            }
        }

        $schedule->delete();
        return response()->json(['message' => 'Schedule deleted successfully']);
    }

    /**
     * Create an in-app notification for the faculty user tied to a schedule.
     */
    private function notifyFacultyOfSchedule(Schedule $schedule, string $message, string $type = ScheduleNotification::TYPE_GENERAL): void
    {
        $userId = $schedule->faculty?->user_id;

        if (!$userId) {
            return;
        }

        ScheduleNotification::create([
            'user_id' => $userId,
            'schedule_id' => $schedule->id,
            'type' => $type,
            'message' => $message,
            'status' => ScheduleNotification::STATUS_UNREAD,
        ]);
    }
}
