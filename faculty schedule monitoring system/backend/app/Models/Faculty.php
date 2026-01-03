<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    protected $fillable = [
        'name',
        'email',
        'department',
        'phone',
        'office_location',
    ];

    /**
     * Get the schedules for the faculty.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
