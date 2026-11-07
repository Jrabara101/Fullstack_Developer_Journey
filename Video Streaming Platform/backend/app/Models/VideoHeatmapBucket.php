<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoHeatmapBucket extends Model
{
    public $timestamps = false;
    protected $table = 'video_heatmap_buckets';
    protected $primaryKey = ['video_id', 'bucket_index'];
    public $incrementing = false;

    protected $fillable = [
        'video_id',
        'bucket_index',
        'watch_intensity_score'
    ];

    protected $casts = [
        'bucket_index' => 'integer',
        'watch_intensity_score' => 'float',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }
}
