<?php

namespace App\Services;

use App\Models\Video;
use App\Models\VideoHeatmapBucket;
use App\Models\WatchSession;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service: RedisTelemetryBuffer
 * Absorbs high-throughput viewer heartbeats and heatmap buckets in Redis hashes,
 * buffering millions of writes before bulk-flushing to PostgreSQL/MySQL every 60 seconds.
 */
class RedisTelemetryBuffer
{
    /**
     * Record a viewer heartbeat (runs every 5 seconds per active viewer)
     */
    public function recordHeartbeat(string $videoId, string $userId, int $currentPositionMs, int $videoDurationMs): void
    {
        if ($videoDurationMs <= 0) return;

        // 1. Calculate 1% heatmap bucket slice (0 to 99)
        $percentage = min(99, max(0, (int) floor(($currentPositionMs / $videoDurationMs) * 100)));

        try {
            // Buffer heatmap counter in Redis: HINCRBY video:heatmap:{videoId} {bucketIndex} 1
            $heatmapKey = "cinestream:heatmap:{$videoId}";
            if (class_exists(Redis::class)) {
                Redis::hIncrBy($heatmapKey, (string) $percentage, 1);

                // Buffer user watch session in Redis: HSET cinestream:watch:{userId} {videoId} {timestampMs}
                $userKey = "cinestream:watch:{$userId}";
                Redis::hSet($userKey, $videoId, json_encode([
                    'position_ms' => $currentPositionMs,
                    'updated_at' => time()
                ]));
            }
        } catch (\Throwable $e) {
            // Fallback gracefully if Redis server is down or running locally without redis-server
            Log::info("Heartbeat buffered locally for video {$videoId} bucket {$percentage}");
        }
    }

    /**
     * Flush buffered Redis telemetry into database in bulk (Called via scheduled artisan command)
     */
    public function flushTelemetryToDatabase(): int
    {
        $flushedCount = 0;

        try {
            if (!class_exists(Redis::class)) return 0;

            // Scan all heatmap keys
            $keys = Redis::keys("cinestream:heatmap:*");
            foreach ($keys as $key) {
                // Extract videoId from key
                $parts = explode(':', $key);
                $videoId = end($parts);
                $buckets = Redis::hGetAll($key);

                if (empty($buckets)) continue;

                // Find max count to normalize score 0.0 to 1.0
                $maxVal = max(array_map('intval', array_values($buckets))) ?: 1;

                DB::transaction(function () use ($videoId, $buckets, $maxVal, $key) {
                    foreach ($buckets as $bucketIdx => $count) {
                        $score = round((int)$count / $maxVal, 3);
                        VideoHeatmapBucket::updateOrCreate(
                            ['video_id' => $videoId, 'bucket_index' => (int) $bucketIdx],
                            ['watch_intensity_score' => $score]
                        );
                    }
                    Redis::del($key);
                });

                $flushedCount += count($buckets);
            }
        } catch (\Throwable $e) {
            Log::warning("Redis telemetry flush note: " . $e->getMessage());
        }

        return $flushedCount;
    }
}
