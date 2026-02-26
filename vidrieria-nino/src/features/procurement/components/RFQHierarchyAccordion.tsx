'use client';

import { useState } from 'react';
import { QuotationRequest } from '../types';
import { ChevronDown, ChevronRight, FileText, Calendar, Building } from 'lucide-react';
import Link from 'next/link';

interface RFQHierarchyAccordionProps {
    parentRfq: QuotationRequest & { children?: QuotationRequest[] };
}

export default function RFQHierarchyAccordion({ parentRfq }: RFQHierarchyAccordionProps) {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (status: string) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800',
            'ready': 'bg-blue-100 text-blue-800',
            'sent': 'bg-yellow-100 text-yellow-800',
            'viewed': 'bg-purple-100 text-purple-800',
            'replied': 'bg-indigo-100 text-indigo-800',
            'analyzing': 'bg-orange-100 text-orange-800',
            'awarded': 'bg-green-100 text-green-800',
            'discarded': 'bg-red-100 text-red-800',
            'cancelled': 'bg-red-200 text-red-900',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getChannelIcon = (channel: string) => {
        const icons = {
            'whatsapp': '💬',
            'email': '📧',
            'portal': '🌐',
            'manual': '📝'
        };
        return icons[channel as keyof typeof icons] || '📄';
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm">
            {/* Parent RFQ Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>

                        <Link href={`/admin/procurement/rfq/${parentRfq.id}`} className="hover:underline">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" />
                                <span className="font-bold text-gray-900">{parentRfq.code}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(parentRfq.status)}`}>
                                    {parentRfq.status}
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(parentRfq.created_at).toLocaleDateString()}
                        </div>
                        <div className="bg-white px-2 py-1 rounded text-xs font-medium">
                            {parentRfq.items?.length || 0} items
                        </div>
                        {parentRfq.children && (
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {parentRfq.children.length} distribuidas
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Children RFQs (Expandable) */}
            {expanded && parentRfq.children && parentRfq.children.length > 0 && (
                <div className="bg-white divide-y divide-gray-100">
                    {parentRfq.children.map((child, index) => {
                        // Obtener el proveedor desde la relación suppliers
                        const supplier = child.suppliers?.[0];
                        const invitation = supplier?.invitation;

                        return (
                            <Link
                                key={child.id}
                                href={`/admin/procurement/rfq/${child.id}`}
                                className="block hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-4 pl-12 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-mono text-gray-500">
                                            {child.code}
                                        </div>

                                        {supplier && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Building size={16} />
                                                <span className="font-medium">{supplier.name}</span>
                                            </div>
                                        )}

                                        {invitation?.submission_channel && (
                                            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                                <span>{getChannelIcon(invitation.submission_channel)}</span>
                                                <span className="capitalize">{invitation.submission_channel}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(child.status)}`}>
                                            {child.status}
                                        </span>

                                        {invitation?.sent_at && (
                                            <span className="text-xs text-gray-500">
                                                Enviada: {new Date(invitation.sent_at).toLocaleDateString()}
                                            </span>
                                        )}

                                        {invitation?.replied_at && (
                                            <span className="text-xs text-green-600 font-medium">
                                                ✓ Respondida
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {expanded && (!parentRfq.children || parentRfq.children.length === 0) && (
                <div className="p-8 text-center text-gray-500 bg-gray-50">
                    <p className="text-sm">Esta RFQ no ha sido distribuida aún.</p>
                    <Link
                        href={`/admin/procurement/rfq/${parentRfq.id}`}
                        className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-block"
                    >
                        Ir a Distribuir →
                    </Link>
                </div>
            )}
        </div>
    );
}
