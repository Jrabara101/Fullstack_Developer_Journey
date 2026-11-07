<?php

namespace App\Jobs\Transcoding;

use App\Models\Video;
use App\Services\FFmpegService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateStoryboardAndMotionPreviewJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $queue = 'media-transcode';

    public function __construct(
        public Video $video,
        public string $sourceFilePath,
        public string $outputDir
    ) {}

    public function handle(FFmpegService $ffmpeg): void
    {
        $assets = $ffmpeg->generateStoryboardAndMotionPreview($this->video, $this->sourceFilePath, $this->outputDir);

        $this->video->update([
            'storyboard_vtt_path' => $assets['vtt_path'],
            'motion_preview_url' => $assets['motion_preview_path']
        ]);
    }
}
