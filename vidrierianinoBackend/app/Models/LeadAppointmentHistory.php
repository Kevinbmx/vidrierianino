<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadAppointmentHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'user_id',
        'type', // 'scheduled', 'cancelled'
        'appointment_at',
        'appointment_type',
        'reason',
    ];

    protected $casts = [
        'appointment_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
