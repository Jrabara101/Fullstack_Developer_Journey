<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\UploadSession;
use App\Models\Video;
use App\Services\S3MultipartService;
use App\Jobs\Transcoding\ProbeVideoMetadataJob;
use App\Jobs\Transcoding\GenerateStoryboardAndMotionPreviewJob;
use App\Jobs\Transcoding\TranscodeFastStartProxyJob;
use App\Jobs\Transcoding\TranscodeFullAbrLadderJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Bus;
use Exception;

class ChunkedUploadController extends Controller
{
    public function __construct(
        protected S3MultipartService $uploadService
    ) {}

    /**
     * Initiate a new 20GB+ Resumable Upload Session
     * POST /api/v1/uploads/initiate
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'filename' => 'required|string|max:255',
            'mime_type' => 'required|string',
            'total_size_bytes' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $creatorId = $request->user()?->id ?? 'usr-creator-' . substr(md5(microtime()), 0, 8);

        // Create upload session
        $session = $this->uploadService->initiateSession(
            $creatorId,
            $validated['filename'],
            $validated['mime_type'],
            (int) $validated['total_size_bytes']
        );

        // Pre-create Video entity in 'uploading' status
        $video = Video::create([
            'creator_id' => $creatorId,
            'channel_id' => $creatorId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'status' => 'uploading',
            'visibility' => 'draft',
        ]);

        $session->update(['video_id' => $video->id]);

        return response()->json([
            'session_id' => $session->id,
            'video_ulid' => $video->ulid,
            'chunk_size_bytes' => $session->chunk_size_bytes,
            'total_expected_chunks' => $session->getTotalExpectedChunks(),
            'uploaded_chunks' => $session->uploaded_chunks_bitmap ?? [],
            'expires_at' => $session->expires_at->toIso8601String()
        ], 201);
    }

    /**
     * Upload an individual 5MB chunk with SHA-256 verification
     * POST /api/v1/uploads/{session}/chunk
     */
    public function uploadChunk(Request $request, UploadSession $session): JsonResponse
    {
        $request->validate([
            'chunk_index' => 'required|integer|min:0',
            'chunk' => 'required|file',
            'sha256' => 'nullable|string|size:64'
        ]);

        $chunkIndex = (int) $request->input('chunk_index');
        $chunkFile = $request->file('chunk');
        $sha256 = $request->input('sha256');

        try {
            $result = $this->uploadService->uploadChunk($session, $chunkIndex, $chunkFile, $sha256);

            return response()->json([
                'success' => true,
                'chunk_index' => $result['chunk_index'],
                'uploaded_chunks_count' => $result['uploaded_chunks'],
                'total_chunks' => $result['total_chunks'],
                'progress_percent' => $result['progress_percent'],
                'is_complete' => $result['is_complete']
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Complete upload, assemble file, and dispatch FFmpeg pipeline
     * POST /api/v1/uploads/{session}/complete
     */
    public function complete(Request $request, UploadSession $session): JsonResponse
    {
        if (!$session->isComplete()) {
            return response()->json([
                'error' => 'Upload session is incomplete. Missing chunks in bitmap.'
            ], 400);
        }

        // Assemble chunks into final file
        $assembledPath = $this->uploadService->assembleFinalFile($session);

        $video = $session->video;
        $video->update(['status' => 'queued']);

        $outputDir = storage_path("app/public/streams/{$video->ulid}");

        // Dispatch Chained Laravel Bus Batch onto dedicated Redis Horizon queue
        Bus::chain([
            new ProbeVideoMetadataJob($video, $assembledPath),
            new GenerateStoryboardAndMotionPreviewJob($video, $assembledPath, $outputDir),
            new TranscodeFastStartProxyJob($video, $assembledPath, $outputDir),
            new TranscodeFullAbrLadderJob($video, $assembledPath, $outputDir),
        ])->onQueue('media-transcode')->dispatch();

        return response()->json([
            'success' => true,
            'message' => 'Upload verified. FFmpeg transcoding pipeline dispatched.',
            'video' => [
                'id' => $video->id,
                'ulid' => $video->ulid,
                'status' => 'queued',
                'fast_start_expected_seconds' => 15
            ]
        ]);
    }
}
