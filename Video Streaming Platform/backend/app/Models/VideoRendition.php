<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoRendition extends Model
{
    use HasUuids;

    protected $table = 'video_renditions';

    protected $fillable = [
        'video_id',
        'resolution_label',
        'width',
        'height',
        'bitrate_kbps',
        'codec',
        'playlist_path',
        'file_size_bytes',
        'status',
        'progress_percent',
        'completed_at'
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'bitrate_kbps' => 'integer',
        'file_size_bytes' => 'integer',
        'progress_percent' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }
}
