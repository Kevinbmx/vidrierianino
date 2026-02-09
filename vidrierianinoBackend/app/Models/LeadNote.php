<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadNote extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'content'];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
