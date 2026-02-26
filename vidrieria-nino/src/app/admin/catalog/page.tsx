import { redirect } from 'next/navigation';

/**
 * /admin/catalog redirige al inventario como ruta raíz del módulo.
 * Esto permite tener sub-rutas limpias sin un layout con tabs JS.
 */
export default function CatalogRootPage() {
    redirect('/admin/catalog/inventory');
}
