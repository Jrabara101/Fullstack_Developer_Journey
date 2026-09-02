<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduleNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ScheduleNotificationController extends Controller
{
    /**
     * Display a listing of the authenticated user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ScheduleNotification::where('user_id', $request->user()->id)
            ->with('schedule')
            ->orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    /**
     * Mark a notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = ScheduleNotification::where('user_id', $request->user()->id)->findOrFail($id);

        $notification->update([
            'status' => ScheduleNotification::STATUS_READ,
            'read_at' => now(),
        ]);

        return response()->json($notification);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = ScheduleNotification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }
}
