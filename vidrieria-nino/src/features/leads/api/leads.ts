import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
    Lead,
    CreateLeadDTO,
    UpdateStatusDTO,
    ScheduleAppointmentDTO,
    SendQuoteDTO,
    ApproveProjectDTO,
    RejectProjectDTO,
    MarkInstalledDTO,
    AddNoteDTO,
    UploadPhotoDTO,
    DashboardStats,
} from '../types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Keys
export const leadKeys = {
    all: ['leads'] as const,
    lists: () => [...leadKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...leadKeys.lists(), filters] as const,
    details: () => [...leadKeys.all, 'detail'] as const,
    detail: (id: number) => [...leadKeys.details(), id] as const,
    stats: () => [...leadKeys.all, 'stats'] as const,
};

// ---------------------
// QUERIES
// ---------------------

/**
 * Get all leads with optional filters
 */
export const useLeads = (filters?: {
    status?: string;
    is_local?: boolean;
    this_week_appointments?: boolean;
    warranty_active?: boolean;
}) => {
    return useQuery({
        queryKey: leadKeys.list(filters || {}),
        queryFn: async () => {
            const params = new URLSearchParams(
                Object.entries(filters || {})
                    .filter(([_, v]) => v !== undefined)
                    .map(([k, v]) => [k, String(v)])
            );

            const response = await api.get<{ data: Lead[] }>(`/api/leads?${params}`);
            return response.data.data;
        },
    });
};

/**
 * Get single lead detail
 */
export const useLead = (id: number) => {
    return useQuery({
        queryKey: leadKeys.detail(id),
        queryFn: async () => {
            const response = await api.get<{ data: Lead }>(`/api/leads/${id}`);
            return response.data.data;
        },
    });
};

/**
 * Get dashboard stats
 */
export const useDashboardStats = () => {
    return useQuery({
        queryKey: leadKeys.stats(),
        queryFn: async () => {
            const response = await api.get<DashboardStats>('/api/leads/stats');
            return response.data;
        },
    });
};

// ---------------------
// MUTATIONS
// ---------------------

/**
 * Create new lead (STEP 1) - Public route
 */
export const useCreateLead = () => {
    return useMutation({
        mutationFn: async (data: CreateLeadDTO) => {
            const response = await api.post<{ data: Lead }>('/api/leads', data);
            return response.data.data;
        },
    });
};

/**
 * Update lead status (STEP 3-4)
 */
export const useUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateStatusDTO }) => {
            const response = await api.patch<{ data: Lead }>(`/api/leads/${id}/status`, data);
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
            queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
        },
    });
};

/**
 * Cancel appointment
 */
export const useCancelAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/appointment/cancel`, { reason });
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Schedule appointment (STEP 5)
 */
export const useScheduleAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ScheduleAppointmentDTO }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/appointment`, data);
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Mark visit done (STEP 6)
 */
export const useMarkVisitDone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, note }: { id: number; note?: string }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/visit-done`, { note });
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Send quote (STEP 7)
 */
export const useSendQuote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/quote`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Approve project (STEP 8A)
 */
export const useApproveProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ApproveProjectDTO }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/approve`, data);
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Reject project (STEP 8B)
 */
export const useRejectProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: RejectProjectDTO }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/reject`, data);
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Mark as installed (STEP 9)
 */
export const useMarkInstalled = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: MarkInstalledDTO }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/install`, data);
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
        },
    });
};

/**
 * Add note to lead
 */
export const useAddNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: AddNoteDTO }) => {
            const response = await api.post<{ data: Lead }>(`/api/leads/${id}/notes`, data);
            return response.data.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
        },
    });
};

/**
 * Upload photo (Firebase URL)
 */
export const useUploadPhoto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UploadPhotoDTO }) => {
            const response = await api.post(`${API_URL}/api/leads/${id}/photos`, data);
            return response.data.photo;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
        },
    });
};

/**
 * Get WhatsApp link
 */
export const useGetWhatsAppLink = () => {
    return useMutation({
        mutationFn: async ({ id, template }: { id: number; template: string }) => {
            const response = await api.get<{ whatsapp_link: string }>(
                `/api/leads/${id}/whatsapp?template=${template}`
            );
            return response.data.whatsapp_link;
        },
    });
};
