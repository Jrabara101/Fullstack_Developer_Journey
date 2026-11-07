<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoChapter extends Model
{
    use HasUuids;

    protected $table = 'video_chapters';

    protected $fillable = [
        'video_id',
        'title',
        'start_ms',
        'end_ms',
        'thumbnail_xywh'
    ];

    protected $casts = [
        'start_ms' => 'integer',
        'end_ms' => 'integer',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }
}
