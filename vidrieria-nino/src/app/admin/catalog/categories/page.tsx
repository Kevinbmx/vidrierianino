import CategoryManager from '@/features/catalog/components/CategoryManager';

export const metadata = {
    title: 'Categorías | Catálogo — Vidriería Nino',
    description: 'Gestión de categorías de productos.',
};

/**
 * /admin/catalog/categories
 * Gestor de categorías del catálogo.
 */
export default function CategoriesPage() {
    return <CategoryManager />;
}
