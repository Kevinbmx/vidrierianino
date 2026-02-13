'use client';

import { useState } from 'react';
import { useProducts } from '../hooks';
import { Search, ChevronRight, AlertTriangle, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { Product, ProductVariant } from '../types';

export default function ProductList() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: response, isLoading } = useProducts({ search: searchTerm });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando inventario...</div>;
    }

    const products = response?.data || [];

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="search"
                        placeholder="Buscar por nombre, SKU o descripción..."
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Mostrando <strong>{products.length}</strong> productos
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-200">
                {products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No se encontraron productos.</p>
                    </div>
                ) : (
                    products.map(product => (
                        <ProductRow key={product.id} product={product} />
                    ))
                )}
            </div>

            {/* Pagination (Simple for now) */}
            <div className="p-3 bg-gray-50 border-t text-xs text-gray-400 text-center">
                Página {response?.meta?.current_page} de {response?.meta?.last_page}
            </div>
        </div>
    );
}

function ProductRow({ product }: { product: Product }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="group">
            {/* Header del Producto */}
            <div
                className={clsx(
                    "p-4 flex items-center gap-4 cursor-pointer hover:bg-blue-50 transition-colors",
                    expanded && "bg-blue-50/50"
                )}
                onClick={() => setExpanded(!expanded)}
            >
                <div className={clsx("transition-transform duration-200 text-gray-400", expanded && "rotate-90")}>
                    <ChevronRight size={20} />
                </div>

                <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category?.name} • {product.variants?.length} Variantes</p>
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase font-semibold">Stock Total</div>
                    <div className={clsx(
                        "font-bold",
                        !product.has_stock ? "text-red-500" : "text-green-600"
                    )}>
                        {product.variants?.reduce((acc, v) => acc + v.stock_quantity, 0)} un
                    </div>
                </div>
            </div>

            {/* Variantes Expandidas */}
            {expanded && (
                <div className="bg-gray-50 px-4 pb-4 pl-12">
                    <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                                <tr>
                                    <th className="px-4 py-2">SKU / Nombre</th>
                                    <th className="px-4 py-2">Dimensiones</th>
                                    <th className="px-4 py-2">Stock</th>
                                    <th className="px-4 py-2">Costo Base (Calc)</th>
                                    <th className="px-4 py-2">Precio Venta</th>
                                    <th className="px-4 py-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {product.variants?.map((variant) => (
                                    <VariantRow key={variant.id} variant={variant} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function VariantRow({ variant }: { variant: ProductVariant }) {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{variant.sku}</div>
                <div className="text-xs text-gray-500">{variant.name}</div>
            </td>
            <td className="px-4 py-3 text-gray-600">
                {formatDimensions(variant)}
                <div className="text-xs text-gray-400 mt-0.5">
                    Compra: {variant.purchase_unit?.abbreviation} → Venta: {variant.sale_unit?.abbreviation}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className={clsx(
                        "font-bold",
                        variant.stock_quantity === 0 ? "text-red-500" :
                            variant.is_low_stock ? "text-orange-500" : "text-green-600"
                    )}>
                        {variant.stock_quantity}
                    </span>
                    {variant.is_low_stock && (
                        <span title="Stock bajo">
                            <AlertTriangle size={14} className="text-orange-500" />
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="text-blue-700 font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                    ${Number(variant.base_unit_cost).toFixed(2)} / {variant.sale_unit?.abbreviation}
                </span>
                <div className="text-xs text-gray-400 mt-0.5">
                    Costo real
                </div>
            </td>
            <td className="px-4 py-3 font-medium text-gray-800">
                ${Number(variant.price).toFixed(2)}
            </td>
            <td className="px-4 py-3">
                <span className={clsx(
                    "px-2 py-0.5 rounded-full text-xs",
                    variant.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                )}>
                    {variant.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
        </tr>
    );
}

function formatDimensions(v: ProductVariant) {
    if (v.dimensions?.width && v.dimensions?.height) {
        return `${Number(v.dimensions.width).toFixed(2)}m × ${Number(v.dimensions.height).toFixed(2)}m (${Number(v.dimensions.total_area).toFixed(2)} m²)`;
    }
    if (v.dimensions?.length) {
        return `Largo: ${Number(v.dimensions.length).toFixed(2)}m`;
    }
    return '-';
}
