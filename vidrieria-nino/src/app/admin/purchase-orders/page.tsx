'use client';

import { useQuery } from '@tanstack/react-query';
import { procurementService } from '@/features/procurement/services';
import { ShoppingCart, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PurchaseOrderListPage() {
    const { data: pos, isLoading } = useQuery({
        queryKey: ['purchase-orders'],
        queryFn: procurementService.getPOs
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                Órdenes de Compra
            </h1>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : pos?.data?.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay órdenes de compra</h3>
                    <p className="text-gray-500 mb-6">Las órdenes se generan automáticamente al adjudicar una RFQ.</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código PO</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pos?.data?.map((po: any) => (
                                <tr key={po.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {po.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {po.supplier?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${po.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                po.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {po.status === 'draft' ? 'Borrador' :
                                                po.status === 'sent' ? 'Enviada' :
                                                    po.status === 'confirmed' ? 'Confirmada' :
                                                        po.status === 'cancelled' ? 'Cancelada' : po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(po.order_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                                        ${Number(po.total_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button className="text-gray-400 hover:text-gray-600 cursor-not-allowed" title="Detalle próximamente">
                                            <ArrowRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
