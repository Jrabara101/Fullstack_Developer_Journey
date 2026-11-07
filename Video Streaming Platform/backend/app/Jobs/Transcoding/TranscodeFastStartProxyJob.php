<?php

namespace App\Jobs\Transcoding;

use App\Models\Video;
use App\Services\FFmpegService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Event;

class TranscodeFastStartProxyJob implements ShouldQueue
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
        // 1. Encode 720p Fast proxy rendition
        $rendition = $ffmpeg->transcodeRendition($this->video, $this->sourceFilePath, '720p', $this->outputDir);

        // 2. Generate initial master.m3u8 containing 720p
        $masterPath = $ffmpeg->transcodeFastStartProxy($this->video, $this->sourceFilePath, $this->outputDir);

        // 3. Mark video as playable immediately!
        $this->video->update([
            'status' => 'playable_hd_pending',
            'master_playlist_path' => $masterPath
        ]);

        // Broadcast VideoPlayableEvent via Laravel Echo / WebSockets
        // event(new VideoPlayableEvent($this->video));
    }
}
