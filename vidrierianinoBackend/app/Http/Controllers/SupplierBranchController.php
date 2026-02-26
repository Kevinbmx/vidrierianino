<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierBranchResource;
use App\Models\Supplier;
use App\Models\SupplierBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * SupplierBranchController
 *
 * Gestiona las sucursales de un proveedor.
 * Anidado bajo /api/suppliers/{supplier}/branches.
 *
 * Impacto en el negocio: Agrupa los contactos (vendedoras) por ubicación física,
 * permitiendo elegir la sede correcta al emitir una RFQ.
 */
class SupplierBranchController extends Controller
{
    /**
     * Lista todas las sucursales de un proveedor (con sus contactos).
     * GET /api/suppliers/{supplier}/branches
     */
    public function index(Supplier $supplier): AnonymousResourceCollection
    {
        $branches = $supplier->branches()
            ->with(['contacts' => fn($q) => $q->orderByDesc('is_primary')->orderBy('name')])
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();

        return SupplierBranchResource::collection($branches);
    }

    /**
     * Crea una nueva sucursal para un proveedor.
     * POST /api/suppliers/{supplier}/branches
     */
    public function store(Request $request, Supplier $supplier): SupplierBranchResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
            'is_main' => 'boolean',
        ]);

        // Si se marca como sede principal, desmarcar las demás
        if (!empty($validated['is_main'])) {
            $supplier->branches()->update(['is_main' => false]);
        }

        $branch = $supplier->branches()->create($validated);

        return new SupplierBranchResource($branch->load('contacts'));
    }

    /**
     * Actualiza una sucursal existente.
     * PUT /api/suppliers/{supplier}/branches/{branch}
     */
    public function update(Request $request, Supplier $supplier, SupplierBranch $branch): SupplierBranchResource
    {
        $this->verifyOwnership($supplier, $branch);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
            'is_main' => 'boolean',
        ]);

        // Si se marca como principal, desmarcar las demás
        if (!empty($validated['is_main'])) {
            $supplier->branches()->where('id', '!=', $branch->id)->update(['is_main' => false]);
        }

        $branch->update($validated);

        return new SupplierBranchResource($branch->fresh()->load('contacts'));
    }

    /**
     * Elimina una sucursal. Los contactos de esa sucursal quedan sin sucursal asignada.
     * DELETE /api/suppliers/{supplier}/branches/{branch}
     */
    public function destroy(Supplier $supplier, SupplierBranch $branch): JsonResponse
    {
        $this->verifyOwnership($supplier, $branch);

        $branch->delete();

        return response()->json(['message' => 'Sucursal eliminada. Los contactos quedaron sin sucursal asignada.']);
    }

    /**
     * Marca una sucursal como sede principal.
     * POST /api/suppliers/{supplier}/branches/{branch}/set-main
     */
    public function setMain(Supplier $supplier, SupplierBranch $branch): SupplierBranchResource
    {
        $this->verifyOwnership($supplier, $branch);

        $supplier->branches()->update(['is_main' => false]);
        $branch->update(['is_main' => true]);

        return new SupplierBranchResource($branch->fresh()->load('contacts'));
    }

    /**
     * Verifica que la sucursal pertenece al proveedor indicado.
     */
    private function verifyOwnership(Supplier $supplier, SupplierBranch $branch): void
    {
        abort_if($branch->supplier_id !== $supplier->id, 403, 'Esta sucursal no pertenece al proveedor indicado.');
    }
}
