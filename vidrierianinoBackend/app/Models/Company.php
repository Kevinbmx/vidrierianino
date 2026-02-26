<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'legal_name',
        'trade_name',
        'nit_number',
        'owner_name',
        'address',
        'phone',
        'whatsapp',
        'email',
        'logo_url',
        'default_currency',
        'po_terms_conditions',
        'quote_terms_conditions',
    ];

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }
}
