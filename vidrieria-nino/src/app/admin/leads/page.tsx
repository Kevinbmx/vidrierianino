'use client';

import React, { useState } from 'react';
import { useLeads, useUpdateStatus } from '@/features/leads/api/leads';
import { Lead } from '@/features/leads/types';
import { LeadStatusBadge } from '@/features/leads/components/LeadStatusBadge';
import { LeadDetailsModal } from '@/features/leads/components/LeadDetailsModal';

export default function AdminLeadsPage() {
    const { data: leads, isLoading, error } = useLeads();
    const { mutate: updateStatus } = useUpdateStatus();
    const [filterLocal, setFilterLocal] = useState<boolean | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

    const filteredLeads = leads?.filter((lead: Lead) => {
        if (filterLocal === null) return true;
        return lead.is_local === filterLocal;
    });

    const handleStatusChange = (lead: Lead, newStatus: string) => {
        if (confirm(`¿Cambiar estado de ${lead.name} a ${newStatus}?`)) {
            const status = newStatus as Lead['status'];
            updateStatus({ id: lead.id, data: { status } });
        }
    };

    if (isLoading) return <div className="p-8 text-center flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando leads...</span>
    </div>;

    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-4 border border-red-200">
        Error al cargar leads. Por favor intente recargar la página.
    </div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Leads</h1>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setFilterLocal(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterLocal === null ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterLocal(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterLocal === true ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                >
                    Locales (Montero)
                </button>
                <button
                    onClick={() => setFilterLocal(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterLocal === false ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                >
                    Remotos (Otros)
                </button>
            </div>

            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg bg-white">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cliente</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contacto</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proyecto</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredLeads?.map((lead) => (
                            <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${!lead.is_local ? 'bg-yellow-50/30' : ''}`}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                    {lead.name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {lead.phone}<br />
                                    <span className="text-xs text-gray-400">{lead.email}</span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {lead.location}
                                    {!lead.is_local && (
                                        <span className="ml-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                            Remoto
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {lead.project_type}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <LeadStatusBadge status={lead.status} />
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedLeadId(lead.id)}
                                            className="text-indigo-600 hover:text-indigo-900 text-xs border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded px-3 py-1 font-medium"
                                        >
                                            Ver Detalles / Historia
                                        </button>

                                        {/* Quick Actions kept for convenience */}
                                        {lead.status === 'new' && (
                                            <button
                                                onClick={() => handleStatusChange(lead, 'contacted')}
                                                className="text-yellow-600 hover:text-yellow-900 text-xs border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 rounded px-2 py-1"
                                            >
                                                Marcar Contactado
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedLeadId && (
                <LeadDetailsModal
                    leadId={selectedLeadId}
                    onClose={() => setSelectedLeadId(null)}
                />
            )}
        </div>
    );
}
