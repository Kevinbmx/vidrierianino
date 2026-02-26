'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useProducts, useCategories } from '../hooks';
import { Product, ProductVariant, InventoryBatch } from '../types';
import {
    Search, Filter, AlertTriangle, ChevronDown, ChevronRight,
    Package, Layers, DollarSign, TrendingDown, Box, CheckCircle,
    Clock, XCircle, AlertCircle, RefreshCw, Pencil, Ruler
} from 'lucide-react';

// =============================================================================
// Tipos y utilidades de unidad de dimensión
// =============================================================================

type DimUnit = 'mm' | 'cm' | 'm';

const DIM_UNIT_OPTIONS: { value: DimUnit; label: string; factor: number }[] = [
    { value: 'mm', label: 'Milímetros (mm)', factor: 1 },
    { value: 'cm', label: 'Centímetros (cm)', factor: 0.1 },
    { value: 'm', label: 'Metros (m)', factor: 0.001 },
];

/** Convierte un valor en mm a la unidad elegida, formateado como string. */
function fmtDim(valueMm: number | null | undefined, unit: DimUnit): string {
    if (valueMm == null || isNaN(Number(valueMm))) return '—';
    const opt = DIM_UNIT_OPTIONS.find(o => o.value === unit)!;
    const converted = Number(valueMm) * opt.factor;
    // mm y cm: sin decimales si es entero; m: hasta 3 decimales
    const decimals = unit === 'm' ? 3 : unit === 'cm' ? 1 : 0;
    return `${converted.toFixed(decimals).replace(/\.?0+$/, '')} ${unit}`;
}

/** Genera el label de dimensiones de un lote (width×height o length). */
function batchDimensionLabel(dims: Record<string, any> | null | undefined, unit: DimUnit): string {
    if (!dims) return 'Sin dimensiones';
    if (dims.width != null && dims.height != null) {
        return `${fmtDim(dims.width, unit)} × ${fmtDim(dims.height, unit)}`;
    }
    if (dims.length != null) {
        return `↔ ${fmtDim(dims.length, unit)}`;
    }
    return 'Sin dimensiones';
}

/** Hook que guarda la preferencia de unidad en localStorage. */
function useDimUnit(): [DimUnit, (u: DimUnit) => void] {
    const [unit, setUnit] = useState<DimUnit>('mm');

    useEffect(() => {
        const saved = localStorage.getItem('inv_dim_unit') as DimUnit | null;
        if (saved && ['mm', 'cm', 'm'].includes(saved)) setUnit(saved);
    }, []);

    const setAndSave = useCallback((u: DimUnit) => {
        setUnit(u);
        localStorage.setItem('inv_dim_unit', u);
    }, []);

    return [unit, setAndSave];
}

// =============================================================================
// Helpers
// =============================================================================

