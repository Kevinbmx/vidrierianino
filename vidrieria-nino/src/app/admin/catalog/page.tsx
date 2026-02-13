'use client';

import { useState } from 'react';
import CategoryManager from '@/features/catalog/components/CategoryManager';
import ProductList from '@/features/catalog/components/ProductList';
import ProductForm from '@/features/catalog/components/ProductForm';

export default function CatalogPage() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'create' | 'categories'>('inventory');

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Catálogo e Inventario</h1>
                    <p className="text-gray-500">Gestiona productos, categorías, precios y stock.</p>
                </header>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 shadow-sm">
                    <Tab
                        label="Inventario"
                        isActive={activeTab === 'inventory'}
                        onClick={() => setActiveTab('inventory')}
                    />
                    <Tab
                        label="Nuevo Producto"
                        isActive={activeTab === 'create'}
                        onClick={() => setActiveTab('create')}
                    />
                    <Tab
                        label="Categorías"
                        isActive={activeTab === 'categories'}
                        onClick={() => setActiveTab('categories')}
                    />
                </div>

                {/* Content */}
                <div className="transition-all">
                    {activeTab === 'inventory' && <ProductList />}

                    {activeTab === 'create' && (
                        <ProductForm onSuccess={() => setActiveTab('inventory')} />
                    )}

                    {activeTab === 'categories' && <CategoryManager />}
                </div>

            </div>
        </div>
    );
}

function Tab({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-6 font-medium text-sm focus:outline-none border-b-2 transition-colors ${isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
        >
            {label}
        </button>
    );
}
