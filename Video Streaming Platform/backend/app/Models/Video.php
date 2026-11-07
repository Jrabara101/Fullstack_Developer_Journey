<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Video extends Model
{
    use HasUuids;

    protected $table = 'videos';

    protected $fillable = [
        'ulid',
        'creator_id',
        'channel_id',
        'title',
        'slug',
        'description',
        'visibility',
        'status',
        'duration_seconds',
        'aspect_ratio',
        'master_playlist_path',
        'storyboard_vtt_path',
        'poster_url',
        'motion_preview_url',
        'audio_only_m4a_path',
        'max_resolution',
        'views_count',
        'published_at'
    ];

    protected $casts = [
        'duration_seconds' => 'decimal:3',
        'views_count' => 'integer',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ulid)) {
                $model->ulid = (string) Str::ulid();
            }
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title) . '-' . substr($model->ulid, -6);
            }
        });
    }

    public function renditions(): HasMany
    {
        return $this->hasMany(VideoRendition::class, 'video_id');
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(VideoChapter::class, 'video_id')->orderBy('start_ms');
    }

    public function transcriptSegments(): HasMany
    {
        return $this->hasMany(TranscriptSegment::class, 'video_id')->orderBy('start_ms');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TimedComment::class, 'video_id')->orderBy('timestamp_ms');
    }

    public function heatmapBuckets(): HasMany
    {
        return $this->hasMany(VideoHeatmapBucket::class, 'video_id')->orderBy('bucket_index');
    }

    public function isPlayable(): bool
    {
        return in_array($this->status, [
            'transcoding_fast_proxy',
            'playable_hd_pending',
            'ready_all_renditions'
        ]);
    }
}
