<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * SupplierController
 * 
 * API RESTful para gestión de proveedores.
 * Delega lógica de negocio al SupplierService.
 */
class SupplierController extends Controller
{
    public function __construct(
        private SupplierService $supplierService
    ) {
    }

    /**
     * Display a listing of suppliers.
     * 
     * GET /api/suppliers
     *
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Opción para filtrar solo activos
        $suppliers = $request->query('active_only') === 'true'
            ? $this->supplierService->getAllActive()
            : $this->supplierService->getAll();

        return SupplierResource::collection($suppliers);
    }

    /**
     * Store a newly created supplier.
     * 
     * POST /api/suppliers
     *
     * @param Request $request
     * @return SupplierResource
     */
    public function store(Request $request): SupplierResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier = $this->supplierService->create($validated);

        return new SupplierResource($supplier);
    }

    /**
     * Display the specified supplier.
     * 
     * GET /api/suppliers/{supplier}
     *
     * @param Supplier $supplier
     * @return SupplierResource
     */
    public function show(Supplier $supplier): SupplierResource
    {
        // Cargar conteo de ofertas
        $supplier->loadCount('productOffers');

        return new SupplierResource($supplier);
    }

    /**
     * Update the specified supplier.
     * 
     * PUT/PATCH /api/suppliers/{supplier}
     *
     * @param Request $request
     * @param Supplier $supplier
     * @return SupplierResource
     */
    public function update(Request $request, Supplier $supplier): SupplierResource
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier = $this->supplierService->update($supplier, $validated);

        return new SupplierResource($supplier);
    }

    /**
     * Remove the specified supplier.
     * 
     * DELETE /api/suppliers/{supplier}
     *
     * @param Supplier $supplier
     * @return JsonResponse
     */
    public function destroy(Supplier $supplier): JsonResponse
    {
        $this->supplierService->delete($supplier);

        return response()->json([
            'message' => 'Proveedor eliminado exitosamente'
        ]);
    }

    /**
     * Deactivate the specified supplier.
     * 
     * POST /api/suppliers/{supplier}/deactivate
     *
     * @param Supplier $supplier
     * @return SupplierResource
     */
    public function deactivate(Supplier $supplier): SupplierResource
    {
        $supplier = $this->supplierService->deactivate($supplier);

        return new SupplierResource($supplier);
    }

    /**
     * Activate the specified supplier.
     * 
     * POST /api/suppliers/{supplier}/activate
     *
     * @param Supplier $supplier
     * @return SupplierResource
     */
    public function activate(Supplier $supplier): SupplierResource
    {
        $supplier = $this->supplierService->activate($supplier);

        return new SupplierResource($supplier);
    }
}
