'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductForm from '@/features/catalog/components/ProductForm';
import { ArrowLeft, Pencil } from 'lucide-react';

/**
 * /admin/catalog/edit/[id]
 *
 * En Next.js 15+, `params` es una Promise. Se debe unwrap con React.use()
 * antes de acceder a sus propiedades. Esto elimina el warning de consola.
 */
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();

    // ✅ Next.js 15: unwrap params con React.use()
    const { id } = React.use(params);
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
        return (
            <div className="bg-white rounded-xl p-8 text-center text-red-500">
                ID de producto inválido.{' '}
                <Link href="/admin/catalog/inventory" className="underline text-blue-600">Volver al inventario</Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sub-header de contexto */}
            <div className="flex items-center gap-3">
                <Link
                    href="/admin/catalog/inventory"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Volver al inventario
                </Link>
                <span className="text-gray-300">/</span>
                <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                    <Pencil size={14} className="text-amber-500" />
                    Editando producto #{productId}
                </div>
            </div>

            {/* Formulario en modo edición */}
            <ProductForm
                productId={productId}
                onSuccess={() => router.push('/admin/catalog/inventory')}
            />
        </div>
    );
}
