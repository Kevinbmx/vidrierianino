
'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { procurementService } from '../services';
import { QuotationRequest, QuotationRequestSupplier } from '../types';
import { FileText, ExternalLink, Calculator, Box } from 'lucide-react';

interface RFQResponseEntryProps {
    rfq: QuotationRequest;
}

export default function RFQResponseEntry({ rfq }: RFQResponseEntryProps) {
    const queryClient = useQueryClient();
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

    const selectedSupplier = rfq.suppliers.find(s => s.id === selectedSupplierId);
    const supplierResponses = rfq.responses.filter(r => r.supplier_id === selectedSupplierId);

    // Mutation para actualizar precios y datos técnicos
    const updateMutation = useMutation({
        mutationFn: ({ responseId, data }: { responseId: number; data: any }) =>
            procurementService.updateResponse(responseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotation-requests', rfq.id] });
        }
    });

    const handleUpdate = (responseId: number, field: string, value: string | number) => {
        // Debounce simple o validation
        updateMutation.mutate({
            responseId,
            data: { [field]: value }
        });
    };

    return (
        <div className="flex h-[calc(100vh-200px)] gap-4">
            {/* Sidebar: Lista de Proveedores */}
            <div className="w-64 border-r pr-4 overflow-y-auto shrink-0 bg-gray-50 p-2 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-700 px-2 text-sm uppercase tracking-wide">Proveedores</h3>
                <ul className="space-y-2">
                    {rfq.suppliers.map(supplier => (
                        <li
                            key={supplier.id}
                            onClick={() => setSelectedSupplierId(supplier.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedSupplierId === supplier.id
                                ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                                : 'bg-white hover:bg-gray-100 border-transparent hover:border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-sm text-gray-900">{supplier.name}</span>
                                {supplier.invitation?.response_document_url && (
                                    <FileText size={14} className="text-blue-500 mt-0.5" />
                                )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>{supplier.invitation?.status || 'pending'}</span>
                                {supplier.invitation?.replied_at && (
                                    <span>{new Date(supplier.invitation.replied_at).toLocaleDateString()}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content: Split View */}
            {selectedSupplier ? (
                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left: Document Viewer */}
                    <div className="w-1/2 bg-gray-100 rounded-lg border relative flex flex-col">
                        <div className="p-2 border-b bg-white flex justify-between items-center text-xs font-medium text-gray-600">
                            <span>Cotización de {selectedSupplier.name}</span>
                            {selectedSupplier.invitation?.response_document_url && (
                                <a
                                    href={selectedSupplier.invitation.response_document_url}
                                    target="_blank"
                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                    <ExternalLink size={12} /> Abrir
                                </a>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto bg-gray-200 p-4 flex items-center justify-center">
                            {selectedSupplier.invitation?.response_document_url ? (
                                <iframe
                                    src={selectedSupplier.invitation.response_document_url}
                                    className="w-full h-full bg-white shadow-lg rounded"
                                    title="Documento PDF"
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <FileText size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No se ha cargado documento digital</p>
                                    <button className="mt-4 px-4 py-2 bg-white border rounded text-sm hover:bg-gray-50">
                                        Subir Archivo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Price Inputs Form (Updated for Technical Offers) */}
                    <div className="w-1/2 overflow-y-auto p-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 px-1 flex items-center gap-2">
                            <span>Ingreso de Oferta</span>
                            <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Técnica & Económica</span>
                        </h3>

                        <div className="space-y-4">
                            {rfq.items.map(item => {
                                const response = supplierResponses.find(r => r.quotation_request_item_id === item.id);
                                if (!response) return null;

                                // Cálculos visuales
                                const packQty = response.pack_quantity || 1;
                                const offeredPrice = response.offered_price || 0;
                                const unitPriceCalculated = offeredPrice / (packQty || 1);

                                return (
                                    <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow group">
                                        {/* Header Item */}
                                        <div className="flex justify-between mb-3 border-b pb-2">
                                            <div className="font-medium text-gray-900">
                                                {item.product_variant?.name || `Item #${item.id}`}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                                    Solicitado: {item.quantity} {item.unit?.abbreviation}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Inputs Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Col 1: Datos Técnicos (Empaque y Dimensiones) */}
                                            <div className="space-y-3 border-r pr-4">
                                                <div>
                                                    <label className="text-[10px] uppercase text-gray-500 font-semibold block mb-1">Contenido (Pack)</label>
                                                    <div className="flex items-center gap-2">
                                                        <Box size={14} className="text-gray-400" />
                                                        <input
                                                            type="number"
                                                            defaultValue={response.pack_quantity || 1}
                                                            onBlur={(e) => handleUpdate(response.id, 'pack_quantity', Number(e.target.value))}
                                                            className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="1"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Unidades por envase</p>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] uppercase text-gray-500 font-semibold block mb-1">Dimensiones</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={response.dimensions_description || ''}
                                                        onBlur={(e) => handleUpdate(response.id, 'dimensions_description', e.target.value)}
                                                        className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Ej: 3.60x2.50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Col 2: Datos Económicos (Precio) */}
                                            <div className="space-y-3 pl-1">
                                                <div>
                                                    <label className="text-[10px] uppercase text-gray-500 font-semibold block mb-1">Precio Oferta (Pack)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1.5 text-gray-400 font-bold text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            defaultValue={response.offered_price || ''}
                                                            onBlur={(e) => handleUpdate(response.id, 'offered_price', Number(e.target.value))}
                                                            className="w-full pl-5 pr-2 py-1 text-sm border-gray-300 rounded focus:ring-green-500 focus:border-green-500 font-mono text-right font-bold text-gray-700 bg-green-50"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 text-right">Precio por envase/caja</p>
                                                </div>

                                                <div className="bg-gray-50 p-2 rounded border border-gray-100 flex justify-between items-center">
                                                    <span className="text-[10px] uppercase text-gray-500">Unitario Calc.</span>
                                                    <span className="font-mono text-sm font-bold text-blue-600">
                                                        $ {unitPriceCalculated.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p>Selecciona un proveedor de la lista</p>
                    <p className="text-xs mt-2">Para cargar su oferta técnica y económica</p>
                </div>
            )}
        </div>
    );
}
