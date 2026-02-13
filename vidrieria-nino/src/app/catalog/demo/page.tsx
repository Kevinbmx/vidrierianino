import SupplierManager from '@/features/catalog/components/SupplierManager';
import OfferManager from '@/features/catalog/components/OfferManager';

export default function CatalogDemoPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                🔧 Demo: Sistema de Proveedores y Precios Flexibles
            </h1>

            {/* Gestión de Proveedores */}
            <section>
                <SupplierManager />
            </section>

            {/* Gestión de Ofertas - Ejemplo con variant ID 1 */}
            <section>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                        <strong>Nota:</strong> Para ver ofertas, primero crea un producto con variantes.
                        Luego reemplaza <code className="bg-gray-200 px-2 py-1 rounded">variantId=1</code> con el ID real.
                    </p>
                </div>

                <OfferManager
                    variantId={1}
                    variantName="Vidrio Float 5mm (Demo)"
                />
            </section>

            {/* Instrucciones */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-3">📋 Flujo de Trabajo:</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Crear proveedores en la sección superior</li>
                    <li>Crear un producto con modo de pricing (Fijo o Markup)</li>
                    <li>Vincular ofertas de proveedores a las variantes</li>
                    <li>El sistema calculará automáticamente el mejor precio</li>
                </ol>
            </section>
        </div>
    );
}
