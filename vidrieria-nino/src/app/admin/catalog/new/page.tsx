'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/features/catalog/components/ProductForm';

/**
 * /admin/catalog/new
 * Formulario de creación de producto nuevo con campos vacíos.
 * Al guardar exitosamente, redirige al inventario.
 */
export default function NewProductPage() {
    const router = useRouter();

    return (
        <ProductForm
            onSuccess={() => router.push('/admin/catalog/inventory')}
        />
    );
}
