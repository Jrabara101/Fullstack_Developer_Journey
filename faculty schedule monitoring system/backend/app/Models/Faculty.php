<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'department',
        'phone',
        'office_location',
    ];

    /**
     * Get the user that owns the faculty record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the schedules for the faculty.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
