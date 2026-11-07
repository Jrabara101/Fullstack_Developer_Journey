<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WatchSession extends Model
{
    public $timestamps = false;
    protected $table = 'watch_sessions';
    protected $primaryKey = ['user_id', 'video_id'];
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'video_id',
        'last_position_ms',
        'max_position_ms',
        'completed',
        'updated_at'
    ];

    protected $casts = [
        'last_position_ms' => 'integer',
        'max_position_ms' => 'integer',
        'completed' => 'boolean',
        'updated_at' => 'datetime',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class, 'video_id');
    }
}
