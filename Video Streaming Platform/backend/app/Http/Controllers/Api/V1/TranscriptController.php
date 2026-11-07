<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Video;
use App\Models\TranscriptSegment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class TranscriptController extends Controller
{
    /**
     * Get synchronized transcript segments with word-level timestamps
     * GET /api/v1/videos/{ulid}/transcript
     */
    public function index(Request $request, string $ulid): JsonResponse
    {
        $video = Video::where('ulid', $ulid)->firstOrFail();
        $lang = $request->query('lang', 'en');

        $segments = $video->transcriptSegments()
            ->where('language_code', $lang)
            ->orderBy('start_ms')
            ->get();

        return response()->json([
            'video_ulid' => $ulid,
            'language_code' => $lang,
            'total_segments' => $segments->count(),
            'segments' => $segments
        ]);
    }

    /**
     * "Search Inside Video" - Full-text spoken dialogue search
     * GET /api/v1/videos/{ulid}/transcript/search?q={keyword}
     */
    public function search(Request $request, string $ulid): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2']);
        $query = $request->query('q');

        $video = Video::where('ulid', $ulid)->firstOrFail();

        // Search text content
        $matches = $video->transcriptSegments()
            ->where('text_content', 'LIKE', "%{$query}%")
            ->orderBy('start_ms')
            ->get();

        $timelinePinTimestamps = $matches->pluck('start_ms');

        return response()->json([
            'query' => $query,
            'matches_count' => $matches->count(),
            'timeline_markers_ms' => $timelinePinTimestamps,
            'results' => $matches
        ]);
    }
}
