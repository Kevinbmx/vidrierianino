<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationResponse extends Model
{
    protected $fillable = [
        'quotation_request_id',
        'quotation_request_item_id',
        'supplier_id',
        'unit_price',
        'quoted_unit_id',
        'pack_quantity',
        'offered_price',
        'dimensions_description',
        'currency',
        'is_awarded',
        'notes'
    ];

    protected $casts = [
        'unit_price' => 'decimal:4',
        'pack_quantity' => 'decimal:2',
        'offered_price' => 'decimal:2',
        'is_awarded' => 'boolean',
    ];

    public function quotedUnit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'quoted_unit_id');
    }

    public function quotationRequest(): BelongsTo
    {
        return $this->belongsTo(QuotationRequest::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(QuotationRequestItem::class, 'quotation_request_item_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
