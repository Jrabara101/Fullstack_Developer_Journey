<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimedComment extends Model
{
    use HasUuids;

    protected $table = 'timed_comments';

    protected $fillable = [
        'video_id',
        'user_id',
        'parent_id',
        'timestamp_ms',
        'body',
        'upvotes_count',
        'is_creator_pinned'
    ];

    protected $casts = [
        'timestamp_ms' => 'integer',
        'upvotes_count' => 'integer',
        'is_creator_pinned' => 'boolean',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TimedComment::class, 'parent_id')->orderBy('created_at');
    }
}
