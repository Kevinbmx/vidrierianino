
import React from 'react';
import { Lead } from '../types';

const statusConfig: Record<Lead['status'], { label: string; color: string }> = {
    new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
    contacted: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
    video_call_scheduled: { label: 'Videollamada', color: 'bg-purple-100 text-purple-800' },
    visit_scheduled: { label: 'Visita Técnica', color: 'bg-orange-100 text-orange-800' },
    quoted: { label: 'Cotizado', color: 'bg-cyan-100 text-cyan-800' },
    closed: { label: 'Cerrado', color: 'bg-green-100 text-green-800' },
};

export const LeadStatusBadge = ({ status }: { status: Lead['status'] }) => {
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
};
