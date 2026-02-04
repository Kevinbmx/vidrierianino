import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; // Assuming axios is installed, if not we'll use fetch
import { CreateLeadDTO, Lead } from './types';

// TODO: Replace with centralized API client if available
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

export const useCreateLead = () => {
    return useMutation({
        mutationFn: async (data: CreateLeadDTO) => {
            const response = await axios.post(`${API_URL}/leads`, data);
            return response.data;
        },
    });
};

export const useLeads = () => {
    return useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            const response = await axios.get<{ data: Lead[] }>(`${API_URL}/leads`, {
                // Add auth headers here if needed, or rely on global interceptor
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Simple assumption
                }
            });
            return response.data.data;
        },
    });
};

export const useUpdateLeadStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const response = await axios.patch(`${API_URL}/leads/${id}/status`, { status }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
};
