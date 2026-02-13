'use client';

import { useState } from 'react';
import { useVariantOffers, useCreateOffer, useUpdateOffer, useDeleteOffer, useMarkOfferPreferred, useSuppliers, useUnitsOfMeasure } from '../hooks';
import { SupplierProductOffer, UnitOfMeasure } from '../types';
import { DollarSign, Plus, Edit, Trash, Save, X, Star, TrendingDown, Package } from 'lucide-react';
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

    // Form state
    const [formData, setFormData] = useState({
        supplier_id: 0,
        cost: '',
        purchase_unit_id: 0,
        purchase_width: '',
        purchase_height: '',
        purchase_length: '',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            supplier_id: 0,
            cost: '',
            purchase_unit_id: 0,
            purchase_width: '',
            purchase_height: '',
            purchase_length: '',
            notes: ''
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
                    cost: parseFloat(formData.cost),
                    purchase_unit_id: formData.purchase_unit_id,
                    purchase_width: formData.purchase_width ? parseFloat(formData.purchase_width) : undefined,
                    purchase_height: formData.purchase_height ? parseFloat(formData.purchase_height) : undefined,
                    purchase_length: formData.purchase_length ? parseFloat(formData.purchase_length) : undefined,
                    notes: formData.notes
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
                    cost: parseFloat(formData.cost),
                    purchase_unit_id: formData.purchase_unit_id,
                    purchase_width: formData.purchase_width ? parseFloat(formData.purchase_width) : undefined,
                    purchase_height: formData.purchase_height ? parseFloat(formData.purchase_height) : undefined,
                    purchase_length: formData.purchase_length ? parseFloat(formData.purchase_length) : undefined,
                    notes: formData.notes
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
            cost: String(offer.cost),
            purchase_unit_id: offer.purchase_unit_id,
            purchase_width: offer.purchase_width ? String(offer.purchase_width) : '',
            purchase_height: offer.purchase_height ? String(offer.purchase_height) : '',
            purchase_length: offer.purchase_length ? String(offer.purchase_length) : '',
            notes: offer.notes || ''
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
        parseFloat(String(a.base_unit_cost)) - parseFloat(String(b.base_unit_cost))
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

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Costo de Compra *</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        className="w-full pl-6 px-3 py-2 border rounded-md text-sm"
                                        placeholder="15000.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad de Compra *</label>
                                <select
                                    value={formData.purchase_unit_id}
                                    onChange={(e) => setFormData({ ...formData, purchase_unit_id: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value={0}>Seleccionar...</option>
                                    {units?.data.map((u: UnitOfMeasure) => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dimensiones dinámicas */}
                            {isArea && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ancho (metros)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={formData.purchase_width}
                                            onChange={(e) => setFormData({ ...formData, purchase_width: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="2.14"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Alto (metros)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={formData.purchase_height}
                                            onChange={(e) => setFormData({ ...formData, purchase_height: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="3.30"
                                        />
                                    </div>
                                </>
                            )}

                            {isLength && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Longitud (metros)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={formData.purchase_length}
                                        onChange={(e) => setFormData({ ...formData, purchase_length: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                        placeholder="6.00"
                                    />
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                    placeholder="Ej: Entrega en 3 días, requiere mínimo 10 unidades"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => isCreating ? handleCreate() : handleUpdate(editingId!)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                                <Save size={14} /> {isCreating ? 'Crear' : 'Guardar'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                            >
                                <X size={14} /> Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Offers List */}
                <div className="space-y-2">
                    {offers?.data.length === 0 && (
                        <p className="text-center text-gray-500 py-6 text-sm">
                            No hay ofertas registradas. Agrega la primera oferta para comparar precios.
                        </p>
                    )}

                    {sortedOffers.map(offer => (
                        <div
                            key={offer.id}
                            className={`p-3 border rounded-lg transition-all ${offer.id === bestOfferId
                                    ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-sm text-gray-800">
                                            {offer.supplier?.name || `Proveedor #${offer.supplier_id}`}
                                        </h4>
                                        {offer.id === bestOfferId && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                                <TrendingDown size={12} /> Mejor Precio
                                            </span>
                                        )}
                                        {offer.is_preferred && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">
                                                <Star size={12} fill="currentColor" /> Preferido
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                                        <div>
                                            <span className="font-medium">Costo: </span>
                                            ${parseFloat(String(offer.cost)).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div>
                                            <span className="font-medium">Unidad: </span>
                                            {offer.purchase_unit?.abbreviation || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Costo Base: </span>
                                            <span className="text-green-700 font-semibold">
                                                ${parseFloat(String(offer.base_unit_cost)).toLocaleString('es-CL', { minimumFractionDigits: 4 })}
                                            </span>
                                        </div>
                                        {offer.total_area && (
                                            <div>
                                                <span className="font-medium">Área: </span>
                                                {offer.total_area} m²
                                            </div>
                                        )}
                                    </div>

                                    {(offer.purchase_width || offer.purchase_height || offer.purchase_length) && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            Dimensiones: {offer.purchase_width && `${offer.purchase_width}m ancho`}
                                            {offer.purchase_height && ` × ${offer.purchase_height}m alto`}
                                            {offer.purchase_length && ` × ${offer.purchase_length}m largo`}
                                        </div>
                                    )}

                                    {offer.notes && (
                                        <p className="mt-1 text-xs text-gray-500 italic">{offer.notes}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 ml-2">
                                    {!offer.is_preferred && (
                                        <button
                                            onClick={() => handleMarkPreferred(offer.id)}
                                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                                            title="Marcar como preferido"
                                        >
                                            <Star size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEditing(offer)}
                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer.id, offer.supplier?.name || 'Proveedor')}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