/** Formatea un número como moneda local sin símbolo (para la UI). */
function fmtCurrency(value: number | string | undefined): string {
    const n = parseFloat(String(value ?? 0));
    if (isNaN(n)) return '—';
    return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formatea un número con 4 decimales máximo (para stock abstracto). */
function fmtStock(value: number | string | undefined): string {
    const n = parseFloat(String(value ?? 0));
    if (isNaN(n)) return '—';
    // Hasta 4 decimales, sin ceros de relleno innecesarios
    return n % 1 === 0 ? n.toString() : n.toFixed(4).replace(/\.?0+$/, '');
}

/** Devuelve el color del semáforo y texto del estado de stock. */
function stockStatus(variant: ProductVariant): { color: string; label: string; icon: React.ReactNode } {
    const current = parseFloat(String(variant.total_abstract_stock ?? 0));
    const min = parseFloat(String(variant.min_stock ?? 0));

    if (current <= 0) return {
        color: 'bg-red-100 text-red-700 border-red-200',
        label: 'Sin Stock',
        icon: <XCircle size={12} />
    };
    if (current < min) return {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        label: 'Stock Bajo',
        icon: <AlertTriangle size={12} />
    };
    return {
        color: 'bg-green-100 text-green-700 border-green-200',
        label: 'OK',
        icon: <CheckCircle size={12} />
    };
}

/** Mapea el status de un lote a etiqueta y color. */
const BATCH_STATUS_MAP: Record<string, { label: string; color: string }> = {
    available: { label: 'Disponible', color: 'bg-green-100 text-green-700' },
    reserved: { label: 'Reservado', color: 'bg-blue-100 text-blue-700' },
    consumed: { label: 'Consumido', color: 'bg-gray-100 text-gray-500' },
    quarantine: { label: 'Cuarentena', color: 'bg-red-100 text-red-700' },
};

// =============================================================================
// Sub-componente: Fila de Lote (Nivel 2)
// =============================================================================

/** Muestra una fila individual de lote de inventario dentro de la sub-tabla. */
function BatchRow({ batch, dimUnit }: { batch: InventoryBatch; dimUnit: DimUnit }) {
    const statusInfo = BATCH_STATUS_MAP[batch.status] ?? { label: batch.status, color: 'bg-gray-100 text-gray-600' };
    // Calcular label de dimensiones en tiempo real usando la unidad elegida
    const dimLabel = batchDimensionLabel(
        typeof batch.dimensions === 'string' ? JSON.parse(batch.dimensions) : batch.dimensions,
        dimUnit
    );

    return (
        <tr className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-100/70 transition-colors text-xs">
            <td className="py-2 pl-14 pr-3">
                <span className="font-mono text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    {batch.batch_code || '—'}
                </span>
            </td>
            <td className="py-2 px-3 text-slate-600">
                {dimLabel}
            </td>
            <td className="py-2 px-3 text-slate-700 font-semibold text-center">
                {fmtStock(batch.physical_quantity)}
            </td>
            <td className="py-2 px-3 text-slate-500">
                {batch.location || <span className="italic text-slate-400">Sin ubicación</span>}
            </td>
            <td className="py-2 px-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
            </td>
        </tr>
    );
}

// =============================================================================
// Sub-componente: Fila de Variante (Nivel 1) con sub-tabla expandible
// =============================================================================

/**
 * Muestra la fila principal de una variante con:
 * - SKU, Nombre, Costo, Precio, Valorización y Stock abstracto
 * - Semáforo de salud (verde/naranja/rojo)
 * - Al hacer clic expande la sub-tabla de lotes
 */
function VariantRow({ variant, unitAbbr, productId, dimUnit }: {
    variant: ProductVariant;
    unitAbbr: string;
    productId: number;  // ID del producto padre (para el link de edición)
    dimUnit: DimUnit;   // Unidad de visualización de dimensiones
}) {
    const [expanded, setExpanded] = useState(false);
    const status = stockStatus(variant);
    const batches = variant.inventory_batches ?? [];
    const hasBatches = batches.length > 0;

    const bestCost = useMemo(() => {
        if (!variant.supplier_offers?.length) return null;
        return variant.supplier_offers
            .filter(o => o.is_active)
            .sort((a, b) => parseFloat(String(a.base_unit_cost)) - parseFloat(String(b.base_unit_cost)))[0];
    }, [variant.supplier_offers]);

    return (
        <>
            <tr
                className={`border-b border-slate-100 transition-colors ${hasBatches ? 'cursor-pointer hover:bg-blue-50/30' : ''} ${expanded ? 'bg-blue-50/20' : 'bg-white'}`}
                onClick={() => hasBatches && setExpanded(!expanded)}
            >
                {/* Expand toggle */}
                <td className="py-3 pl-4 pr-2 w-8">
                    {hasBatches ? (
                        expanded
                            ? <ChevronDown size={16} className="text-blue-500" />
                            : <ChevronRight size={16} className="text-slate-400" />
                    ) : (
                        <span className="w-4 inline-block" />
                    )}
                </td>

                {/* SKU */}
                <td className="py-3 px-3">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {variant.sku || '—'}
                    </span>
                </td>

                {/* Nombre */}
                <td className="py-3 px-3">
                    <span className="text-sm font-medium text-slate-800">
                        {variant.name || <span className="italic text-slate-400">Sin nombre</span>}
                    </span>
                </td>

                {/* Mejor Costo */}
                <td className="py-3 px-3 text-right">
                    {bestCost ? (
                        <span className="text-sm text-slate-600">
                            ${fmtCurrency(bestCost.base_unit_cost)}
                            <span className="text-xs text-slate-400 ml-1">/{unitAbbr}</span>
                        </span>
                    ) : (
                        <span className="text-xs text-slate-400 italic">Sin oferta</span>
                    )}
                </td>

                {/* Precio Venta */}
                <td className="py-3 px-3 text-right">
                    <span className="text-sm font-semibold text-slate-800">
                        ${fmtCurrency(variant.final_price)}
                        <span className="text-xs text-slate-400 font-normal ml-1">/{unitAbbr}</span>
                    </span>
                    {variant.pricing_mode === 'markup' && (
                        <div className="text-[10px] text-blue-500">+{variant.markup_percentage}%</div>
                    )}
                </td>

                {/* Valorización */}
                <td className="py-3 px-3 text-right">
                    <span className="text-sm font-bold text-emerald-700">
                        ${fmtCurrency(variant.inventory_valuation)}
                    </span>
                </td>

                {/* Stock Total */}
                <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-base font-bold text-slate-800">
                            {fmtStock(variant.total_abstract_stock)}
                            <span className="text-xs text-slate-400 font-normal ml-1">{unitAbbr}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                            mín: {variant.min_stock} {unitAbbr}
                        </span>
                    </div>
                </td>

                {/* Semáforo */}
                <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                        {status.icon}
                        {status.label}
                    </span>
                </td>

                {/* Acción editar — usa productId (no variant.id) porque
                    el endpoint del backend es PUT /api/products/{productId} */}
                <td className="py-3 px-2">
                    <Link
                        href={`/admin/catalog/edit/${productId}`}
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex"
                        title="Editar producto"
                    >
                        <Pencil size={14} />
                    </Link>
                </td>
            </tr>

            {/* Sub-tabla de lotes (Nivel 2) */}
            {expanded && hasBatches && (
                <>
                    {/* Encabezado de la sub-tabla */}
                    <tr className="bg-slate-100/80">
                        <th className="py-1.5 pl-14 pr-3 text-left text-[10px] font-bold text-slate-500 uppercase">Lote</th>
                        <th className="py-1.5 px-3 text-left text-[10px] font-bold text-slate-500 uppercase">Dimensiones</th>
                        <th className="py-1.5 px-3 text-center text-[10px] font-bold text-slate-500 uppercase">Cantidad</th>
                        <th className="py-1.5 px-3 text-left text-[10px] font-bold text-slate-500 uppercase">Ubicación</th>
                        <th className="py-1.5 px-3 text-left text-[10px] font-bold text-slate-500 uppercase">Estado</th>
                    </tr>
                    {batches.map(batch => (
                        <BatchRow key={batch.id} batch={batch} dimUnit={dimUnit} />
                    ))}
                    {/* Total del lote */}
                    <tr className="bg-blue-50/40 border-b border-blue-100">
                        <td colSpan={2} className="py-1.5 pl-14 text-xs text-blue-700 font-bold">
                            Total ({batches.length} lotes)
                        </td>
                        <td className="py-1.5 px-3 text-center text-xs font-bold text-blue-700">
                            {batches.reduce((acc, b) => acc + parseFloat(String(b.physical_quantity ?? 0)), 0).toFixed(2)} pzas
                        </td>
                        <td colSpan={2} />
                    </tr>
                </>
            )}
            {expanded && !hasBatches && (
                <tr className="bg-slate-50/50">
                    <td colSpan={9} className="py-3 pl-14 text-xs text-slate-400 italic">
                        No hay lotes de inventario registrados para esta variante.
                    </td>
                </tr>
            )}
        </>
    );
}

// =============================================================================
// Sub-componente: Fila de Producto (contiene sus variantes)
// =============================================================================

/**
 * Muestra un grupo de filas por producto (una por variante).
 * La primera fila incluye el nombre del producto y la categoría en modo colapsable.
 */
function ProductGroup({ product, dimUnit }: { product: Product; dimUnit: DimUnit }) {
    const [collapsed, setCollapsed] = useState(false);
    const variants = product.variants ?? [];
    if (variants.length === 0) return null;

    // Calcular totales del producto (suma de todas las variantes)
    const totalValuation = variants.reduce(
        (acc, v) => acc + parseFloat(String(v.inventory_valuation ?? 0)), 0
    );
    const hasLowStock = variants.some(v => v.is_low_stock);

    return (
        <>
            {/* Fila de grupo (nombre del producto) */}
            <tr
                className="bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
            >
                <td colSpan={8} className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        {collapsed
                            ? <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                            : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                        }
                        <Package size={15} className="text-blue-500 flex-shrink-0" />
                        <span className="font-bold text-sm text-slate-800">{product.name}</span>
                        {product.category && (
                            <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                                {product.category.name}
                            </span>
                        )}
                        <span className="text-xs text-slate-400 ml-1">
                            ({variants.length} variante{variants.length !== 1 ? 's' : ''})
                        </span>
                        {hasLowStock && (
                            <span className="text-[10px] text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <AlertTriangle size={10} /> Stock Bajo
                            </span>
                        )}
                    </div>
                </td>
                <td className="py-2.5 px-4 text-right">
                    <span className="text-xs font-bold text-emerald-700">
                        ${fmtCurrency(totalValuation)}
                    </span>
                </td>
            </tr>

            {/* Variantes del producto */}
            {!collapsed && variants.map(variant => (
                <VariantRow
                    key={variant.id}
                    variant={variant}
                    productId={product.id}  // ← pasar el ID del producto, no de la variante
                    dimUnit={dimUnit}
                    unitAbbr={variant.sale_unit_abbr ?? variant.sale_unit?.abbreviation ?? 'u'}
                />
            ))}
        </>
    );
}

// =============================================================================
// Componente Principal: InventoryTable
// =============================================================================

/**
 * Dashboard de inventario con tabla jerárquica Master-Detail.
 *
 * Nivel 1: Producto (nombre, categoría, valorización total)
 * Nivel 2: Variante (SKU, costo, precio, stock abstracto, semáforo)
 * Nivel 3: Lotes (código, dimensiones físicas, cantidad, ubicación, estado)
 *
 * Incluye filtros por categoría, búsqueda por nombre/SKU, y toggle de stock bajo.
 */
export default function InventoryTable() {
    // Filtros locales
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>();
    const [onlyLowStock, setOnlyLowStock] = useState(false);

    // 📐 Preferencia de unidad de dimensión (persiste en localStorage)
    const [dimUnit, setDimUnit] = useDimUnit();

    // Debounce simple para búsqueda (300ms)
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const handleSearchChange = useCallback((val: string) => {
        setSearch(val);
        const t = setTimeout(() => setDebouncedSearch(val), 300);
        return () => clearTimeout(t);
    }, []);

    const { data: productsData, isLoading, isError, refetch } = useProducts({
        search: debouncedSearch || undefined,
        category_id: categoryId,
    });

    const { data: categoriesData } = useCategories();

    // Filtro opcional de stock bajo aplicado en frontend
    const filteredProducts = useMemo(() => {
        let products = productsData?.data ?? [];
        if (onlyLowStock) {
            products = products.filter(p =>
                p.variants?.some(v => v.is_low_stock)
            );
        }
        return products;
    }, [productsData, onlyLowStock]);

    // KPIs del dashboard
    const kpis = useMemo(() => {
        const allVariants = filteredProducts.flatMap(p => p.variants ?? []);
        return {
            totalProducts: filteredProducts.length,
            totalVariants: allVariants.length,
            lowStockCount: allVariants.filter(v => v.is_low_stock).length,
            totalValuation: allVariants.reduce(
                (acc, v) => acc + parseFloat(String(v.inventory_valuation ?? 0)), 0
            ),
        };
    }, [filteredProducts]);

    return (
        <div className="space-y-4">

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                    icon={<Package className="text-blue-500" size={20} />}
                    label="Productos"
                    value={kpis.totalProducts}
                    bg="bg-blue-50"
                />
                <KpiCard
                    icon={<Layers className="text-violet-500" size={20} />}
                    label="Variantes"
                    value={kpis.totalVariants}
                    bg="bg-violet-50"
                />
                <KpiCard
                    icon={<AlertTriangle className="text-orange-500" size={20} />}
                    label="Stock Bajo"
                    value={kpis.lowStockCount}
                    bg="bg-orange-50"
                    alert={kpis.lowStockCount > 0}
                />
                <KpiCard
                    icon={<DollarSign className="text-emerald-500" size={20} />}
                    label="Valorización"
                    value={`$${fmtCurrency(kpis.totalValuation)}`}
                    bg="bg-emerald-50"
                />
            </div>

            {/* ── Barra de Filtros ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">

                    {/* Búsqueda */}
                    <div className="relative flex-1 w-full md:max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, SKU..."
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Filtro Categoría */}
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={categoryId ?? ''}
                            onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                            className="pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white appearance-none"
                        >
                            <option value="">Todas las categorías</option>
                            {categoriesData?.data?.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Toggle Stock Bajo */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                            onClick={() => setOnlyLowStock(!onlyLowStock)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${onlyLowStock ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${onlyLowStock ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Solo Stock Bajo</span>
                        {onlyLowStock && (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {kpis.lowStockCount}
                            </span>
                        )}
                    </label>

                    {/* 📐 Selector de Unidad de Dimensión */}
                    <div className="relative flex items-center gap-1.5 ml-auto">
                        <Ruler size={14} className="text-gray-400 flex-shrink-0" />
                        <select
                            value={dimUnit}
                            onChange={e => setDimUnit(e.target.value as DimUnit)}
                            className="text-sm border border-gray-300 rounded-lg py-2 pl-2 pr-8 focus:ring-2 focus:ring-blue-400 outline-none bg-white appearance-none cursor-pointer"
                            title="Unidad de visualización de dimensiones"
                        >
                            {DIM_UNIT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Refrescar */}
                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refrescar inventario"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* ── Tabla Master-Detail ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {isLoading && (
                    <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                        <RefreshCw size={20} className="animate-spin" />
                        <span className="text-sm">Cargando inventario...</span>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-500">
                        <AlertCircle size={28} />
                        <p className="text-sm font-medium">Error al cargar el inventario</p>
                        <button onClick={() => refetch()} className="text-xs text-blue-600 underline">Reintentar</button>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                    <th className="py-3 pl-4 pr-2 w-8" />
                                    <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-wide">SKU</th>
                                    <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-wide">Nombre</th>
                                    <th className="py-3 px-3 text-right text-xs font-bold uppercase tracking-wide">Costo Prom.</th>
                                    <th className="py-3 px-3 text-right text-xs font-bold uppercase tracking-wide">Precio Venta</th>
                                    <th className="py-3 px-3 text-right text-xs font-bold uppercase tracking-wide">Valorización</th>
                                    <th className="py-3 px-3 text-right text-xs font-bold uppercase tracking-wide">Stock Total</th>
                                    <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-wide">Estado</th>
                                    <th className="py-3 px-2 text-left text-xs font-bold uppercase tracking-wide"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center text-gray-400">
                                            <Box size={40} className="mx-auto mb-3 opacity-40" />
                                            <p className="text-sm">No se encontraron productos.</p>
                                            {(search || categoryId || onlyLowStock) && (
                                                <button
                                                    onClick={() => { setSearch(''); setCategoryId(undefined); setOnlyLowStock(false); }}
                                                    className="mt-2 text-xs text-blue-600 underline"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(product => (
                                        <ProductGroup key={product.id} product={product} dimUnit={dimUnit} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginación */}
                {productsData?.meta && productsData.meta.last_page > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                        <span>
                            Mostrando {productsData.meta.from} – {productsData.meta.to} de {productsData.meta.total} resultados
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// KPI Card (helper visual)
// =============================================================================
function KpiCard({ icon, label, value, bg, alert }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    bg: string;
    alert?: boolean;
}) {
    return (
        <div className={`${bg} rounded-xl border ${alert ? 'border-orange-300' : 'border-transparent'} p-4 flex items-center gap-3 shadow-sm`}>
            <div className="flex-shrink-0">{icon}</div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-lg font-bold ${alert ? 'text-orange-700' : 'text-gray-800'}`}>{value}</p>
            </div>
        </div>
    );
}
