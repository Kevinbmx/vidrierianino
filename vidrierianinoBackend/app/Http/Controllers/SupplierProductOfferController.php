<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierProductOfferResource;
use App\Models\ProductVariant;
use App\Models\SupplierProductOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * SupplierProductOfferController
 * 
 * API para gestionar ofertas de proveedores vinculadas a variantes.
 * 
 * Patrones de uso:
 * - GET /api/product-variants/{variant}/offers → Listar ofertas de una variante
 * - POST /api/product-variants/{variant}/offers → Crear oferta para una variante
 * - PUT /api/offers/{offer} → Actualizar oferta
 * - DELETE /api/offers/{offer} → Eliminar oferta
 */
class SupplierProductOfferController extends Controller
{
    /**
     * List all offers for a specific variant.
     * 
     * GET /api/product-variants/{variant}/offers
     *
     * @param ProductVariant $variant
     * @return AnonymousResourceCollection
     */
    public function index(ProductVariant $variant): AnonymousResourceCollection
    {
        $offers = $variant->supplierOffers()
            ->with(['supplier', 'purchaseUnit'])
            ->orderBy('is_preferred', 'desc') // Preferidas primero
            ->orderBy('created_at', 'desc')
            ->get();

        return SupplierProductOfferResource::collection($offers);
    }

    /**
     * Store a new offer for a variant.
     * 
     * POST /api/product-variants/{variant}/offers
     *
     * @param Request $request
     * @param ProductVariant $variant
     * @return SupplierProductOfferResource
     */
    public function store(Request $request, ProductVariant $variant): SupplierProductOfferResource
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'cost' => 'required|numeric|min:0',
            'purchase_unit_id' => 'required|exists:units_of_measure,id',
            'purchase_width' => 'nullable|numeric|min:0',
            'purchase_height' => 'nullable|numeric|min:0',
            'purchase_length' => 'nullable|numeric|min:0',
            'is_preferred' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        // Agregar el product_variant_id automáticamente
        $validated['product_variant_id'] = $variant->id;

        $offer = SupplierProductOffer::create($validated);

        // Si se marcó como preferida, actualizar las demás
        if ($offer->is_preferred) {
            $offer->markAsPreferred();
        }

        // Recargar con relaciones
        $offer->load(['supplier', 'purchaseUnit']);

        return new SupplierProductOfferResource($offer);
    }

    /**
     * Display the specified offer.
     * 
     * GET /api/offers/{offer}
     *
     * @param SupplierProductOffer $offer
     * @return SupplierProductOfferResource
     */
    public function show(SupplierProductOffer $offer): SupplierProductOfferResource
    {
        $offer->load(['supplier', 'purchaseUnit', 'productVariant']);

        return new SupplierProductOfferResource($offer);
    }

    /**
     * Update the specified offer.
     * 
     * PUT/PATCH /api/offers/{offer}
     *
     * @param Request $request
     * @param SupplierProductOffer $offer
     * @return SupplierProductOfferResource
     */
    public function update(Request $request, SupplierProductOffer $offer): SupplierProductOfferResource
    {
        $validated = $request->validate([
            'cost' => 'sometimes|required|numeric|min:0',
            'purchase_unit_id' => 'sometimes|required|exists:units_of_measure,id',
            'purchase_width' => 'nullable|numeric|min:0',
            'purchase_height' => 'nullable|numeric|min:0',
            'purchase_length' => 'nullable|numeric|min:0',
            'is_preferred' => 'boolean',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $offer->update($validated);

        // Si se marcó como preferida, actualizar las demás
        if (isset($validated['is_preferred']) && $validated['is_preferred']) {
            $offer->markAsPreferred();
        }

        $offer->load(['supplier', 'purchaseUnit']);

        return new SupplierProductOfferResource($offer);
    }

    /**
     * Remove the specified offer.
     * 
     * DELETE /api/offers/{offer}
     *
     * @param SupplierProductOffer $offer
     * @return JsonResponse
     */
    public function destroy(SupplierProductOffer $offer): JsonResponse
    {
        $offer->delete();

        return response()->json([
            'message' => 'Oferta eliminada exitosamente'
        ]);
    }

    /**
     * Get the best offer for a variant (lowest base_unit_cost).
     * 
     * GET /api/product-variants/{variant}/best-offer
     *
     * @param ProductVariant $variant
     * @return SupplierProductOfferResource|JsonResponse
     */
    public function bestOffer(ProductVariant $variant): SupplierProductOfferResource|JsonResponse
    {
        $bestOffer = $variant->getBestOffer();

        if (!$bestOffer) {
            return response()->json([
                'message' => 'No hay ofertas activas para esta variante'
            ], 404);
        }

        return new SupplierProductOfferResource($bestOffer);
    }

    /**
     * Mark an offer as preferred.
     * 
     * POST /api/offers/{offer}/mark-preferred
     *
     * @param SupplierProductOffer $offer
     * @return SupplierProductOfferResource
     */
    public function markPreferred(SupplierProductOffer $offer): SupplierProductOfferResource
    {
        $offer->markAsPreferred();
        $offer->load(['supplier', 'purchaseUnit']);

        return new SupplierProductOfferResource($offer);
    }
}
