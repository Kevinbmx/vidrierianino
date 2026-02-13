<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Requests\StoreProductVariantRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

/**
 * ProductController
 * 
 * API RESTful para gestión de productos y variantes.
 * Delega lógica de negocio al ProductService.
 */
class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {
    }

    /**
     * Display a listing of products.
     * 
     * GET /api/products
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['category', 'variants.saleUnit'])
            ->where('is_active', true);

        // Filtrar por categoría si se proporciona
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtrar por búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($request->get('per_page', 20));

        return ProductResource::collection($products);
    }

    /**
     * Store a newly created product with variants.
     * 
     * POST /api/products
     *
     * @param StoreProductRequest $request
     * @return ProductResource
     */
    public function store(StoreProductRequest $request): ProductResource
    {
        $product = $this->productService->createWithVariants($request->validated());

        return new ProductResource($product);
    }

    /**
     * Display the specified product.
     * 
     * GET /api/products/{product}
     *
     * @param Product $product
     * @return ProductResource
     */
    public function show(Product $product): ProductResource
    {
        $product->load([
            'category',
            'variants.saleUnit',
            'variants.attributeValues.attribute'
        ]);

        return new ProductResource($product);
    }

    /**
     * Update the specified product.
     * 
     * PUT/PATCH /api/products/{product}
     *
     * @param UpdateProductRequest $request
     * @param Product $product
     * @return ProductResource
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product = $this->productService->update($product, $request->validated());

        return new ProductResource($product);
    }

    /**
     * Remove the specified product.
     * 
     * DELETE /api/products/{product}
     *
     * @param Product $product
     * @return JsonResponse
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Producto eliminado exitosamente'
        ]);
    }

    /**
     * Add a variant to an existing product.
     * 
     * POST /api/products/{product}/variants
     *
     * @param StoreProductVariantRequest $request
     * @param Product $product
     * @return ProductVariantResource
     */
    public function addVariant(StoreProductVariantRequest $request, Product $product): ProductVariantResource
    {
        $variant = $this->productService->createVariant($product, $request->validated());

        return new ProductVariantResource($variant->load(['saleUnit', 'attributeValues.attribute']));
    }

    /**
     * Get all variants of a product.
     * 
     * GET /api/products/{product}/variants
     *
     * @param Product $product
     * @return AnonymousResourceCollection
     */
    public function variants(Product $product): AnonymousResourceCollection
    {
        $variants = $product->variants()
            ->with(['saleUnit', 'attributeValues.attribute', 'supplierOffers']) // Agregamos supplierOffers opcionalmente
            ->get();

        return ProductVariantResource::collection($variants);
    }

    /**
     * Adjust stock of a product variant.
     * 
     * POST /api/products/variants/{variant}/adjust-stock
     *
     * @param Request $request
     * @param ProductVariant $variant
     * @return ProductVariantResource
     */
    public function adjustStock(Request $request, ProductVariant $variant): ProductVariantResource
    {
        $request->validate([
            'quantity' => 'required|integer',
            'reason' => 'nullable|string|max:255',
        ]);

        $variant = $this->productService->adjustStock(
            $variant,
            $request->quantity,
            $request->reason ?? 'Ajuste manual'
        );

        return new ProductVariantResource($variant);
    }
}
