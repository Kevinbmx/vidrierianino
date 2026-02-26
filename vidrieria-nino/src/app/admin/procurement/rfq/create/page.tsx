
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { procurementService } from '@/features/procurement/services';
import { ArrowLeft, Plus, Trash2, Search, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

// Hook para productos
const useProducts = () => useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/api/products')).data.data
});

export default function CreateRFQPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Estados del formulario
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [deadline, setDeadline] = useState('');
    const [comments, setComments] = useState('');

    // Queries
    const { data: products, isLoading: loadingProducts } = useProducts();

    // Filtros de búsqueda
    const [productSearch, setProductSearch] = useState('');

    const createMutation = useMutation({
        mutationFn: procurementService.createRFQ,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['quotation-requests'] });
            // Redirigir al detalle de la RFQ creada para proceder con la distribución
            // Asumimos que data.data tiene el objeto creado con su ID
            const newId = data.id || data.data?.id;
            if (newId) {
                router.push(`/admin/procurement/rfq/${newId}`);
            } else {
                router.push('/admin/procurement/rfq');
            }
        },
        onError: (error) => {
            console.error(error);
            alert('Error al crear la solicitud. Verifica los datos.');
        }
    });

    const handleAddProduct = (variant: any) => {
        if (selectedProducts.some(p => p.product_variant_id === variant.id)) return;

        setSelectedProducts([
            ...selectedProducts,
            {
                product_variant_id: variant.id,
                name: variant.name,
                sku: variant.sku,
                quantity: 1,
                unit_id: variant.sale_unit_id,
                notes: ''
            }
        ]);
        setProductSearch(''); // Limpiar búsqueda al seleccionar
    };

    const handleRemoveProduct = (index: number) => {
        const newProducts = [...selectedProducts];
        newProducts.splice(index, 1);
        setSelectedProducts(newProducts);
    };

    const handleUpdateQuantity = (index: number, qty: string) => {
        const newProducts = [...selectedProducts];
        newProducts[index].quantity = parseFloat(qty);
        setSelectedProducts(newProducts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProducts.length === 0) return alert('Selecciona al menos un producto');
        if (!deadline) return alert('Define una fecha límite');

        const payload = {
            deadline,
            comments,
            items: selectedProducts.map(p => ({
                product_variant_id: p.product_variant_id,
                quantity: p.quantity,
                unit_id: p.unit_id,
                notes: p.notes
            })),
            suppliers: [] // Array vacío explícito, ya que se asignarán en el paso de Distribución
        };

        createMutation.mutate(payload);
    };

    // Filtrar productos
    const filteredVariants = products?.flatMap((p: any) => p.variants || []).filter((v: any) =>
        v.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        v.sku.toLowerCase().includes(productSearch.toLowerCase())
    ) || [];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/procurement/rfq" className="text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud de Cotización (RFQ)</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Panel Unificado: Configuración + Búsqueda */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">

                    {/* Fila 1: Datos Generales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite *</label>
                            <input
                                type="date"
                                required
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios / Instrucciones</label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Notas internas o para proveedores..."
                                rows={1}
                            />
                        </div>
                    </div>

                    {/* Fila 2: Buscador */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Productos Requeridos</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar productos para añadir..."
                                className="w-full pl-10 pr-10 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                            {productSearch && (
                                <button
                                    type="button"
                                    onClick={() => setProductSearch('')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Resultados Dropdown */}
                        {productSearch && (
                            <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {loadingProducts ? (
                                    <div className="p-4 text-center text-gray-500">Cargando catálogo...</div>
                                ) : filteredVariants.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">No se encontraron productos.</div>
                                ) : (
                                    filteredVariants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            onClick={() => handleAddProduct(variant)}
                                            className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 flex justify-between items-center transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-800">{variant.name}</div>
                                                <div className="text-xs text-gray-500">{variant.sku}</div>
                                            </div>
                                            <Plus size={16} className="text-blue-600" />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabla de Items Agregados */}
                    {selectedProducts.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="p-3">Producto</th>
                                        <th className="p-3 w-32">Cantidad</th>
                                        <th className="p-3">Notas esp.</th>
                                        <th className="p-3 w-10 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedProducts.map((p, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="p-3">
                                                <span className="font-medium text-gray-900">{p.name}</span>
                                                <br />
                                                <span className="text-xs text-gray-500">{p.sku}</span>
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="any"
                                                    value={p.quantity}
                                                    onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                                                    className="w-full border border-gray-300 rounded p-1.5 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Marca específica..."
                                                    value={p.notes}
                                                    onChange={(e) => {
                                                        const newP = [...selectedProducts];
                                                        newP[index].notes = e.target.value;
                                                        setSelectedProducts(newP);
                                                    }}
                                                    className="w-full border border-gray-300 rounded p-1.5"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <Search size={48} className="mb-2 opacity-20" />
                            <p>Utiliza el buscador para añadir productos a la lista</p>
                        </div>
                    )}

                </div>

                {/* Footer de Acciones */}
                <div className="flex justify-end gap-3">
                    <Link
                        href="/admin/procurement/rfq"
                        className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={createMutation.isPending || selectedProducts.length === 0}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                        {createMutation.isPending ? 'Procesando...' : 'Crear Borrador RFQ'}
                    </button>
                </div>
            </form>
        </div>
    );
}
