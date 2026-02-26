<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TemplateController extends Controller
{
    /**
     * Get all packaging types (templates).
     */
    public function getPackagingTypes(): JsonResponse
    {
        $types = DB::table('packaging_types')
            ->select('id', 'name', 'default_quantity', 'description')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $types]);
    }

    /**
     * Get dimension templates, optionally filtered by type.
     */
    public function getDimensionTemplates(Request $request): JsonResponse
    {
        $query = DB::table('dimension_templates')
            ->select('id', 'name', 'width', 'height', 'length', 'type', 'description')
            ->orderBy('name');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $templates = $query->get();

        return response()->json(['data' => $templates]);
    }
}
