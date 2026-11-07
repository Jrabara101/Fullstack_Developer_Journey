<?php

namespace App\Jobs\Transcoding;

use App\Models\Video;
use App\Services\FFmpegService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TranscodeFullAbrLadderJob implements ShouldQueue
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
        // Renditions to encode based on max source resolution
        $targets = ['360p', '480p', '1080p'];
        if ($this->video->max_resolution === '4k') {
            $targets[] = '4k';
        }

        foreach ($targets as $res) {
            $ffmpeg->transcodeRendition($this->video, $this->sourceFilePath, $res, $this->outputDir);
            
            // Dynamically hot-swap/rewrite master.m3u8 as each rendition finishes!
            $ffmpeg->updateMasterManifest($this->video, $this->outputDir);
        }

        // When all renditions are complete, update status to ready_all_renditions
        $this->video->update([
            'status' => 'ready_all_renditions'
        ]);
    }
}
