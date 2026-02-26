
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuotationRequest } from '@/features/procurement/hooks';
import RFQAnalysis from '@/features/procurement/components/RFQAnalysis';
import AddSupplierModal from '@/features/procurement/components/AddSupplierModal';
import RFQSupplierDetail from '@/features/procurement/components/RFQSupplierDetail';
import { FileText, Clock, ArrowLeft, Plus, Building, BarChart3, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function RFQDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: rfq, isLoading } = useQuotationRequest(Number(id));

    // Estados de UI
    const [viewMode, setViewMode] = useState<'management' | 'analysis'>('management');
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando Solicitud...</div>;
    if (!rfq) return <div className="p-8 text-center text-red-500">Solicitud no encontrada</div>;

    // Si es una RFQ Hija (que no debería ocurrir si entramos por el listado de padres, 
    // pero por URL directas sí), redirigir al padre o mostrar vista limitada.
    // Asumiremos que siempre trabajamos desde el padre.
    const isParent = !rfq.parent_id;

    // Filter children (active suppliers)
    const activeSuppliers = rfq.children || [];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
            {/* Top Bar Navigation */}
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/procurement/rfq" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {rfq.code}
                            <span className={`px-2 py-0.5 rounded-full text-xs uppercase tracking-wide ${rfq.status === 'awarded' ? 'bg-green-100 text-green-800' :
                                    rfq.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                }`}>
                                {rfq.status}
                            </span>
                        </h1>
                        <div className="text-xs text-gray-500 flex gap-3 mt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> Límite: {new Date(rfq.deadline).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><FileText size={12} /> {rfq.items?.length || 0} ítems</span>
                        </div>
                    </div>
                </div>

                {/* View Mode Switcher */}
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setViewMode('management')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'management'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <LayoutDashboard size={16} /> Gestión Proveedores
                    </button>
                    <button
                        onClick={() => setViewMode('analysis')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'analysis'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <BarChart3 size={16} /> Comparativo & Adjudicación
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            {viewMode === 'management' ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Supplier List */}
                    <aside className="w-80 bg-white border-r flex flex-col shrink-0 z-0">
                        <div className="p-4 border-b">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                <Plus size={18} /> Invitar Proveedor
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {activeSuppliers.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    <Building className="mx-auto mb-2 opacity-50" size={32} />
                                    No hay proveedores invitados.
                                </div>
                            ) : (
                                activeSuppliers.map((child: any) => {
                                    const supplier = child.suppliers?.[0];
                                    const isSelected = selectedChildId === child.id;

                                    if (!supplier) return null;

                                    return (
                                        <button
                                            key={child.id}
                                            onClick={() => setSelectedChildId(child.id)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected
                                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-medium text-gray-900 truncate">{supplier.name}</div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${child.status === 'replied' ? 'bg-green-100 text-green-700' :
                                                        child.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {child.status}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono">{child.code.split('-').pop()}</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    {/* Right Panel: Supplier Detail or Empty State */}
                    <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                        {selectedChildId ? (
                            <div className="max-w-5xl mx-auto">
                                <RFQSupplierDetail
                                    childRfq={activeSuppliers.find((c: any) => c.id === selectedChildId)}
                                    parentRfq={rfq}
                                />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <LayoutDashboard size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Panel de Gestión</h3>
                                <p className="max-w-md text-center mt-2 text-sm">
                                    Selecciona un proveedor de la lista lateral para ver sus detalles,
                                    gestionar items disponibles y cargar respuestas.
                                </p>
                                <div className="mt-8 p-6 bg-white rounded-lg border shadow-sm max-w-2xl w-full text-left">
                                    <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">Resumen General de la Solicitud</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase mb-1">Items Totales</span>
                                            <span className="font-mono text-lg font-medium">{rfq.items.length}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase mb-1">Proveedores Invitados</span>
                                            <span className="font-mono text-lg font-medium">{activeSuppliers.length}</span>
                                        </div>
                                        <div className="col-span-2 mt-2">
                                            <span className="block text-gray-500 text-xs uppercase mb-1">Comentarios</span>
                                            <p className="text-gray-700 bg-gray-50 p-2 rounded italic text-xs">
                                                {rfq.comments || 'Sin comentarios adicionales.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <RFQAnalysis rfqId={rfq.id} rfq={rfq} />
                    </div>
                </div>
            )}

            {showAddModal && <AddSupplierModal
                rfqId={rfq.id}
                existingSupplierIds={activeSuppliers.map((c: any) => c.suppliers?.[0]?.id).filter(Boolean)}
                onClose={() => setShowAddModal(false)}
            />}
        </div>
    );
}

