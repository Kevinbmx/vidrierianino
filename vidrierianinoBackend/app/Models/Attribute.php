<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Attribute Model
 * 
 * Representa un atributo dinámico del sistema EAV.
 * Ejemplos: "Color", "Grosor", "Material", "Acabado"
 */
class Attribute extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'input_type'
    ];

    /**
     * Valores posibles de este atributo.
     * 
     * @return HasMany
     */
    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class);
    }
}
