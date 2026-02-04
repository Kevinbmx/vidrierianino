<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'location',
        'project_type',
        'is_local',
        'status',
    ];

    protected $casts = [
        'is_local' => 'boolean',
    ];

    // Status Constants
    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_VIDEO_CALL_SCHEDULED = 'video_call_scheduled';
    const STATUS_VISIT_SCHEDULED = 'visit_scheduled';
    const STATUS_QUOTED = 'quoted';
    const STATUS_CLOSED = 'closed';
}
