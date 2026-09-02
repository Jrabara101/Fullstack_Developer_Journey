<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'name',
        'building',
        'floor',
        'capacity',
        'status',
        'equipment',
    ];

    protected $casts = [
        'equipment' => 'array',
        'floor' => 'integer',
        'capacity' => 'integer',
    ];

    // Status constants
    const STATUS_AVAILABLE = 'available';
    const STATUS_OCCUPIED = 'occupied';
    const STATUS_MAINTENANCE = 'maintenance';

    /**
     * Get the schedules assigned to this room.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'room_id');
    }
}
