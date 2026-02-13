'use client';

import { useState } from 'react';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks';
import { Supplier } from '../types';
import { Building2, Plus, Edit, Trash, Save, X, Mail, Phone, MapPin } from 'lucide-react';
import { useIsMutating } from '@tanstack/react-query';

export default function SupplierManager() {
    const { data: suppliers, isLoading, error } = useSuppliers(false); // Traer todos
    const createMutation = useCreateSupplier();
    const updateMutation = useUpdateSupplier();
    const deleteMutation = useDeleteSupplier();
    const isMutating = useIsMutating();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            contact_name: '',
            email: '',
            phone: '',
            address: '',
            notes: ''
        });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) return;
        try {
            await createMutation.mutateAsync(formData);
            resetForm();
        } catch (e) {
            console.error('Error creating supplier', e);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await updateMutation.mutateAsync({ id, data: formData });
            resetForm();
        } catch (e) {
            console.error('Error updating supplier', e);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`¿Eliminar proveedor "${name}"? Se eliminarán también sus ofertas.`)) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (e) {
                console.error('Error deleting supplier', e);
            }
        }
    };

    const startEditing = (supplier: Supplier) => {
        setFormData({
            name: supplier.name,
            contact_name: supplier.contact_name || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            notes: supplier.notes || ''
        });
        setEditingId(supplier.id);
        setIsCreating(false);
    };

    if (isLoading) return <div className="p-4">Cargando proveedores...</div>;
    if (error) return <div className="p-4 text-red-600">Error al cargar proveedores</div>;

    return (
        <div className="relative p-6 bg-white shadow rounded-lg max-w-5xl mx-auto">
            {/* Blocking Overlay for Mutations */}
            {isMutating > 0 && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-blue-700">Procesando...</span>
                    </div>
                </div>
            )}

            <div className={`transition-opacity ${isMutating > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Building2 className="text-blue-600" size={28} />
                            Gestión de Proveedores
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Administra los proveedores de materiales y productos</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsCreating(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                        <Plus size={18} /> Nuevo Proveedor
                    </button>
                </div>

                {/* Create/Edit Form */}
                {(isCreating || editingId !== null) && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top-2 duration-200">
                        <h3 className="font-semibold text-blue-900 mb-3">
                            {isCreating ? 'Nuevo Proveedor' : 'Editar Proveedor'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Vidrios La Estrella S.A."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
                                <input
                                    type="text"
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="contacto@proveedor.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+56 9 1234 5678"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Calle, número, comuna"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Horarios de atención, condiciones especiales, etc."
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => isCreating ? handleCreate() : handleUpdate(editingId!)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                            >
                                <Save size={16} /> {isCreating ? 'Crear' : 'Guardar'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                            >
                                <X size={16} /> Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Suppliers List */}
                <div className="space-y-3">
                    {suppliers?.data.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No hay proveedores registrados.</p>
                    )}

                    {suppliers?.data.map(supplier => (
                        <div
                            key={supplier.id}
                            className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${!supplier.is_active ? 'opacity-50 bg-gray-100' : 'bg-white'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg text-gray-800">{supplier.name}</h3>
                                        {!supplier.is_active && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                Inactivo
                                            </span>
                                        )}
                                        {supplier.offers_count !== undefined && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                {supplier.offers_count} ofertas
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                        {supplier.contact_name && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Contacto:</span> {supplier.contact_name}
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                {supplier.email}
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" />
                                                {supplier.phone}
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-400" />
                                                {supplier.address}
                                            </div>
                                        )}
                                    </div>

                                    {supplier.notes && (
                                        <p className="mt-2 text-sm text-gray-500 italic">{supplier.notes}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => startEditing(supplier)}
                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier.id, supplier.name)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash size={18} />
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
