<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    protected $fillable = [
        'faculty_id',
        'course_name',
        'course_code',
        'day_of_week',
        'start_time',
        'end_time',
        'room',
        'room_id',
        'semester',
        'notes',
        'complete',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    /**
     * Get the faculty that owns the schedule.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    /**
     * Get the room assigned to the schedule (relation).
     * Named `roomDetails` to avoid clashing with the legacy `room` text column.
     */
    public function roomDetails(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    /**
     * Get the attendance records for the schedule.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the notifications related to the schedule.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(ScheduleNotification::class);
    }
}
