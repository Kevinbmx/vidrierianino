<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'appointment_at',
        'appointment_type',
        'address_details',
        'quote_sent_at',
        'quote_amount',
        'payment_advance',
        'installed_at',
        'warranty_ends_at',
        'warranty_next_check',
        'rejection_reason',
    ];

    protected $casts = [
        'is_local' => 'boolean',
        'appointment_at' => 'datetime',
        'quote_sent_at' => 'datetime',
        'installed_at' => 'datetime',
        'warranty_ends_at' => 'datetime',
        'warranty_next_check' => 'datetime',
        'quote_amount' => 'decimal:4',
        'payment_advance' => 'decimal:4',
    ];

    // Status Constants - 10 Step Workflow
    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_NO_ANSWER = 'no_answer';
    const STATUS_APPOINTMENT_SCHEDULED = 'appointment_scheduled';
    const STATUS_VISIT_DONE = 'visit_done';
    const STATUS_QUOTED = 'quoted';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_INSTALLED = 'installed';
    const STATUS_WARRANTY_ACTIVE = 'warranty_active';

    // Relationships
    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(LeadPhoto::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(LeadStatusHistory::class);
    }

    public function appointmentHistories(): HasMany
    {
        return $this->hasMany(LeadAppointmentHistory::class)->orderBy('created_at', 'desc');
    }

    // Helper Methods
    public function daysInQuotedStatus(): ?int
    {
        if ($this->status === self::STATUS_QUOTED && $this->quote_sent_at) {
            return $this->quote_sent_at->diffInDays(now());
        }
        return null;
    }

    public function warrantyDaysRemaining(): ?int
    {
        if ($this->warranty_ends_at) {
            return now()->diffInDays($this->warranty_ends_at, false);
        }
        return null;
    }
}

