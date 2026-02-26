import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from './api';
import { Category, Product, ProductVariant, UnitOfMeasure, Supplier, SupplierProductOffer } from './types';

// Keys for query caching
export const catalogKeys = {
    all: ['catalog'] as const,
    categories: () => [...catalogKeys.all, 'categories'] as const,
    category: (id: number) => [...catalogKeys.categories(), id] as const,
    units: () => [...catalogKeys.all, 'units'] as const,
    products: (params?: any) => [...catalogKeys.all, 'products', params] as const,
    product: (id: number) => [...catalogKeys.all, 'product', id] as const,
    variants: (productId: number) => [...catalogKeys.product(productId), 'variants'] as const,
    suppliers: () => [...catalogKeys.all, 'suppliers'] as const,
    supplier: (id: number) => [...catalogKeys.suppliers(), id] as const,
    supplierContacts: (supplierId: number) => [...catalogKeys.supplier(supplierId), 'contacts'] as const,
    supplierBranches: (supplierId: number) => [...catalogKeys.supplier(supplierId), 'branches'] as const,
    variantOffers: (variantId: number) => [...catalogKeys.all, 'variant-offers', variantId] as const,
    offer: (offerId: number) => [...catalogKeys.all, 'offer', offerId] as const,
};

// --- Categories ---

export function useCategories() {
    return useQuery({
        queryKey: catalogKeys.categories(),
        queryFn: () => catalogApi.getCategories(),
    });
}

export function useRootCategories() {
    return useQuery({
        queryKey: [...catalogKeys.categories(), 'roots'],
        queryFn: () => catalogApi.getRootCategories(),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => catalogApi.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
        },
    });
}

// --- Units of Measure ---

export function useUnitsOfMeasure() {
    return useQuery({
        queryKey: catalogKeys.units(),
        queryFn: () => catalogApi.getUnits(),
        staleTime: 1000 * 60 * 60, // 1 hour (units rarely change)
    });
}

// --- Products ---

export function useProducts(params?: { page?: number; category_id?: number; search?: string }) {
    return useQuery({
        queryKey: catalogKeys.products(params),
        queryFn: () => catalogApi.getProducts(params),
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: catalogKeys.product(id),
        queryFn: () => catalogApi.getProduct(id),
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] }); // Invalidate loosely providing flexibility
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => catalogApi.updateProduct(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.product(variables.id) });
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
        },
    });
}

// --- Variants ---

export function useAddVariant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, data }: { productId: number; data: any }) => catalogApi.addVariant(productId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.product(variables.productId) });
        },
    });
}

export function useAdjustStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ variantId, quantity, reason }: { variantId: number; quantity: number, reason?: string }) =>
            catalogApi.adjustStock(variantId, quantity, reason),
        onSuccess: () => {
            // Since we don't know the productId easily here, we might invalidate all products
            // Or ideally, the backend response should contain enough info, or we pass productId in context
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['catalog', 'product'] });
        },
    });
}

// --- Suppliers ---

export function useSuppliers(activeOnly = false) {
    return useQuery({
        queryKey: [...catalogKeys.suppliers(), activeOnly],
        queryFn: () => catalogApi.getSuppliers(activeOnly),
    });
}

export function useSupplier(id: number) {
    return useQuery({
        queryKey: catalogKeys.supplier(id),
        queryFn: () => catalogApi.getSupplier(id),
        enabled: !!id,
    });
}

export function useCreateSupplier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.createSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.suppliers() });
        },
    });
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) => catalogApi.updateSupplier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.suppliers() });
        },
    });
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.deleteSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.suppliers() });
        },
    });
}

export function useDeactivateSupplier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.deactivateSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.suppliers() });
        },
    });
}

export function useActivateSupplier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.activateSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.suppliers() });
        },
    });
}

// --- Supplier Product Offers ---

export function useVariantOffers(variantId: number) {
    return useQuery({
        queryKey: catalogKeys.variantOffers(variantId),
        queryFn: () => catalogApi.getVariantOffers(variantId),
        enabled: !!variantId,
    });
}

