'use client';

import { useQuery } from '@tanstack/react-query';
import { procurementService } from '@/features/procurement/services';
import RFQHierarchyAccordion from '@/features/procurement/components/RFQHierarchyAccordion';
import { Plus, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RFQListPage() {
    const { data: rfqs, isLoading } = useQuery({
        queryKey: ['quotation-requests'],
        queryFn: procurementService.getRFQs
    });

    // Filtrar solo Parents (parent_id === null)
    const parentRFQs = rfqs?.data?.filter((rfq: any) => !rfq.parent_id) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Cotización (RFQ)</h1>
                <Link
                    href="/admin/procurement/rfq/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Nueva Solicitud
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : parentRFQs.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay solicitudes creadas</h3>
                    <p className="text-gray-500 mb-6">Comienza creando tu primera solicitud de cotización para proveedores.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {parentRFQs.map((rfq: any) => (
                        <RFQHierarchyAccordion key={rfq.id} parentRfq={rfq} />
                    ))}
                </div>
            )}
        </div>
    );
}
