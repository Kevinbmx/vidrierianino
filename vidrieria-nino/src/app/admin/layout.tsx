'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, fetchUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser();
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-4 flex-shrink-0">
        <h2 className="text-xl font-bold mb-8 px-2">Vidriería Nino</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <a href="/admin" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors">
                <span>📊</span> Dashboard
              </a>
            </li>

            <li className="pt-2">
              <span className="text-xs uppercase text-slate-500 font-bold px-3">Gestión Comercial</span>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="/admin/leads" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <span>📞</span> Leads / Contactos
                  </a>
                </li>
              </ul>
            </li>

            <li className="pt-2">
              <span className="text-xs uppercase text-slate-500 font-bold px-3">Catálogo</span>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="/admin/catalog" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <span>📦</span> Productos
                  </a>
                </li>
                <li>
                  <a href="/admin/suppliers" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <span>🏭</span> Proveedores
                  </a>
                </li>
                <li>
                  <a href="/admin/offers" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <span>💲</span> Ofertas y Precios
                  </a>
                </li>
              </ul>
            </li>

            <li className="pt-2">
              <span className="text-xs uppercase text-slate-500 font-bold px-3">Gestión de Compras</span>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="/admin/procurement/rfq" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <span>📑</span> Solicitudes Cotización
                  </a>
                </li>
                <li>
                  <a href="/admin/purchase-orders" className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors text-sm">
                    <span>🛒</span> Órdenes de Compra
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
