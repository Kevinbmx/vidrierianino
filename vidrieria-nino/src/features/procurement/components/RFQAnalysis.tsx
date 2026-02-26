
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { procurementService } from '../services';
import { AnalysisScenario, QuotationRequest } from '../types';
import { DollarSign, Save } from 'lucide-react';
import { useState } from 'react';

interface RFQAnalysisProps {
    rfqId: number;
    rfq?: QuotationRequest;
}

export default function RFQAnalysis({ rfqId, rfq }: RFQAnalysisProps) {
    const { data: analysis, isLoading } = useQuery({
        queryKey: ['analyze-rfq', rfqId],
        queryFn: () => procurementService.analyzeRFQ(rfqId),
        enabled: !!rfqId
    });

    const [generating, setGenerating] = useState(false);

    const generatePO = async (scenario: 'total' | 'granular') => {
        if (!confirm('¿Estás seguro de generar las Órdenes de Compra para este escenario?')) return;

        setGenerating(true);
        try {
            // Identificar IDs de respuestas ganadoras
            let selectedIds: number[] = [];

            if (scenario === 'granular') {
                selectedIds = analysis.data.scenarios.granular.items.map((item: any) => item.response_id);
            } else {
                // Total scenario: Todas las respuestas de ese proveedor
                const supplierId = analysis.data.scenarios.total.best_supplier.supplier_id;
                selectedIds = analysis.data.scenarios.total.best_supplier.responses;
            }

            await procurementService.generatePO(rfqId, selectedIds);
            alert('Órdenes de Compra generadas exitosamente');
            // Redirigir o recargar
            window.location.href = '/admin/purchase-orders';
        } catch (error) {
            console.error(error);
            alert('Error al generar OCs');
        } finally {
            setGenerating(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Analizando mejores precios...</div>;

    if (!analysis?.data?.scenarios) return <div className="p-4 text-red-500">No se pudo realizar el análisis.</div>;

    const { granular, total } = analysis.data.scenarios;

    // Calcular ahorro
    const savings = (total.best_supplier?.total_amount || 0) - granular.total_cost;
    const hasSavings = savings > 0;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="text-green-600" />
                Análisis de Costos y Adjudicación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scenario 1: Total Supplier */}
                <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-lg font-bold">
                        ESCENARIO UNIFICADO
                    </div>

                    <h3 className="font-semibold text-lg mb-2">Comprar todo a un solo proveedor</h3>

                    {total.best_supplier ? (
                        <div className="space-y-3">
                            <div className="text-3xl font-bold text-gray-800">
                                ${total.best_supplier.total_amount.toLocaleString('es-BO')}
                            </div>
                            <div className="p-3 bg-blue-50 rounded text-blue-900">
                                <span className="font-bold">{total.best_supplier.supplier_name}</span>
                                <p className="text-sm">Cotizó {total.best_supplier.items_count} ítems</p>
                            </div>

                            <button
                                onClick={() => generatePO('total')}
                                disabled={generating}
                                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Adjudicar a {total.best_supplier.supplier_name}
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No hay un proveedor que tenga todos los ítems.</p>
                    )}
                </div>

                {/* Scenario 2: Granular Mix */}
                <div className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow relative ${hasSavings ? 'ring-2 ring-green-400' : ''}`}>
                    <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg font-bold">
                        MEJOR COMBINACIÓN
                    </div>

                    <h3 className="font-semibold text-lg mb-2">Compra Granular (Mix Óptimo)</h3>

                    <div className="space-y-3">
                        <div className="text-3xl font-bold text-green-700">
                            ${granular.total_cost.toLocaleString('es-BO')}
                        </div>

                        {hasSavings && (
                            <div className="bg-green-100 text-green-800 px-3 py-2 rounded font-medium text-sm">
                                🚀 ¡Ahorras ${savings.toLocaleString('es-BO')} comprando por separado!
                            </div>
                        )}

                        <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                            {granular.items.map((item: any) => (
                                <div key={item.item_id} className="flex justify-between border-b border-gray-100 pb-1">
                                    <span className="truncate w-1/2">{item.product_name}</span>
                                    <span className="font-bold text-gray-600">{item.supplier_name}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => generatePO('granular')}
                            disabled={generating}
                            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Adjudicar Mejor Escenario (Genera múltiples OCs)
                        </button>
                    </div>
                </div>
            </div>

            {/* Detailed Table Comparison */}
            <div className="mt-8">
                <h3 className="font-semibold text-gray-700 mb-3">Detalle Comparativo por Ítem</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                <th className="px-4 py-2">Producto</th>
                                <th className="px-4 py-2 text-right">Cantidad</th>
                                {/* Suppliers Columns would go here dynamically */}
                                <th className="px-4 py-2 text-right">Mejor Precio</th>
                                <th className="px-4 py-2">Ganador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rfq?.items?.map(item => {
                                const bestItem = granular.items.find((gi: any) => gi.item_id === item.id);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{item.product_variant?.name ?? `Item #${item.id}`}</td>
                                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right font-bold text-green-600">
                                            {bestItem ? `$${Number(bestItem.unit_price).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {bestItem ? bestItem.supplier_name : 'No cotizado'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
