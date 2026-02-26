'use client';

import { useState, useEffect } from 'react';
import { useProducts, useProduct } from '@/features/catalog/hooks';
import OfferManager from '@/features/catalog/components/OfferManager';
import { Search, Package, ChevronRight, Hash, DollarSign, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Product } from '@/features/catalog/types';

// Simple Debounce Hook Inline
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function OffersAdminPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

    // Queries
    const { data: productsData, isLoading: isLoadingList, isError } = useProducts({
        search: debouncedSearchTerm,
        page: 1  // Always page 1 for search results in this sidebar context
    });

    const { data: selectedProduct, isLoading: isLoadingDetail } = useProduct(selectedProductId!);

    // Reset variant selection when product changes
    useEffect(() => {
        setSelectedVariantId(null);
    }, [selectedProductId]);

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 mb-6 border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs text-slate-500 font-medium tracking-wide uppercase">
                        <span className="text-slate-400">Catálogo</span>
                        <span className="mx-2">/</span>
                        <span className="text-blue-600">Gestión de Ofertas</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Centro de Costos y Precios
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                                Gestiona las ofertas de tus proveedores para calcular automáticamente los costos y márgenes de ganancia.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Split View */}
            <div className="flex flex-1 gap-6 overflow-hidden">

                {/* LEFT SIDEBAR: Product List */}
                <aside className="w-80 lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoadingList ? (
                            <div className="space-y-3 p-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="p-8 text-center">
                                <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
                                <p className="text-sm text-red-600 font-medium">Error al cargar productos</p>
                            </div>
                        ) : productsData?.data.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <Package className="mb-3 opacity-20" size={48} />
                                <p className="text-sm">No se encontraron productos.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {productsData?.data.map((product: Product) => (
                                    <li key={product.id}>
                                        <button
                                            onClick={() => setSelectedProductId(product.id)}
                                            className={clsx(
                                                "w-full text-left p-4 hover:bg-slate-50 transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                                                selectedProductId === product.id
                                                    ? "bg-blue-50/60 border-l-4 border-blue-600"
                                                    : "border-l-4 border-transparent hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex-1 min-w-0 pr-3">
                                                <div className={clsx(
                                                    "font-semibold text-sm truncate transition-colors",
                                                    selectedProductId === product.id ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"
                                                )}>
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span className="truncate">{product.category?.name || 'Sin categoría'}</span>
                                                    {product.variants && (
                                                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                            {product.variants.length} var
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={clsx(
                                                "transition-transform duration-300",
                                                selectedProductId === product.id
                                                    ? "text-blue-600 translate-x-0"
                                                    : "text-slate-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                                            )} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </aside>

                {/* RIGHT PANEL: Product Detail */}
                <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
                    {!selectedProductId ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <Package size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">Selecciona un Producto</h3>
                            <p className="text-sm text-slate-500 max-w-xs text-center">
                                Elige un producto de la lista izquierda para gestionar sus variantes y ofertas de proveedores.
                            </p>
                        </div>
                    ) : isLoadingDetail ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-500">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium">Cargando detalles...</p>
                        </div>
                    ) : selectedProduct?.data ? (
                        <div className="flex flex-col h-full animate-in fade-in duration-300">
                            {/* Product Header */}
                            <div className="px-8 py-6 border-b border-gray-100 bg-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-bold text-slate-800">{selectedProduct.data.name}</h2>
                                            <span className={clsx(
                                                "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                                                selectedProduct.data.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {selectedProduct.data.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm">{selectedProduct.data.description || 'Sin descripción disponible.'}</p>
                                    </div>
                                    <div className="text-right hidden xl:block">
                                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Categoría</div>
                                        <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg inline-block">
                                            {selectedProduct.data.category?.name}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variants List (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                                {selectedProduct.data.variants?.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                        <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
                                        <h3 className="text-lg font-medium text-yellow-800">Sin Variantes Configuradas</h3>
                                        <p className="text-sm text-yellow-600 mt-1">Este producto no tiene variantes. Edita el producto para agregar variantes antes de asignar ofertas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-5xl mx-auto">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-slate-700">Variantes Disponibles</h3>
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {selectedProduct.data.variants?.length}
                                            </span>
                                        </div>

                                        {selectedProduct.data.variants?.map((variant) => {
                                            const isExpanded = selectedVariantId === variant.id;

                                            return (
                                                <div
                                                    key={variant.id}
                                                    className={clsx(
                                                        "bg-white rounded-xl border transition-all duration-300 overflow-hidden",
                                                        isExpanded
                                                            ? "shadow-lg border-blue-200 ring-1 ring-blue-100"
                                                            : "shadow-sm border-gray-200 hover:border-blue-300 hover:shadow-md"
                                                    )}
                                                >
                                                    {/* Variant Header (Clickable) */}
                                                    <div
                                                        onClick={() => setSelectedVariantId(isExpanded ? null : variant.id)}
                                                        className={clsx(
                                                            "p-5 cursor-pointer flex items-center justify-between transition-colors",
                                                            isExpanded ? "bg-white border-b border-gray-100" : "bg-white hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={clsx(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                                                isExpanded ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                                            )}>
                                                                <Hash size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-bold text-slate-800">{variant.name || 'Variante sin nombre'}</h4>
                                                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                        <span className="uppercase tracking-wider font-bold text-slate-400 text-[10px]">SKU</span>
                                                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{variant.sku}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-xs">
                                                                        <span className="uppercase tracking-wider font-bold text-slate-400 text-[10px]">Pricing</span>
                                                                        {variant.pricing_mode === 'markup' ? (
                                                                            <span className="flex items-center gap-1 text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                                Markup {variant.markup_percentage}%
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                                                                Fijo ${parseFloat(String(variant.price || 0)).toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            {!isExpanded && (
                                                                <span className="text-xs font-medium text-slate-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    Click para gestionar ofertas
                                                                </span>
                                                            )}
                                                            <div className={clsx(
                                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                                                isExpanded ? "bg-blue-50 text-blue-600 rotate-90" : "bg-slate-50 text-slate-400 rotate-0"
                                                            )}>
                                                                <ChevronRight size={18} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Variant Details (Expanded) */}
                                                    {isExpanded && (
                                                        <div className="p-6 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="mb-4 flex items-center justify-between">
                                                                <h5 className="text-sm uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
                                                                    <DollarSign size={14} />
                                                                    Gestión de Costos y Proveedores
                                                                </h5>
                                                                {variant.final_price && (
                                                                    <div className="text-sm bg-white border border-green-200 text-green-700 px-3 py-1 rounded shadow-sm">
                                                                        Precio Final Calculado: <span className="font-bold">${parseFloat(String(variant.final_price)).toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <OfferManager
                                                                variantId={variant.id}
                                                                variantName={variant.name || variant.sku || 'Variante'}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    );
}
