<?php

namespace App\Http\Controllers;

use App\Http\Resources\SupplierContactResource;
use App\Models\Supplier;
use App\Models\SupplierContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * SupplierContactController
 *
 * Gestiona los contactos (vendedoras, gerentes, etc.) de un proveedor.
 * Anidado bajo /api/suppliers/{supplier}/contacts.
 *
 * Impacto en el negocio: Evita crear un proveedor por cada vendedora al
 * centralizar todos los contactos bajo la misma empresa proveedora.
 */
class SupplierContactController extends Controller
{
    /**
     * Lista todos los contactos de un proveedor.
     * GET /api/suppliers/{supplier}/contacts
     */
    public function index(Supplier $supplier): AnonymousResourceCollection
    {
        $contacts = $supplier->contacts()->orderByDesc('is_primary')->orderBy('name')->get();

        return SupplierContactResource::collection($contacts);
    }

    /**
     * Crea un nuevo contacto para un proveedor.
     * POST /api/suppliers/{supplier}/contacts
     */
    public function store(Request $request, Supplier $supplier): SupplierContactResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
            'is_primary' => 'boolean',
            'branch_id' => 'nullable|integer|exists:supplier_branches,id',
        ]);

        // Si se marca como principal, desmarcar los demás
        if (!empty($validated['is_primary'])) {
            $supplier->contacts()->update(['is_primary' => false]);
        }

        $contact = $supplier->contacts()->create($validated);

        return new SupplierContactResource($contact);
    }

    /**
     * Actualiza un contacto existente.
     * PUT /api/suppliers/{supplier}/contacts/{contact}
     */
    public function update(Request $request, Supplier $supplier, SupplierContact $contact): SupplierContactResource
    {
        $this->authorize_ownership($supplier, $contact);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
            'is_primary' => 'boolean',
            'branch_id' => 'nullable|integer|exists:supplier_branches,id',
        ]);

        // Si se marca como principal, desmarcar los demás
        if (!empty($validated['is_primary'])) {
            $supplier->contacts()->where('id', '!=', $contact->id)->update(['is_primary' => false]);
        }

        $contact->update($validated);

        return new SupplierContactResource($contact->fresh());
    }

    /**
     * Elimina un contacto de un proveedor.
     * DELETE /api/suppliers/{supplier}/contacts/{contact}
     */
    public function destroy(Supplier $supplier, SupplierContact $contact): JsonResponse
    {
        $this->authorize_ownership($supplier, $contact);

        $contact->delete();

        return response()->json(['message' => 'Contacto eliminado.']);
    }

    /**
     * Marca un contacto como principal (desenmarca los demás).
     * POST /api/suppliers/{supplier}/contacts/{contact}/set-primary
     */
    public function setPrimary(Supplier $supplier, SupplierContact $contact): SupplierContactResource
    {
        $this->authorize_ownership($supplier, $contact);

        $supplier->contacts()->update(['is_primary' => false]);
        $contact->update(['is_primary' => true]);

        return new SupplierContactResource($contact->fresh());
    }

    /**
     * Verifica que el contacto pertenece al proveedor indicado.
     * Usa query explícita para mayor robustez ante datos migratorios.
     */
    private function authorize_ownership(Supplier $supplier, SupplierContact $contact): void
    {
        // Si el contacto tiene supplier_id correcto, ok.
        if ($contact->supplier_id === $supplier->id) {
            return;
        }

        // Si el contacto tiene branch_id, verificamos que la sucursal pertenezca al proveedor.
        // Esto cubre contactos creados a través de sucursales con supplier_id desactualizado.
        if ($contact->branch_id) {
            $branchBelongs = $supplier->branches()->where('id', $contact->branch_id)->exists();
            if ($branchBelongs) {
                // Corrección automática: actualizar supplier_id para consistencia futura
                $contact->update(['supplier_id' => $supplier->id]);
                return;
            }
        }

        abort(403, 'Este contacto no pertenece al proveedor indicado.');
    }
}
