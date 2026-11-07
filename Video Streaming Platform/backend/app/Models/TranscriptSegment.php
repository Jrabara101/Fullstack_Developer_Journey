<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TranscriptSegment extends Model
{
    use HasUuids;

    protected $table = 'transcript_segments';

    protected $fillable = [
        'video_id',
        'language_code',
        'start_ms',
        'end_ms',
        'speaker_label',
        'text_content',
        'words_payload'
    ];

    protected $casts = [
        'start_ms' => 'integer',
        'end_ms' => 'integer',
        'words_payload' => 'array',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }
}
