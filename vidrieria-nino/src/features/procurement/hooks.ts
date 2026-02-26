
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from './services';
import { QuotationRequest, PurchaseOrder, AnalysisScenario } from './types';

// Quotation Requests
export function useQuotationRequests() {
    return useQuery<QuotationRequest[]>({
        queryKey: ['quotation-requests'],
        queryFn: procurementService.getRFQs
    });
}

export function useQuotationRequest(id: string | number) {
    return useQuery<QuotationRequest>({
        queryKey: ['quotation-requests', id],
        queryFn: () => procurementService.getRFQ(Number(id)),
        enabled: !!id
    });
}

export function useCreateQuotationRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: procurementService.createRFQ,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotation-requests'] });
        }
    });
}

export function useUpdateQuotationResponse() {
    return useMutation({
        mutationFn: ({ responseId, data }: { responseId: number; data: any }) =>
            procurementService.updateResponse(responseId, data),
        // No invalidamos toda la RFQ para evitar UX lento en edición masiva
        // Solo invalidamos si es crítico
    });
}

// Purchase Orders
export function usePurchaseOrders() {
    return useQuery<PurchaseOrder[]>({
        queryKey: ['purchase-orders'],
        queryFn: procurementService.getPOs
    });
}

export function usePurchaseOrder(id: string | number) {
    return useQuery<PurchaseOrder>({
        queryKey: ['purchase-orders', id],
        queryFn: () => procurementService.getPO(Number(id)),
        enabled: !!id
    });
}

// Logic Business: Confirm & Cancel PO
export function useConfirmPurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => procurementService.confirmPO(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
            queryClient.invalidateQueries({ queryKey: ['quotation-requests'] }); // Sync status
        }
    });
}

export function useCancelPurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            procurementService.cancelPO(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
            queryClient.invalidateQueries({ queryKey: ['quotation-requests'] }); // Liberar items
        }
    });
}

// Smart Matrix Hook used in RFQ Supplier Detail
export function useRFQSmartMatrix(rfqId: number) {
    return useQuery<Record<number, number[]>>({
        queryKey: ['smart-matrix', rfqId],
        queryFn: async () => {
            const response = await procurementService.getSmartMatrix(rfqId);
            return response.matrix;
        },
        enabled: !!rfqId
    });
}