export function useCreateOffer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ variantId, data }: { variantId: number; data: Partial<SupplierProductOffer> }) =>
            catalogApi.createOffer(variantId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.variantOffers(variables.variantId) });
            // También invalidar el producto para refrescar el final_price si usa markup
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
        },
    });
}

export function useUpdateOffer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ offerId, data }: { offerId: number; data: Partial<SupplierProductOffer> }) =>
            catalogApi.updateOffer(offerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog', 'variant-offers'] });
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
        },
    });
}

export function useDeleteOffer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.deleteOffer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog', 'variant-offers'] });
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
        },
    });
}

export function useMarkOfferPreferred() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: catalogApi.markOfferPreferred,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog', 'variant-offers'] });
            queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] });
        },
    });
}

export function useBestOffer(variantId: number) {
    return useQuery({
        queryKey: [...catalogKeys.variantOffers(variantId), 'best'],
        queryFn: () => catalogApi.getBestOffer(variantId),
        enabled: !!variantId,
    });
}

// --- Efficiency Templates ---

export function usePackagingTypes() {
    return useQuery({
        queryKey: ['catalog', 'templates', 'packaging'],
        queryFn: () => catalogApi.getPackagingTypes(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useDimensionTemplates(type?: string) {
    return useQuery({
        queryKey: ['catalog', 'templates', 'dimensions', type],
        queryFn: () => catalogApi.getDimensionTemplates(type),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

// --- Supplier Contacts ---

/** Obtiene todos los contactos de un proveedor. */
export function useSupplierContacts(supplierId: number) {
    return useQuery({
        queryKey: catalogKeys.supplierContacts(supplierId),
        queryFn: () => catalogApi.getSupplierContacts(supplierId),
        enabled: !!supplierId,
    });
}

/** Crea un nuevo contacto para un proveedor. */
export function useCreateSupplierContact(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => catalogApi.createSupplierContact(supplierId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierContacts(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) }); // refresca primary_contact
        },
    });
}

/** Actualiza un contacto existente de un proveedor. */
export function useUpdateSupplierContact(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contactId, data }: { contactId: number; data: any }) =>
            catalogApi.updateSupplierContact(supplierId, contactId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierContacts(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) }); // refresca primary_contact
        },
    });
}

/** Elimina un contacto de un proveedor. */
export function useDeleteSupplierContact(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contactId: number) => catalogApi.deleteSupplierContact(supplierId, contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierContacts(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) });
        },
    });
}

/** Marca un contacto como principal (desenmarca los demás). */
export function useSetContactPrimary(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contactId: number) => catalogApi.setSupplierContactPrimary(supplierId, contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierContacts(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) }); // actualiza contacto principal en sidebar
        },
    });
}

// --- Supplier Branches ---

/** Obtiene todas las sucursales de un proveedor (con sus contactos). */
export function useSupplierBranches(supplierId: number) {
    return useQuery({
        queryKey: catalogKeys.supplierBranches(supplierId),
        queryFn: () => catalogApi.getSupplierBranches(supplierId),
        enabled: !!supplierId,
    });
}

/** Crea una nueva sucursal para un proveedor. */
export function useCreateSupplierBranch(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => catalogApi.createSupplierBranch(supplierId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierBranches(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) });
        },
    });
}

/** Actualiza una sucursal existente. */
export function useUpdateSupplierBranch(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ branchId, data }: { branchId: number; data: any }) =>
            catalogApi.updateSupplierBranch(supplierId, branchId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierBranches(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) });
        },
    });
}

/** Elimina una sucursal. Los contactos quedan sin sucursal asignada. */
export function useDeleteSupplierBranch(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (branchId: number) => catalogApi.deleteSupplierBranch(supplierId, branchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierBranches(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierContacts(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) });
        },
    });
}

/** Marca una sucursal como sede principal. Desmarca las demás. */
export function useSetBranchMain(supplierId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (branchId: number) => catalogApi.setSupplierBranchMain(supplierId, branchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplierBranches(supplierId) });
            queryClient.invalidateQueries({ queryKey: catalogKeys.supplier(supplierId) });
        },
    });
}
