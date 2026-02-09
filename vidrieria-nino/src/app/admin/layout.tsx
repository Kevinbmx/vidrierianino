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
          <ul className="space-y-2">
            <li><a href="/admin" className="block py-2 px-3 rounded hover:bg-slate-800 transition-colors">Dashboard</a></li>
            <li><a href="/admin/leads" className="block py-2 px-3 rounded hover:bg-slate-800 transition-colors">Leads</a></li>
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
