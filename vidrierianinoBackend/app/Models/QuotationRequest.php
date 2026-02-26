<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'parent_id',
        'deadline',
        'status',
        'comments',
        'created_by'
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    // Relaciones Jerárquicas
    public function parent(): BelongsTo
    {
        return $this->belongsTo(QuotationRequest::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(QuotationRequest::class, 'parent_id');
    }

    // Relaciones
    public function items(): HasMany
    {
        return $this->hasMany(QuotationRequestItem::class);
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, 'quotation_request_suppliers')
            ->withPivot(['id', 'status', 'submission_channel', 'sent_at', 'viewed_at', 'replied_at', 'response_document_url'])
            ->withTimestamps();
    }

    // Para acceder al pivot directamente como modelo si es necesario
    public function supplierInvites(): HasMany
    {
        return $this->hasMany(QuotationRequestSupplier::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(QuotationResponse::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
