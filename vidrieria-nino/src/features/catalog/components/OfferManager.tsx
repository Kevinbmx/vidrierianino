'use client';

import { useState } from 'react';
import { useVariantOffers, useCreateOffer, useUpdateOffer, useDeleteOffer, useMarkOfferPreferred, useSuppliers, useUnitsOfMeasure } from '../hooks';
import { SupplierProductOffer, UnitOfMeasure } from '../types';
import { DollarSign, Plus, Edit, Trash, Save, X, Star, TrendingDown, Package, Barcode, Clock, Truck, Cuboid, FileText } from 'lucide-react';

import { useIsMutating } from '@tanstack/react-query';

interface OfferManagerProps {
    variantId: number;
    variantName: string;
}

export default function OfferManager({ variantId, variantName }: OfferManagerProps) {
    const { data: offers, isLoading, error } = useVariantOffers(variantId);
    const { data: suppliers } = useSuppliers(true); // Solo activos
    const { data: units } = useUnitsOfMeasure();

    const createMutation = useCreateOffer();
    const updateMutation = useUpdateOffer();
    const deleteMutation = useDeleteOffer();
    const markPreferredMutation = useMarkOfferPreferred();
    const isMutating = useIsMutating();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state actualizada con logística
    const [formData, setFormData] = useState({
        supplier_id: 0,
        supplier_sku: '',
        cost: '',
        purchase_unit_id: 0,
        pack_quantity: '1', // Default 1
        purchase_width: '',
        purchase_height: '',
        purchase_length: '',
        delivery_days: '',
        notes: '',
        document_url: ''
    });

    const resetForm = () => {
        setFormData({
            supplier_id: 0,
            supplier_sku: '',
            cost: '',
            purchase_unit_id: 0,
            pack_quantity: '1',
            purchase_width: '',
            purchase_height: '',
            purchase_length: '',
            delivery_days: '',
            notes: '',
            document_url: ''
        });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleCreate = async () => {
        if (!formData.supplier_id || !formData.cost || !formData.purchase_unit_id) return;
        try {
            await createMutation.mutateAsync({
                variantId,
                data: {
                    supplier_id: formData.supplier_id,
                    supplier_sku: formData.supplier_sku || undefined,
                    cost: parseFloat(formData.cost),
                    purchase_unit_id: formData.purchase_unit_id,
                    pack_quantity: parseFloat(formData.pack_quantity) || 1,
                    purchase_width: formData.purchase_width ? parseFloat(formData.purchase_width) : undefined,
                    purchase_height: formData.purchase_height ? parseFloat(formData.purchase_height) : undefined,
                    purchase_length: formData.purchase_length ? parseFloat(formData.purchase_length) : undefined,
                    delivery_days: formData.delivery_days ? parseInt(formData.delivery_days) : undefined,
                    notes: formData.notes,
                    document_url: formData.document_url || undefined
                }
            });
            resetForm();
        } catch (e) {
            console.error('Error creating offer', e);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await updateMutation.mutateAsync({
                offerId: id,
                data: {
                    supplier_sku: formData.supplier_sku || undefined,
                    cost: parseFloat(formData.cost),
                    purchase_unit_id: formData.purchase_unit_id,
                    pack_quantity: parseFloat(formData.pack_quantity) || 1,
                    purchase_width: formData.purchase_width ? parseFloat(formData.purchase_width) : undefined,
                    purchase_height: formData.purchase_height ? parseFloat(formData.purchase_height) : undefined,
                    purchase_length: formData.purchase_length ? parseFloat(formData.purchase_length) : undefined,
                    delivery_days: formData.delivery_days ? parseInt(formData.delivery_days) : undefined,
                    notes: formData.notes,
                    document_url: formData.document_url || undefined
                }
            });
            resetForm();
        } catch (e) {
            console.error('Error updating offer', e);
        }
    };

    const handleDelete = async (id: number, supplierName: string) => {
        if (confirm(`¿Eliminar oferta de "${supplierName}"?`)) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (e) {
                console.error('Error deleting offer', e);
            }
        }
    };

    const handleMarkPreferred = async (id: number) => {
        try {
            await markPreferredMutation.mutateAsync(id);
        } catch (e) {
            console.error('Error marking preferred', e);
        }
    };

    const startEditing = (offer: SupplierProductOffer) => {
        setFormData({
            supplier_id: offer.supplier_id,
            supplier_sku: offer.supplier_sku || '',
            cost: String(offer.cost),
            purchase_unit_id: offer.purchase_unit_id,
            pack_quantity: String(offer.pack_quantity || 1),
            purchase_width: offer.purchase_width ? String(offer.purchase_width) : '',
            purchase_height: offer.purchase_height ? String(offer.purchase_height) : '',
            purchase_length: offer.purchase_length ? String(offer.purchase_length) : '',
            delivery_days: offer.delivery_days ? String(offer.delivery_days) : '',
            notes: offer.notes || '',
            document_url: offer.document_url || '' // Asegurar que no sea undefined para input value
        });
        setEditingId(offer.id);
        setIsCreating(false);
    };

    // Determinar campos a mostrar según unidad seleccionada
    const selectedUnit = units?.data.find(u => u.id === formData.purchase_unit_id);
    const isArea = selectedUnit?.type === 'area';
    const isLength = selectedUnit?.type === 'length';

    if (isLoading) return <div className="p-4 text-sm text-gray-500">Cargando ofertas...</div>;
    if (error) return <div className="p-4 text-sm text-red-600">Error al cargar ofertas</div>;

    // Encontrar la mejor oferta (menor base_unit_cost)
    const sortedOffers = [...(offers?.data || [])].sort((a, b) =>
        parseFloat(String(a.base_unit_cost || 0)) - parseFloat(String(b.base_unit_cost || 0))
    );
    const bestOfferId = sortedOffers[0]?.id;

    return (
        <div className="relative bg-white shadow rounded-lg p-6">
            {/* Blocking Overlay for Mutations */}
            {isMutating > 0 && (
                <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-green-700">Procesando...</span>
                    </div>
                </div>
            )}

            <div className={`transition-opacity ${isMutating > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-green-600" size={22} />
                            Ofertas de Proveedores
                        </h3>
                        <p className="text-xs text-gray-500">Para: {variantName}</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreating(true); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                        <Plus size={16} /> Nueva Oferta
                    </button>
                </div>

                {/* Create/Edit Form */}
                {(isCreating || editingId !== null) && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3 text-sm">
                            {isCreating ? 'Nueva Oferta de Proveedor' : 'Editar Oferta'}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {isCreating && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor *</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value={0}>Seleccionar proveedor...</option>
                                        {suppliers?.data.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* SKU y Días */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">SKU Prov. (Opcional)</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400"><Barcode size={14} /></span>
                                    <input
                                        type="text"
                                        value={formData.supplier_sku}
                                        onChange={(e) => setFormData({ ...formData, supplier_sku: e.target.value })}
                                        className="w-full pl-8 px-3 py-2 border rounded-md text-sm"
                                        placeholder="COD-123"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Días Entrega</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400"><Clock size={14} /></span>
                                    <input
                                        type="number"
                                        value={formData.delivery_days}
                                        onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                                        className="w-full pl-8 px-3 py-2 border rounded-md text-sm"
                                        placeholder="Ej: 3"
                                    />
                                </div>
                            </div>

                            {/* Costos */}
                            <div className="md:col-span-2 border-t border-green-100 pt-2 mt-2">
                                <h5 className="text-xs font-bold text-green-800 mb-2">Estructura de Precios y Empaque</h5>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Costo de Compra *</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full pl-6 px-3 py-2 border rounded-md text-sm font-bold text-gray-800"
                                        placeholder="Ej: 15000.00"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5">Precio total por la unidad de compra seleccionada.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad de Compra *</label>
                                <select
                                    value={formData.purchase_unit_id}
                                    onChange={(e) => setFormData({ ...formData, purchase_unit_id: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value={0}>Seleccionar unidad...</option>
                                    {units?.data.map((u: UnitOfMeasure) => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Unidades por Empaque (Pack Factor)</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400"><Cuboid size={14} /></span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.pack_quantity}
                                        onChange={(e) => setFormData({ ...formData, pack_quantity: e.target.value })}
                                        className="w-full pl-8 px-3 py-2 border rounded-md text-sm font-medium bg-yellow-50 focus:bg-white transition-colors"
                                        placeholder="1"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                    Ej: Si compras una "Caja" que trae 30 planchas, pon <b>30</b>. Si es por unidad, pon <b>1</b>.
                                </p>
                            </div>

                            {/* Dimensiones dinámicas */}
                            {(isArea || isLength) && (
                                <div className="md:col-span-2 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-2">Dimensiones Físicas (Materia Prima)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {isArea && (
                                            <>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-0.5">Ancho (m)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={formData.purchase_width}
                                                        onChange={(e) => setFormData({ ...formData, purchase_width: e.target.value })}
                                                        className="w-full px-2 py-1.5 border rounded text-xs"
                                                        placeholder="2.14"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-0.5">Alto (m)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={formData.purchase_height}
                                                        onChange={(e) => setFormData({ ...formData, purchase_height: e.target.value })}
                                                        className="w-full px-2 py-1.5 border rounded text-xs"
                                                        placeholder="3.30"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {isLength && (
                                            <div className="col-span-2">
                                                <label className="block text-[10px] text-gray-500 mb-0.5">Longitud (m)</label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={formData.purchase_length}
                                                    onChange={(e) => setFormData({ ...formData, purchase_length: e.target.value })}
                                                    className="w-full px-2 py-1.5 border rounded text-xs"
                                                    placeholder="6.00"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="md:col-span-2 mt-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Enlace a Documento (URL)</label>
                                <input
                                    type="url"
                                    value={formData.document_url}
                                    onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                    placeholder="https://ejemplo.com/cotizacion.pdf"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                    placeholder="Ej: Requiere mínimo 10 unidades"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-green-100">
                            <div className="flex gap-2 w-full justify-end">
                                <button
                                    onClick={resetForm}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                                >
                                    <X size={14} /> Cancelar
                                </button>
                                <button
                                    onClick={() => isCreating ? handleCreate() : handleUpdate(editingId!)}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium shadow-sm transition-colors"
                                >
                                    <Save size={14} /> {isCreating ? 'Crear Oferta' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Offers List */}
                <div className="space-y-3">
                    {offers?.data.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Package className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 text-sm">No hay ofertas registradas.</p>
                            <p className="text-gray-400 text-xs mt-1">Agrega proveedores para comparar precios automáticamente.</p>
                        </div>
                    )}

                    {sortedOffers.map(offer => (
                        <div
                            key={offer.id}
                            className={`p-4 border rounded-xl transition-all shadow-sm ${offer.id === bestOfferId
                                ? 'bg-gradient-to-r from-green-50 to-white border-green-200 ring-1 ring-green-100'
                                : 'bg-white border-gray-200 hover:border-blue-200'
                                }`}
                        >
                            <div className="flex gap-4">
                                {/* Estado / Preferido */}
                                <div className="flex flex-col items-center gap-2 pt-1">
                                    <button
                                        onClick={() => !offer.is_preferred && handleMarkPreferred(offer.id)}
                                        className={`p-1.5 rounded-full transition-colors ${offer.is_preferred
                                            ? 'text-yellow-500 bg-yellow-100 ring-2 ring-yellow-50 cursor-default'
                                            : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-100'
                                            }`}
                                        title={offer.is_preferred ? "Proveedor Preferido" : "Marcar como preferido"}
                                    >
                                        <Star size={18} fill={offer.is_preferred ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {/* Info Principal */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-800 text-base">
                                                {offer.supplier?.name || `Proveedor #${offer.supplier_id}`}
                                            </h4>
                                            {offer.id === bestOfferId && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm">
                                                    <TrendingDown size={10} strokeWidth={3} /> Mejor Precio
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            <Clock size={12} />
                                            {offer.delivery_days ? `${offer.delivery_days} días` : 'No especificado'}
                                        </div>
                                    </div>

                                    {/* Detalles Técnicos Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold">Costo Compra</span>
                                            <span className="font-medium text-gray-800">
                                                ${parseFloat(String(offer.cost)).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
                                                <span className="text-gray-400 text-xs font-normal"> / {offer.purchase_unit?.abbreviation}</span>
                                            </span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold">Empaque</span>
                                            <span className="font-medium text-gray-800 flex items-center gap-1">
                                                <Cuboid size={12} className="text-gray-400" />
                                                {parseFloat(String(offer.pack_quantity || 1)) === 1 ? 'Unidad' : `x${offer.pack_quantity}`}
                                            </span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold">Costo Base Norm.</span>
                                            <span className={`font-bold font-mono ${offer.id === bestOfferId ? 'text-green-600 underline decoration-green-300' : 'text-gray-600'}`}>
                                                ${parseFloat(String(offer.base_unit_cost || 0)).toLocaleString('es-CL', { minimumFractionDigits: 4 })}
                                            </span>
                                        </div>

                                        {offer.supplier_sku && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">SKU Prov.</span>
                                                <span className="font-mono text-xs text-gray-600 bg-white border px-1 rounded w-fit">
                                                    {offer.supplier_sku}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dimensiones Footer */}
                                    {(offer.purchase_width || offer.purchase_length) && (
                                        <div className="mt-2 text-xs flex items-center gap-2 text-gray-500">
                                            <span className="font-bold text-gray-400">Dims:</span>
                                            {offer.purchase_width && `${offer.purchase_width}m ancho`}
                                            {offer.purchase_height && ` × ${offer.purchase_height}m alto`}
                                            {offer.purchase_length && ` × ${offer.purchase_length}m largo`}
                                            {offer.total_area && <span className="text-gray-400 ml-1">({offer.total_area} m²)</span>}
                                        </div>
                                    )}

                                    {offer.notes && (
                                        <p className="mt-2 text-xs text-gray-500 italic flex items-start gap-1">
                                            <span className="text-gray-300">Note:</span> {offer.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Botones derecha */}
                                <div className="flex flex-col justify-between items-end border-l pl-3 border-gray-100">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => startEditing(offer)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(offer.id, offer.supplier?.name || 'Proveedor')}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>

                                    {offer.document_url && (
                                        <a
                                            href={offer.document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-600 p-1"
                                            title="Ver Documento"
                                        >
                                            <FileText size={16} /> {/* Ups, tengo que importar FileText o usar ExternalLink */}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
