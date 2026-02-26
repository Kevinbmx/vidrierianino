
import api from '@/lib/axios';
import { QuotationRequest, PurchaseOrder, AnalysisScenario } from './types';

export const procurementService = {
    // === RFQ ===
    getRFQs: async () => {
        const response = await api.get('/api/quotation-requests');
        return response.data;
    },

    getRFQ: async (id: number) => {
        const response = await api.get(`/api/quotation-requests/${id}`);
        return response.data.data;
    },

    createRFQ: async (data: any) => {
        const response = await api.post('/api/quotation-requests', data);
        return response.data.data;
    },

    getSmartMatrix: async (id: number) => {
        const response = await api.get(`/api/quotation-requests/${id}/smart-matrix`);
        return response.data;
    },

    distributeRFQ: async (id: number, matrix: any, channel: string) => {
        const response = await api.post(`/api/quotation-requests/${id}/distribute`, {
            supplier_item_matrix: matrix,
            submission_channel: channel
        });
        return response.data;
    },

    analyzeRFQ: async (id: number) => {
        const response = await api.get(`/api/quotation-requests/${id}/analyze`);
        return response.data;
    },

    generatePO: async (id: number, selectedResponseIds: number[]) => {
        const response = await api.post(`/api/quotation-requests/${id}/generate-po`, {
            selected_response_ids: selectedResponseIds
        });
        return response.data;
    },

    // Para guardar respuestas de cotización (precios y técnica)
    updateResponse: async (responseId: number, data: {
        unit_price?: number;
        offered_price?: number;
        pack_quantity?: number;
        dimensions_description?: string;
        notes?: string
    }) => {
        // Asumiendo ruta: PUT /api/quotation-responses/{id} 
        const response = await api.put(`/api/quotation-responses/${responseId}`, data);
        return response.data;
    },

    // Subir documento de cotización
    uploadQuoteDocument: async (rfqId: number, supplierId: number, fileUrl: string) => {
        // En realidad esto actualiza la tabla pivot quotation_request_suppliers
        // Necesitamos un endpoint específico.
        const response = await api.post(`/api/quotation-requests/${rfqId}/suppliers/${supplierId}/document`, {
            document_url: fileUrl
        });
        return response.data;
    },

    // === Purchase Orders ===
    getPOs: async () => {
        const response = await api.get('/api/purchase-orders');
        return response.data;
    },

    getPO: async (id: number) => {
        const response = await api.get(`/api/purchase-orders/${id}`);
        return response.data.data;
    },

    confirmPO: async (id: number) => {
        const response = await api.post(`/api/purchase-orders/${id}/confirm`);
        return response.data;
    },

    cancelPO: async (id: number, reason: string) => {
        const response = await api.post(`/api/purchase-orders/${id}/cancel`, { reason });
        return response.data;
    }
};
