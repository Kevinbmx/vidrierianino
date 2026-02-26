import api from '@/lib/axios';
import {
    Category,
    Product,
    ProductVariant,
    UnitOfMeasure,
    Supplier,
    SupplierProductOffer,
    PaginatedResponse,
    SingleResponse,
    PackagingType,
    DimensionTemplate
} from './types';

// Utilizamos la instancia central de Axios que ya maneja la autenticación y tokens
// Las rutas deben incluir el prefijo '/api' explícitamente

export const catalogApi = {
    // Categories
    getCategories: async (): Promise<SingleResponse<Category[]>> => {
        const response = await api.get('/api/categories');
        return response.data;
    },

    getRootCategories: async (): Promise<SingleResponse<Category[]>> => {
        const response = await api.get('/api/categories/roots/list');
        return response.data;
    },

    getCategory: async (id: number): Promise<SingleResponse<Category>> => {
        const response = await api.get(`/api/categories/${id}`);
        return response.data;
    },

    createCategory: async (data: Partial<Category>): Promise<SingleResponse<Category>> => {
        const response = await api.post('/api/categories', data);
        return response.data;
    },

    updateCategory: async (id: number, data: Partial<Category>): Promise<SingleResponse<Category>> => {
        const response = await api.put(`/api/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await api.delete(`/api/categories/${id}`);
    },

    // Units of Measure
    getUnits: async (): Promise<SingleResponse<UnitOfMeasure[]>> => {
        const response = await api.get('/api/units-of-measure');
        return response.data;
    },

    getUnitsByType: async (type: string): Promise<SingleResponse<UnitOfMeasure[]>> => {
        const response = await api.get(`/api/units-of-measure/by-type/${type}`);
        return response.data;
    },

    // Products
    getProducts: async (params?: { page?: number; category_id?: number; search?: string }): Promise<PaginatedResponse<Product>> => {
        const response = await api.get('/api/products', { params });
        return response.data;
    },

    getProduct: async (id: number): Promise<SingleResponse<Product>> => {
        const response = await api.get(`/api/products/${id}`);
        return response.data;
    },

    createProduct: async (data: any): Promise<SingleResponse<Product>> => {
        const response = await api.post('/api/products', data);
        return response.data;
    },

    updateProduct: async (id: number, data: any): Promise<SingleResponse<Product>> => {
        const response = await api.put(`/api/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: number): Promise<void> => {
        await api.delete(`/api/products/${id}`);
    },

    // Variants
    addVariant: async (productId: number, data: any): Promise<SingleResponse<ProductVariant>> => {
        const response = await api.post(`/api/products/${productId}/variants`, data);
        return response.data;
    },

    getVariants: async (productId: number): Promise<SingleResponse<ProductVariant[]>> => {
        const response = await api.get(`/api/products/${productId}/variants`);
        return response.data;
    },

    adjustStock: async (variantId: number, quantity: number, reason?: string): Promise<SingleResponse<ProductVariant>> => {
        const response = await api.post(`/api/products/variants/${variantId}/adjust-stock`, {
            quantity,
            reason
        });
        return response.data;
    },

    // Suppliers
    getSuppliers: async (activeOnly = false): Promise<SingleResponse<Supplier[]>> => {
        const response = await api.get('/api/suppliers', {
            params: { active_only: activeOnly }
        });
        return response.data;
    },

    getSupplier: async (id: number): Promise<SingleResponse<Supplier>> => {
        const response = await api.get(`/api/suppliers/${id}`);
        return response.data;
    },

    createSupplier: async (data: Partial<Supplier>): Promise<SingleResponse<Supplier>> => {
        const response = await api.post('/api/suppliers', data);
        return response.data;
    },

    updateSupplier: async (id: number, data: Partial<Supplier>): Promise<SingleResponse<Supplier>> => {
        const response = await api.put(`/api/suppliers/${id}`, data);
        return response.data;
    },

    deleteSupplier: async (id: number): Promise<void> => {
        await api.delete(`/api/suppliers/${id}`);
    },

    deactivateSupplier: async (id: number): Promise<SingleResponse<Supplier>> => {
        const response = await api.post(`/api/suppliers/${id}/deactivate`);
        return response.data;
    },

    activateSupplier: async (id: number): Promise<SingleResponse<Supplier>> => {
        const response = await api.post(`/api/suppliers/${id}/activate`);
        return response.data;
    },

    // Supplier Product Offers
    getVariantOffers: async (variantId: number): Promise<SingleResponse<SupplierProductOffer[]>> => {
        const response = await api.get(`/api/product-variants/${variantId}/offers`);
        return response.data;
    },

    createOffer: async (variantId: number, data: Partial<SupplierProductOffer>): Promise<SingleResponse<SupplierProductOffer>> => {
        const response = await api.post(`/api/product-variants/${variantId}/offers`, data);
        return response.data;
    },

    getOffer: async (offerId: number): Promise<SingleResponse<SupplierProductOffer>> => {
        const response = await api.get(`/api/offers/${offerId}`);
        return response.data;
    },

    updateOffer: async (offerId: number, data: Partial<SupplierProductOffer>): Promise<SingleResponse<SupplierProductOffer>> => {
        const response = await api.put(`/api/offers/${offerId}`, data);
        return response.data;
    },

    deleteOffer: async (offerId: number): Promise<void> => {
        await api.delete(`/api/offers/${offerId}`);
    },

    getBestOffer: async (variantId: number): Promise<SingleResponse<SupplierProductOffer>> => {
        const response = await api.get(`/api/product-variants/${variantId}/best-offer`);
        return response.data;
    },

    markOfferPreferred: async (offerId: number): Promise<SingleResponse<SupplierProductOffer>> => {
        const response = await api.post(`/api/offers/${offerId}/mark-preferred`);
        return response.data;
    },

    // Templates (Efficiency)
    getPackagingTypes: async (): Promise<SingleResponse<PackagingType[]>> => {
        const response = await api.get('/api/packaging-types');
        return response.data;
    },

    getDimensionTemplates: async (type?: string): Promise<SingleResponse<DimensionTemplate[]>> => {
        const response = await api.get('/api/dimension-templates', { params: { type } });
        return response.data;
    },

    // Supplier Contacts
    getSupplierContacts: async (supplierId: number) => {
        const response = await api.get(`/api/suppliers/${supplierId}/contacts`);
        return response.data;
    },

    createSupplierContact: async (supplierId: number, data: any) => {
        const response = await api.post(`/api/suppliers/${supplierId}/contacts`, data);
        return response.data;
    },

    updateSupplierContact: async (supplierId: number, contactId: number, data: any) => {
        const response = await api.put(`/api/suppliers/${supplierId}/contacts/${contactId}`, data);
        return response.data;
    },

    deleteSupplierContact: async (supplierId: number, contactId: number) => {
        await api.delete(`/api/suppliers/${supplierId}/contacts/${contactId}`);
    },

    setSupplierContactPrimary: async (supplierId: number, contactId: number) => {
        const response = await api.post(`/api/suppliers/${supplierId}/contacts/${contactId}/set-primary`);
        return response.data;
    },

    // Supplier Branches
    getSupplierBranches: async (supplierId: number) => {
        const response = await api.get(`/api/suppliers/${supplierId}/branches`);
        return response.data;
    },

    createSupplierBranch: async (supplierId: number, data: any) => {
        const response = await api.post(`/api/suppliers/${supplierId}/branches`, data);
        return response.data;
    },

    updateSupplierBranch: async (supplierId: number, branchId: number, data: any) => {
        const response = await api.put(`/api/suppliers/${supplierId}/branches/${branchId}`, data);
        return response.data;
    },

    deleteSupplierBranch: async (supplierId: number, branchId: number) => {
        await api.delete(`/api/suppliers/${supplierId}/branches/${branchId}`);
    },

    setSupplierBranchMain: async (supplierId: number, branchId: number) => {
        const response = await api.post(`/api/suppliers/${supplierId}/branches/${branchId}/set-main`);
        return response.data;
    },
}
