'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Plus, Tag, BarChart2 } from 'lucide-react';

/**
 * Layout del módulo de Catálogo e Inventario.
 *
 * Maneja la navegación por tabs mediante URLs reales (Next.js App Router).
 * Cada tab es un <Link> a su propia URL, lo que permite:
 * - Navegación directa por URL
 * - Botón "Atrás" del navegador funcional
 * - Compartir enlaces
 * - Marcadores en el navegador
 *
 * Rutas del módulo:
 * - /admin/catalog/inventory      → Dashboard de inventario
 * - /admin/catalog/new            → Crear producto nuevo
 * - /admin/catalog/edit/[id]      → Editar producto existente
 * - /admin/catalog/categories     → Gestión de categorías
 */
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        {
            href: '/admin/catalog/inventory',
            label: 'Inventario',
            icon: <BarChart2 size={15} />,
            match: (p: string) => p.startsWith('/admin/catalog/inventory'),
        },
        {
            href: '/admin/catalog/new',
            label: 'Nuevo Producto',
            icon: <Plus size={15} />,
            match: (p: string) => p === '/admin/catalog/new',
        },
        {
            href: '/admin/catalog/categories',
            label: 'Categorías',
            icon: <Tag size={15} />,
            match: (p: string) => p.startsWith('/admin/catalog/categories'),
        },
    ];

    // No mostrar tabs en la página de edición (tiene su propio header con botón Volver)
    const isEditPage = pathname.startsWith('/admin/catalog/edit/');

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Package size={28} className="text-blue-500" />
                            Catálogo e Inventario
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Gestiona productos, categorías, precios y stock en tiempo real.
                        </p>
                    </div>

                    {/* Botón contextual: sólo en la vista de inventario */}
                    {pathname === '/admin/catalog/inventory' && (
                        <Link
                            href="/admin/catalog/new"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow transition-all hover:scale-[1.02]"
                        >
                            <Plus size={16} /> Nuevo Producto
                        </Link>
                    )}
                </header>

                {/* Tabs (ocultos en la página de edición) */}
                {!isEditPage && (
                    <nav className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 shadow-sm overflow-x-auto">
                        {tabs.map(tab => {
                            const active = tab.match(pathname);
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`flex items-center gap-2 py-4 px-5 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${active
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Contenido de la sub-ruta activa */}
                <div className="transition-all">
                    {children}
                </div>

            </div>
        </div>
    );
}
