<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleNotification extends Model
{
    protected $table = 'schedule_notifications';

    protected $fillable = [
        'user_id',
        'schedule_id',
        'type',
        'message',
        'status',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';

    const TYPE_REMINDER = 'reminder';
    const TYPE_CONFLICT = 'conflict';
    const TYPE_ABSENCE = 'absence';
    const TYPE_GENERAL = 'general';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}
