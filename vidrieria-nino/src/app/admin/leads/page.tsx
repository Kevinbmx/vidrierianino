'use client';

import React, { useState } from 'react';
import { useLeads, useUpdateLeadStatus } from '@/features/leads/api/leads';
import { Lead } from '@/features/leads/types';
import { LeadStatusBadge } from '@/features/leads/components/LeadStatusBadge';

export default function AdminLeadsPage() {
    const { data: leads, isLoading, error } = useLeads();
    const { mutate: updateStatus } = useUpdateLeadStatus();
    const [filterLocal, setFilterLocal] = useState<boolean | null>(null);

    const filteredLeads = leads?.filter(lead => {
        if (filterLocal === null) return true;
        return lead.is_local === filterLocal;
    });

    const handleStatusChange = (lead: Lead, newStatus: string) => {
        if (confirm(`¿Cambiar estado de ${lead.name} a ${newStatus}?`)) {
            updateStatus({ id: lead.id, status: newStatus });
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando leads...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error al cargar leads</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Gestión de Leads</h1>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setFilterLocal(null)}
                    className={`px-4 py-2 rounded-lg ${filterLocal === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterLocal(true)}
                    className={`px-4 py-2 rounded-lg ${filterLocal === true ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Locales (Montero)
                </button>
                <button
                    onClick={() => setFilterLocal(false)}
                    className={`px-4 py-2 rounded-lg ${filterLocal === false ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Remotos (Otros)
                </button>
            </div>

            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                            <tr key={lead.id} className={!lead.is_local ? 'bg-yellow-50' : ''}>
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
                                        {lead.is_local && lead.status !== 'visit_scheduled' && (
                                            <button
                                                onClick={() => handleStatusChange(lead, 'visit_scheduled')}
                                                className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 rounded px-2 py-1"
                                            >
                                                Agendar Visita
                                            </button>
                                        )}
                                        {!lead.is_local && lead.status !== 'video_call_scheduled' && (
                                            <button
                                                onClick={() => handleStatusChange(lead, 'video_call_scheduled')}
                                                className="text-purple-600 hover:text-purple-900 text-xs border border-purple-200 rounded px-2 py-1"
                                            >
                                                Agendar Video
                                            </button>
                                        )}
                                        {lead.status !== 'closed' && (
                                            <button
                                                onClick={() => handleStatusChange(lead, 'closed')}
                                                className="text-gray-600 hover:text-gray-900 text-xs hover:bg-gray-100 rounded px-2 py-1"
                                            >
                                                Cerrar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
