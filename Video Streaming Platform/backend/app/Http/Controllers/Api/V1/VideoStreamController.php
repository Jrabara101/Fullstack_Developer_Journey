<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Video;
use App\Services\SignedManifestService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class VideoStreamController extends Controller
{
    public function __construct(
        protected SignedManifestService $manifestService
    ) {}

    /**
     * Get full video metadata deck with chapters, transcript, comments, heatmap
     * GET /api/v1/videos/{ulid}
     */
    public function show(string $ulid): JsonResponse
    {
        $video = Video::with([
            'renditions' => fn($q) => $q->where('status', 'ready'),
            'chapters' => fn($q) => $q->orderBy('start_ms'),
            'comments' => fn($q) => $q->with('replies')->orderByDesc('is_creator_pinned')->orderBy('timestamp_ms'),
            'heatmapBuckets' => fn($q) => $q->orderBy('bucket_index')
        ])->where('ulid', $ulid)->firstOrFail();

        // Increment view count
        $video->increment('views_count');

        // Generate signed stream token
        $signedData = $this->manifestService->generateSignedStreamToken($video->ulid);

        return response()->json([
            'video' => $video,
            'streaming' => [
                'signed_master_url' => url("/api/v1/videos/{$video->ulid}/stream.m3u8?{$signedData['query_string']}"),
                'expires_at' => $signedData['expires'],
                'audio_only_url' => $video->audio_only_m4a_path,
                'vtt_storyboard_url' => $video->storyboard_vtt_path,
                'is_fast_start' => $video->status === 'playable_hd_pending'
            ]
        ]);
    }

    /**
     * Return Cryptographically Signed HLS Master Manifest
     * GET /api/v1/videos/{ulid}/stream.m3u8
     */
    public function getSignedMasterManifest(Request $request, string $ulid): Response
    {
        $token = $request->query('token');
        $expires = (int) $request->query('expires');

        // Validate cryptographic signature & expiration
        if (!$token || !$expires || !$this->manifestService->validateToken($ulid, $token, $expires)) {
            return response("Unauthorized HLS stream token or token expired.", 403, [
                'Content-Type' => 'text/plain'
            ]);
        }

        $video = Video::with('renditions')->where('ulid', $ulid)->firstOrFail();

        // Read physical or dynamically constructed master.m3u8
        $masterContent = "#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-INDEPENDENT-SEGMENTS\n\n";

        $renditions = $video->renditions()->where('status', 'ready')->orderByDesc('bitrate_kbps')->get();
        if ($renditions->isEmpty()) {
            // Default fast 720p proxy line
            $masterContent .= "#EXT-X-STREAM-INF:BANDWIDTH=3200000,AVERAGE-BANDWIDTH=2800000,RESOLUTION=1280x720,FRAME-RATE=30.000,CODECS=\"avc1.4d401f,mp4a.40.2\"\n720p.m3u8\n";
        } else {
            foreach ($renditions as $ren) {
                $bandwidth = $ren->bitrate_kbps * 1000;
                $masterContent .= sprintf(
                    "#EXT-X-STREAM-INF:BANDWIDTH=%d,AVERAGE-BANDWIDTH=%d,RESOLUTION=%dx%d,CODECS=\"%s,mp4a.40.2\"\n%s.m3u8\n\n",
                    $bandwidth, (int)($bandwidth * 0.9), $ren->width, $ren->height, $ren->codec, $ren->resolution_label
                );
            }
        }

        // Injected signed query tokens into child rendition URLs
        $signedQuery = "token={$token}&expires={$expires}";
        $signedManifest = $this->manifestService->signManifestContent($masterContent, $signedQuery);

        return response($signedManifest, 200, [
            'Content-Type' => 'application/vnd.apple.mpegurl',
            'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
}
