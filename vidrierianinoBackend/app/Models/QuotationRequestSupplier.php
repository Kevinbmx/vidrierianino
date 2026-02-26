<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class QuotationRequestSupplier extends Pivot
{
    protected $table = 'quotation_request_suppliers';

    // Importante: No extender de Pivot si quieres usarla como modelo normal con id
    // Pero como tiene un ID, es mejor usarla como Modelo normal en vez de Pivot puro
    // Sin embargo, para Eloquent, si es un pivot real, es mejor usar Pivot class

    // Al extender de Pivot, Laravel asume que es una relación many-to-many.
    // Como tiene ID, le diremos que sí incrementa.
    public $incrementing = true;

    protected $fillable = [
        'quotation_request_id',
        'supplier_id',
        'status',
        'submission_channel',
        'sent_at',
        'viewed_at',
        'replied_at',
        'response_document_url'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'viewed_at' => 'datetime',
        'replied_at' => 'datetime',
    ];
}
