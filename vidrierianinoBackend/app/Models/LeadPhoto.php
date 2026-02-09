<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'firebase_url',
        'firebase_path',
        'stage',
        'comment',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
