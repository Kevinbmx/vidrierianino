'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { SupplierProductOfferHistory } from '../types';
import { formatDate } from '@/lib/utils';
import { History, ArrowRight } from 'lucide-react';

interface OfferHistoryProps {
    offerId: number;
    supplierName: string;
}

/**
 * Componente para visualizar el historial de cambios de una oferta.
 * Muestra una línea de tiempo con los cambios de precio y estado.
 */
export default function OfferHistory({ offerId, supplierName }: OfferHistoryProps) {
    const { data: history, isLoading } = useQuery({
        queryKey: ['offer-history', offerId],
        queryFn: async () => {
            const response = await api.get(`/api/offers/${offerId}/history`);
            return response.data.data as SupplierProductOfferHistory[];
        },
        enabled: !!offerId
    });

    if (isLoading) return <div className="p-4 text-xs text-gray-500">Cargando historial...</div>;

    if (!history || history.length === 0) {
        return <div className="p-4 text-xs text-gray-500 italic">No hay historial de cambios registrado.</div>;
    }

    return (
        <div className="mt-4 border-t pt-4">
            <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <History size={16} /> Historial de {supplierName}
            </h5>

            <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                {history.map((record, index) => (
                    <div key={record.id} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${record.change_type === 'created' ? 'bg-green-500' :
                                record.change_type === 'deactivated' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>

                        <div className="text-xs text-gray-500 mb-1">
                            {new Date(record.changed_at).toLocaleString('es-CL')}
                            {record.changed_by_user && (
                                <span className="ml-1 text-gray-400">• por {record.changed_by_user.name}</span>
                            )}
                        </div>

                        <div className="text-sm font-medium text-gray-800">
                            {record.change_type === 'created' && 'Oferta creada'}
                            {record.change_type === 'updated' && 'Actualización de oferta'}
                            {record.change_type === 'deactivated' && 'Oferta desactivada'}
                        </div>

                        {/* Cost Change Visualization */}
                        <div className="mt-1 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-600">Costo:</span>

                                {index < history.length - 1 && parseFloat(String(history[index + 1].cost)) !== parseFloat(String(record.cost)) ? (
                                    // Si hubo cambio de precio
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-400 line-through">
                                            ${parseFloat(String(history[index + 1].cost)).toLocaleString('es-CL')}
                                        </span>
                                        <ArrowRight size={12} className="text-gray-400" />
                                        <span className={parseFloat(String(record.cost)) > parseFloat(String(history[index + 1].cost)) ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                            ${parseFloat(String(record.cost)).toLocaleString('es-CL')}
                                        </span>
                                    </div>
                                ) : (
                                    // Si el precio se mantuvo
                                    <span>${parseFloat(String(record.cost)).toLocaleString('es-CL')}</span>
                                )}
                            </div>

                            {/* Preferido status */}
                            {record.is_preferred && (
                                <div className="text-yellow-600 mt-1 flex items-center gap-1">
                                    ★ Marcado como preferido
                                </div>
                            )}

                            {/* Notas del cambio */}
                            {record.change_reason && (
                                <div className="mt-1 text-gray-500 italic border-t border-gray-100 pt-1">
                                    "{record.change_reason}"
                                </div>
                            )}

                            {/* Documento histórico */}
                            {record.document_url && (
                                <div className="mt-1">
                                    <a href={record.document_url} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1">
                                        📄 Ver documento archivado
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
