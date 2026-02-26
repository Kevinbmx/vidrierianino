'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '../services';
import { QuotationRequest } from '../types';
import { FileText, Send, Phone, Download, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRFQSmartMatrix } from '../hooks';

// Sub-componente para Inputs con Auto-Save y Debounce (Optimizado)
const AutoSaveInput = ({
    value,
    onSave,
    type = "text",
    placeholder = "",
    className = ""
}: {
    value: string | number;
    onSave: (val: string | number) => void;
    type?: string;
    placeholder?: string;
    className?: string;
}) => {
    const [localValue, setLocalValue] = useState<string | number>(value);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // 1. Sincronizar estado local con props (Backend) solo cuando NO estamos escribiendo activamente
    // Esto evita que el input "salte" si llega una actualización mientras el usuario escribe,
    // pero asegura que se muestre lo guardado una vez confirmado.
    useEffect(() => {
        // Solo actualizamos si lo que llega del backend es diferente a lo que tenemos
        if (value !== localValue && status !== 'saving') {
            setLocalValue(value);
        }
    }, [value]);

    // 2. Lógica de Debounce para guardar
    useEffect(() => {
        // Si el valor local es igual al del backend, no hay nada que guardar
        if (localValue == value) return; // Usamos == laxo para soportar '10' vs 10

        const handler = setTimeout(() => {
            setStatus('saving');
            onSave(localValue);

            // Éxito optimista visual (el real depende de la prop 'value' actualizándose)
            // Mantenemos 'saved' un momento para feedback
            setTimeout(() => setStatus('saved'), 600);
            setTimeout(() => setStatus('idle'), 2500);
        }, 800); // 800ms de espera

        return () => clearTimeout(handler);
    }, [localValue]); // Solo depende del valor local

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
        setStatus('idle'); // Reseteamos estado visual al editar
    };

    return (
        <div className="relative">
            <input
                type={type}
                className={`${className} ${status === 'saved' ? 'border-green-400 bg-green-50 ring-1 ring-green-400' : ''} transition-all duration-300`}
                placeholder={placeholder}
                value={localValue}
                onChange={handleChange}
            />
            {/* Indicador de Estado Flotante */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center bg-white/80 rounded-full">
                {status === 'saving' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse ring-2 ring-blue-100" title="Guardando..." />}
                {status === 'saved' && <CheckCircle2 size={14} className="text-green-500" strokeWidth={3} />}
            </div>
        </div>
    );
};

interface RFQSupplierDetailProps {
    childRfq: QuotationRequest;
    parentRfq: QuotationRequest;
}

export default function RFQSupplierDetail({ childRfq, parentRfq }: RFQSupplierDetailProps) {
    const queryClient = useQueryClient();
    const { data: matrix } = useRFQSmartMatrix(parentRfq.id);
    const supplier = childRfq.suppliers?.[0];

    // Mutation para actualizar respuestas
    const updateMutation = useMutation({
        mutationFn: ({ responseId, data }: { responseId: number; data: any }) =>
            procurementService.updateResponse(responseId, data),
        onSuccess: () => {
            // CRÍTICO: Invalidar la query del PADRE porque es la que estamos visualizando en page.tsx
            // Esto forzará la recarga de los datos y actualizará el Unit Calc
            queryClient.invalidateQueries({ queryKey: ['quotation-requests', parentRfq.id] });
        }
    });

    const handleUpdate = (responseId: number, field: string, value: string | number) => {
        updateMutation.mutate({
            responseId,
            data: { [field]: value }
        });
    };

    const handleSendWhatsapp = () => {
        if (!supplier?.contact_phone) return alert('El proveedor no tiene teléfono registrado');
        const text = `Hola ${supplier.name}, le enviamos la solicitud de cotización ${childRfq.code}. Por favor revisar.`;
        window.open(`https://wa.me/${supplier.contact_phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (!supplier) return <div>Error: RFQ sin proveedor asignado.</div>;

    // Lógica Smart Match
    // 1. Obtener IDs de items del padre que este supplier puede surtir
    const supportedParentItemIds = matrix?.[supplier.id] || [];

    // 2. Obtener los variant_ids correspondientes a esos items del padre
    const supportedVariantIds = parentRfq.items
        .filter(i => supportedParentItemIds.includes(i.id))
        .map(i => i.product_variant_id);

    // 3. Clasificar items del hijo
    const availableItems = childRfq.items.filter(i => supportedVariantIds.includes(i.product_variant_id));
    const unavailableItems = childRfq.items.filter(i => !supportedVariantIds.includes(i.product_variant_id));

    // Renderizado de Items con Inputs
    const renderItemRow = (item: any, isAvailable: boolean) => {
        const response = childRfq.responses?.find(r => r.quotation_request_item_id === item.id);
        const unitPrice = response?.offered_price && response?.pack_quantity ? (response.offered_price / response.pack_quantity) : 0;

        return (
            <div key={item.id} className={`p-4 rounded-lg border mb-3 flex flex-col md:flex-row gap-4 ${isAvailable ? 'bg-white border-green-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75'}`}>
                {/* Info Producto */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{item.product_variant?.name}</span>
                        {!isAvailable && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">No Disponible</span>}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                        {item.product_variant?.sku} | {item.notes}
                    </div>
                    <div className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                        Solicitado: {item.quantity} {item.unit?.abbreviation}
                    </div>
                </div>

                {/* Inputs con Auto-Save */}
                {response && (
                    <div className="flex gap-4 items-end">
                        <div className="w-24">
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Unids/Empaque</label>
                            <AutoSaveInput
                                type="number"
                                value={response.pack_quantity || 1}
                                onSave={(val) => handleUpdate(response.id, 'pack_quantity', val)}
                                className="w-full text-sm border rounded p-1.5 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Dimensiones (LxA)</label>
                            <AutoSaveInput
                                type="text"
                                value={response.dimensions_description || ''}
                                onSave={(val) => handleUpdate(response.id, 'dimensions_description', val)}
                                placeholder="Ej: 3.60x2.50"
                                className="w-full text-sm border rounded p-1.5 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Precio Pack</label>
                            <AutoSaveInput
                                type="number"
                                value={response.offered_price || ''}
                                onSave={(val) => handleUpdate(response.id, 'offered_price', val)}
                                placeholder="0.00"
                                className="w-full text-sm border rounded p-1.5 font-bold text-right focus:ring-green-500 bg-green-50"
                            />
                        </div>
                        {/* Unitario Calculado (Solo lectura) */}
                        <div className="w-24 text-right">
                            <label className="text-[10px] font-bold text-gray-400 block mb-1">Unit Calc.</label>
                            <div className="text-sm font-mono font-bold text-gray-700 p-1.5">
                                ${unitPrice.toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {supplier.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{supplier.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{supplier.email || 'Sin email'}</span>
                            <span>•</span>
                            <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${childRfq.status === 'draft' ? 'bg-gray-100' : 'bg-yellow-100 text-yellow-800'}`}>
                                {childRfq.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleSendWhatsapp} className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 transition-colors">
                        <Phone size={16} /> WhatsApp
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                        <Download size={16} /> PDF
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm transition-colors">
                        <Send size={16} /> Enviar/Actualizar Status
                    </button>
                </div>
            </div>

            {/* Smart Items List */}
            <div className="space-y-8">
                {/* Available Section */}
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-green-700 uppercase tracking-wide mb-3">
                        <CheckCircle2 size={16} />
                        Oferta Disponible ({availableItems.length})
                    </h3>
                    {availableItems.length > 0 ? (
                        availableItems.map(item => renderItemRow(item, true))
                    ) : (
                        <p className="text-gray-400 text-sm italic ml-6">El proveedor no tiene productos compatibles en catálogo.</p>
                    )}
                </div>

                {/* Unavailable Section */}
                {unavailableItems.length > 0 && (
                    <div className="opacity-80">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 uppercase tracking-wide mb-3">
                            <AlertCircle size={16} />
                            No Disponibles / Fuera de Catálogo ({unavailableItems.length})
                        </h3>
                        {unavailableItems.map(item => renderItemRow(item, false))}
                    </div>
                )}
            </div>
        </div>
    );
}
