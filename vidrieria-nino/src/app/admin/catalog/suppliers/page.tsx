import SupplierManager from '@/features/catalog/components/SupplierManager';
import { Breadcrumb } from 'lucide-react'; // Placeholder, not real import for breadcrumb logic

export default function SuppliersAdminPage() {
    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-2 border-b pb-4 mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                    <a href="/admin" className="hover:text-blue-600">Admin</a>
                    <span className="mx-2">/</span>
                    <a href="/admin/catalog" className="hover:text-blue-600">Catálogo</a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 font-medium">Proveedores</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Gestión de Proveedores
                </h1>
                <p className="text-gray-600 max-w-3xl">
                    Administra tu red de proveedores, información de contacto y condiciones comerciales.
                    Los proveedores registrados aquí podrán vincularse a tus productos para calcular costos y márgenes.
                </p>
            </header>

            <main className="bg-white rounded-xl shadow-sm border border-gray-200">
                <SupplierManager />
            </main>
        </div>
    );
}
