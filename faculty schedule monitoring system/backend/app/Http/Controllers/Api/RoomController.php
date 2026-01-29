<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Room::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('building')) {
            $query->where('building', $request->building);
        }
        
        $rooms = $query->orderBy('building')->orderBy('floor')->orderBy('name')->get();
        return response()->json($rooms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'building' => 'required|string|max:255',
                'floor' => 'required|integer|min:0',
                'capacity' => 'required|integer|min:1',
                'status' => 'required|string|in:available,occupied,maintenance',
                'equipment' => 'nullable|array',
                'equipment.*' => 'string|max:255',
            ]);

            $room = Room::create($validated);

            return response()->json([
                'message' => 'Room created successfully',
                'room' => $room,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $room = Room::find($id);
        
        if (!$room) {
            return response()->json([
                'message' => 'Room not found',
            ], 404);
        }

        return response()->json($room);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $room = Room::find($id);
            
            if (!$room) {
                return response()->json([
                    'message' => 'Room not found',
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'building' => 'sometimes|string|max:255',
                'floor' => 'sometimes|integer|min:0',
                'capacity' => 'sometimes|integer|min:1',
                'status' => 'sometimes|string|in:available,occupied,maintenance',
                'equipment' => 'nullable|array',
                'equipment.*' => 'string|max:255',
            ]);

            $room->update($validated);

            return response()->json([
                'message' => 'Room updated successfully',
                'room' => $room->fresh(),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $room = Room::find($id);
        
        if (!$room) {
            return response()->json([
                'message' => 'Room not found',
            ], 404);
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully',
        ]);
    }
}
