<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * CategoryController
 * 
 * API RESTful para gestión de categorías jerárquicas.
 * Delega lógica de negocio al CategoryService.
 */
class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {
    }

    /**
     * Display a listing of the resource.
     * 
     * GET /api/categories
     *
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::with(['parent', 'children'])
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Get root categories only.
     * 
     * GET /api/categories/roots
     *
     * @return AnonymousResourceCollection
     */
    public function roots(): AnonymousResourceCollection
    {
        $rootCategories = $this->categoryService->getRootCategories();

        return CategoryResource::collection($rootCategories);
    }

    /**
     * Store a newly created resource in storage.
     * 
     * POST /api/categories
     *
     * @param StoreCategoryRequest $request
     * @return CategoryResource
     */
    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $category = $this->categoryService->create($request->validated());

        return new CategoryResource($category);
    }

    /**
     * Display the specified resource.
     * 
     * GET /api/categories/{category}
     *
     * @param Category $category
     * @return CategoryResource
     */
    public function show(Category $category): CategoryResource
    {
        $category->load(['parent', 'children', 'products']);

        return new CategoryResource($category);
    }

    /**
     * Update the specified resource in storage.
     * 
     * PUT/PATCH /api/categories/{category}
     *
     * @param UpdateCategoryRequest $request
     * @param Category $category
     * @return CategoryResource
     */
    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $category = $this->categoryService->update($category, $request->validated());

        return new CategoryResource($category);
    }

    /**
     * Remove the specified resource from storage.
     * 
     * DELETE /api/categories/{category}
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return response()->json([
            'message' => 'Categoría eliminada exitosamente'
        ]);
    }
}
