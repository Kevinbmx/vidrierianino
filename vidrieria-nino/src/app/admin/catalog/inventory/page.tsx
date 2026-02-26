import InventoryTable from '@/features/catalog/components/InventoryTable';

export const metadata = {
    title: 'Inventario | Catálogo — Vidriería Nino',
    description: 'Dashboard de stock en tiempo real por lotes de inventario.',
};

/**
 * /admin/catalog/inventory
 * Vista principal del inventario con tabla jerárquica Master-Detail.
 */
export default function InventoryPage() {
    return <InventoryTable />;
}
