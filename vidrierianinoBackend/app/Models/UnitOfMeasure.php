<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * UnitOfMeasure Model
 * 
 * Define las unidades de medida base del sistema.
 * Tipos: area (m²), length (ml), unit (un), weight (kg)
 * 
 * Impacto en el negocio: Estandariza las conversiones entre unidades
 * de compra y venta, permitiendo comparaciones precisas.
 */
class UnitOfMeasure extends Model
{
    protected $table = 'units_of_measure';

    protected $fillable = [
        'name',
        'abbreviation',
        'type'
    ];

    protected $casts = [
        'type' => 'string',
    ];

    /**
     * Verifica si esta unidad es de tipo área.
     * 
     * @return bool
     */
    public function isArea(): bool
    {
        return $this->type === 'area';
    }

    /**
     * Verifica si esta unidad es de tipo longitud.
     * 
     * @return bool
     */
    public function isLength(): bool
    {
        return $this->type === 'length';
    }

    /**
     * Verifica si esta unidad es de tipo unitaria.
     * 
     * @return bool
     */
    public function isUnit(): bool
    {
        return $this->type === 'unit';
    }

    /**
     * Verifica si esta unidad es de tipo peso.
     * 
     * @return bool
     */
    public function isWeight(): bool
    {
        return $this->type === 'weight';
    }
}
