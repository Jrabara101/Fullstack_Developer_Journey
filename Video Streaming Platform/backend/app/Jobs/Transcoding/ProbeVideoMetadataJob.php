<?php

namespace App\Jobs\Transcoding;

use App\Models\Video;
use App\Services\FFmpegService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProbeVideoMetadataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $queue = 'media-transcode';

    public function __construct(
        public Video $video,
        public string $sourceFilePath
    ) {}

    public function handle(FFmpegService $ffmpeg): void
    {
        $metadata = $ffmpeg->probeMetadata($this->sourceFilePath);

        $this->video->update([
            'duration_seconds' => $metadata['duration_seconds'],
            'aspect_ratio' => $metadata['aspect_ratio'],
            'max_resolution' => $metadata['height'] >= 2160 ? '4k' : ($metadata['height'] >= 1080 ? '1080p' : '720p'),
            'status' => 'transcoding_fast_proxy'
        ]);
    }
}
