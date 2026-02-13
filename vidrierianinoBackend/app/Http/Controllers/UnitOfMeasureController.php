<?php

namespace App\Http\Controllers;

use App\Http\Resources\UnitOfMeasureResource;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * UnitOfMeasureController
 * 
 * API para consultar unidades de medida disponibles.
 * Solo lectura, las UOM son predefinidas en seeders.
 */
class UnitOfMeasureController extends Controller
{
    /**
     * Display a listing of all units of measure.
     * 
     * GET /api/units-of-measure
     *
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $units = UnitOfMeasure::orderBy('type')->orderBy('name')->get();

        return UnitOfMeasureResource::collection($units);
    }

    /**
     * Get units by type.
     * 
     * GET /api/units-of-measure/by-type/{type}
     *
     * @param string $type (area|length|unit|weight)
     * @return AnonymousResourceCollection
     */
    public function byType(string $type): AnonymousResourceCollection
    {
        $units = UnitOfMeasure::where('type', $type)
            ->orderBy('name')
            ->get();

        return UnitOfMeasureResource::collection($units);
    }
}
