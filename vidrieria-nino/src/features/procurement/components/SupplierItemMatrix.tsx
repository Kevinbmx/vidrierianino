'use client';

import { useState, useEffect } from 'react';
import { QuotationRequest } from '../types';
import { Check } from 'lucide-react';

interface SupplierItemMatrixProps {
    rfq: QuotationRequest;
    onMatrixChange: (matrix: Record<number, number[]>) => void;
}

export default function SupplierItemMatrix({ rfq, onMatrixChange }: SupplierItemMatrixProps) {
    // Estado: { supplier_id: [item_ids] }
    const [matrix, setMatrix] = useState<Record<number, number[]>>({});
    const [smartMatrix, setSmartMatrix] = useState<Record<number, number[]>>({});
    const [loading, setLoading] = useState(true);

    // Cargar matriz inteligente del backend
    useEffect(() => {
        const fetchSmartMatrix = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/quotation-requests/${rfq.id}/smart-matrix`);
                const data = await response.json();

                // Convertir keys a numbers (JSON stringifica las keys)
                const parsedMatrix = Object.entries(data.matrix).reduce((acc, [key, value]) => {
                    acc[Number(key)] = value as number[];
                    return acc;
                }, {} as Record<number, number[]>);

                setSmartMatrix(parsedMatrix);
                setMatrix(parsedMatrix); // Inicializar con smart matrix
                onMatrixChange(parsedMatrix);
            } catch (error) {
                console.error('Error loading smart matrix:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSmartMatrix();
    }, [rfq.id]);

    const toggleCell = (supplierId: number, itemId: number) => {
        const newMatrix = { ...matrix };

        if (!newMatrix[supplierId]) {
            newMatrix[supplierId] = [];
        }

        const itemIndex = newMatrix[supplierId].indexOf(itemId);

        if (itemIndex > -1) {
            // Quitar item
            newMatrix[supplierId].splice(itemIndex, 1);
            if (newMatrix[supplierId].length === 0) {
                delete newMatrix[supplierId];
            }
        } else {
            // Agregar item
            newMatrix[supplierId].push(itemId);
        }

        setMatrix(newMatrix);
        onMatrixChange(newMatrix);
    };

    const isChecked = (supplierId: number, itemId: number): boolean => {
        return matrix[supplierId]?.includes(itemId) || false;
    };

    const isSmartChecked = (supplierId: number, itemId: number): boolean => {
        return smartMatrix[supplierId]?.includes(itemId) || false;
    };

    if (loading) return <div className="text-center p-8">Cargando matriz inteligente...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                        <th className="border px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-white z-10 shadow-r">
                            Productos / Proveedores
                        </th>
                        {rfq.suppliers.map(supplier => (
                            <th key={supplier.id} className="border px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                <div className="flex flex-col items-center">
                                    <span>{supplier.name}</span>
                                    <span className="text-xs font-normal text-gray-500 mt-1">
                                        {matrix[supplier.id]?.length || 0} items
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rfq.items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="border px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white z-10 shadow-r">
                                <div>
                                    <div className="text-sm">{item.product_variant?.name || `Item #${item.id}`}</div>
                                    <div className="text-xs text-gray-500">
                                        Cant: {item.quantity} {item.unit?.abbreviation}
                                    </div>
                                </div>
                            </td>
                            {rfq.suppliers.map(supplier => {
                                const checked = isChecked(supplier.id, item.id);
                                const smartSuggested = isSmartChecked(supplier.id, item.id);

                                return (
                                    <td key={supplier.id} className="border text-center p-2">
                                        {smartSuggested ? (
                                            <button
                                                onClick={() => {
                                                    if (smartSuggested) toggleCell(supplier.id, item.id);
                                                }}
                                                className={`
                                                w-8 h-8 rounded-md transition-all flex items-center justify-center mx-auto shadow-sm
                                                ${checked
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-white border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500'
                                                    }
                                            `}
                                                title={checked ? 'Click para quitar' : 'Click para incluir'}
                                            >
                                                {checked && <Check size={16} strokeWidth={3} />}
                                            </button>
                                        ) : (
                                            <div className="w-8 h-8 mx-auto bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center opacity-50 cursor-not-allowed" title="Proveedor no tiene este producto en catálogo">
                                                <span className="text-gray-200 text-xs">•</span>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 flex gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Sugerido (tiene catálogo)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span>Sin catálogo</span>
                </div>
            </div>
        </div>
    );
}
