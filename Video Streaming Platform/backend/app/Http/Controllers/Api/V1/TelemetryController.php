<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Video;
use App\Models\WatchSession;
use App\Services\RedisTelemetryBuffer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class TelemetryController extends Controller
{
    public function __construct(
        protected RedisTelemetryBuffer $telemetryBuffer
    ) {}

    /**
     * High-throughput viewer heartbeat buffered in Redis
     * POST /api/v1/videos/{ulid}/heartbeat
     */
    public function heartbeat(Request $request, string $ulid): JsonResponse
    {
        $validated = $request->validate([
            'position_ms' => 'required|integer|min:0',
            'duration_ms' => 'required|integer|min:1',
            'completed' => 'nullable|boolean'
        ]);

        $video = Video::where('ulid', $ulid)->firstOrFail();
        $userId = $request->user()?->id ?? ($request->header('X-Viewer-ID') ?: 'anon-' . substr(md5($request->ip()), 0, 12));

        // Buffer in Redis (HINCRBY on heatmap slice + HSET on watch progress)
        $this->telemetryBuffer->recordHeartbeat(
            $video->id,
            $userId,
            (int) $validated['position_ms'],
            (int) $validated['duration_ms']
        );

        return response()->json([
            'status' => 'buffered',
            'synced_at' => now()->toIso8601String()
        ]);
    }

    /**
     * Check watch session & determine if 3-second Smart Context Rewind applies
     * GET /api/v1/videos/{ulid}/resume
     */
    public function getResumePosition(Request $request, string $ulid): JsonResponse
    {
        $video = Video::where('ulid', $ulid)->firstOrFail();
        $userId = $request->user()?->id ?? ($request->header('X-Viewer-ID') ?: 'anon-' . substr(md5($request->ip()), 0, 12));

        $session = WatchSession::where('user_id', $userId)->where('video_id', $video->id)->first();

        if (!$session || $session->last_position_ms <= 0) {
            return response()->json([
                'has_previous_session' => false,
                'resume_position_ms' => 0,
                'applied_smart_rewind' => false
            ]);
        }

        $hoursSinceLastWatch = now()->diffInHours($session->updated_at);
        $resumeMs = $session->last_position_ms;
        $appliedRewind = false;

        // If paused more than 12 hours ago, apply 3-Second Smart Context Rewind (3000ms)
        if ($hoursSinceLastWatch >= 12 && $resumeMs > 5000) {
            $resumeMs = max(0, $resumeMs - 3000);
            $appliedRewind = true;
        }

        return response()->json([
            'has_previous_session' => true,
            'raw_last_position_ms' => $session->last_position_ms,
            'resume_position_ms' => $resumeMs,
            'hours_since_last_watch' => $hoursSinceLastWatch,
            'applied_smart_rewind' => $appliedRewind,
            'message' => $appliedRewind ? 'Resumed with 3-Second Smart Context Rewind' : 'Resumed from last position'
        ]);
    }
}
