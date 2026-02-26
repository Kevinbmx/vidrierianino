'use client';

import Link from 'next/link';
import {
    Building2, Plus, Mail, Phone, MapPin, Package,
    CheckCircle, XCircle, Search, RefreshCw, ChevronRight
} from 'lucide-react';
import { useSuppliers } from '@/features/catalog/hooks';
import { Supplier } from '@/features/catalog/types';
import { useState, useMemo } from 'react';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function SupplierAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('');
    const hue = (name.charCodeAt(0) * 37) % 360;
    return (
        <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
            style={{ background: `hsl(${hue},55%,48%)` }}
        >
            {initials}
        </div>
    );
}

// ──────────────────────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────────────────────

export default function SuppliersPage() {
    const { data, isLoading, isError, refetch } = useSuppliers(false);
    const [search, setSearch] = useState('');

    const suppliers: Supplier[] = data?.data ?? [];

    const filtered = useMemo(() => {
        if (!search.trim()) return suppliers;
        const q = search.toLowerCase();
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.primary_contact?.email?.toLowerCase().includes(q) ||
            s.primary_contact?.phone?.includes(q) ||
            s.rif?.toLowerCase().includes(q)
        );
    }, [suppliers, search]);

    const activeCount = suppliers.filter(s => s.is_active).length;
    const inactiveCount = suppliers.length - activeCount;

    return (
        <div className="space-y-6">

            {/* ── Encabezado ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <a href="/admin" className="hover:text-blue-500 transition-colors">Admin</a>
                        <ChevronRight size={14} />
                        <span className="text-gray-700 font-medium">Proveedores</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 size={24} className="text-blue-600" />
                        Proveedores
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Administra tu red de proveedores y sus productos
                    </p>
                </div>
                <Link
                    href="/admin/suppliers/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                >
                    <Plus size={16} />
                    Nuevo Proveedor
                </Link>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xl font-bold text-gray-800">{suppliers.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                        <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Activos</p>
                        <p className="text-xl font-bold text-gray-800">{activeCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                        <XCircle size={18} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Inactivos</p>
                        <p className="text-xl font-bold text-gray-800">{inactiveCount}</p>
                    </div>
                </div>
            </div>

            {/* ── Barra de búsqueda ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, teléfono, RIF..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Refrescar"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* ── Lista ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {isLoading && (
                    <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
                        <RefreshCw size={20} className="animate-spin" />
                        <span className="text-sm">Cargando proveedores...</span>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-500">
                        <XCircle size={28} />
                        <p className="text-sm font-medium">Error al cargar proveedores</p>
                        <button onClick={() => refetch()} className="text-xs text-blue-600 underline">Reintentar</button>
                    </div>
                )}

                {!isLoading && !isError && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                        <Building2 size={40} className="opacity-30" />
                        <p className="text-sm">
                            {search ? 'No se encontró ningún proveedor.' : 'No hay proveedores registrados.'}
                        </p>
                        {!search && (
                            <Link
                                href="/admin/suppliers/new"
                                className="mt-1 text-xs text-blue-600 underline font-medium"
                            >
                                Crear el primer proveedor
                            </Link>
                        )}
                    </div>
                )}

                {!isLoading && !isError && filtered.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wide">Proveedor</th>
                                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide hidden md:table-cell">Contacto Principal</th>
                                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide hidden lg:table-cell">Sede Principal</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wide">Productos</th>
                                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wide">Estado</th>
                                <th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((supplier, i) => (
                                <tr
                                    key={supplier.id}
                                    className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                                >
                                    {/* Nombre + avatar */}
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-3">
                                            <SupplierAvatar name={supplier.name} />
                                            <div>
                                                <p className="font-semibold text-gray-800">{supplier.name}</p>
                                                {supplier.primary_contact?.email && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Mail size={11} />
                                                        {supplier.primary_contact.email}
                                                    </p>
                                                )}
                                                {!supplier.primary_contact?.email && supplier.website && (
                                                    <p className="text-xs text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                                                        {supplier.website.replace(/^https?:\/\//, '')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contacto */}
                                    <td className="py-3.5 px-4 hidden md:table-cell">
                                        <div className="space-y-0.5">
                                            {supplier.primary_contact ? (
                                                <>
                                                    <p className="text-sm text-gray-700 font-medium">{supplier.primary_contact.name}</p>
                                                    {supplier.primary_contact.phone && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Phone size={11} /> {supplier.primary_contact.phone}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">Sin contacto</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Dirección */}
                                    <td className="py-3.5 px-4 hidden lg:table-cell">
                                        {supplier.main_branch?.address ? (
                                            <span className="text-xs text-gray-500 flex items-start gap-1">
                                                <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{supplier.main_branch.address}</span>
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">Sin dirección</span>
                                        )}
                                    </td>

                                    {/* Cantidad de productos */}
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                                            <Package size={11} />
                                            {supplier.offers_count ?? 0}
                                        </span>
                                    </td>

                                    {/* Estado */}
                                    <td className="py-3.5 px-4 text-center">
                                        {supplier.is_active ? (
                                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100">
                                                <CheckCircle size={11} /> Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                                                <XCircle size={11} /> Inactivo
                                            </span>
                                        )}
                                    </td>

                                    {/* Ver detalle */}
                                    <td className="py-3.5 px-4">
                                        <Link
                                            href={`/admin/suppliers/${supplier.id}`}
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                        >
                                            Ver detalle
                                            <ChevronRight size={13} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
