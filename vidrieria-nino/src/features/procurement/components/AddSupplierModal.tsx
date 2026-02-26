'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { X, Search, Check } from 'lucide-react';

interface AddSupplierModalProps {
    rfqId: number;
    existingSupplierIds: number[];
    onClose: () => void;
}

export default function AddSupplierModal({ rfqId, existingSupplierIds, onClose }: AddSupplierModalProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Fetch suppliers
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => (await api.get('/api/suppliers')).data.data
    });

    const mutation = useMutation({
        mutationFn: async (supplierId: number) => {
            return api.post(`/api/quotation-requests/${rfqId}/add-supplier`, { supplier_id: supplierId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotation-requests', rfqId] });
            onClose();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Error al añadir proveedor');
        }
    });

    const filteredSuppliers = suppliers?.filter((s: any) =>
        !existingSupplierIds.includes(s.id) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()))
    ) || [];

    const handleAdd = () => {
        if (selectedId) mutation.mutate(selectedId);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Invitar Proveedor</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar proveedor..."
                            className="w-full pl-9 border rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto border rounded-md">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
                        ) : filteredSuppliers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                {search ? 'No se encontraron resultados' : 'Todos los proveedores ya están invitados'}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredSuppliers.map((s: any) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedId(s.id)}
                                        className={`w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 ${selectedId === s.id ? 'bg-blue-50 text-blue-700' : ''}`}
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{s.name}</div>
                                            <div className="text-xs text-gray-500">{s.email}</div>
                                        </div>
                                        {selectedId === s.id && <Check size={16} className="text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">
                        Cancelar
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedId || mutation.isPending}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        {mutation.isPending ? 'Invitando...' : 'Invitar Seleccionado'}
                    </button>
                </div>
            </div>
        </div>
    );
}
