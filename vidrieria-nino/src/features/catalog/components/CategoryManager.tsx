'use client';

import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks';
import { Category } from '../types';
import { buildCategoryTree } from '../utils';
import { Folder, ChevronRight, ChevronDown, Plus, Edit, Trash, Save, X } from 'lucide-react';
import { clsx } from 'clsx';

import { useIsMutating } from '@tanstack/react-query';

export default function CategoryManager() {
    const { data: categories, isLoading, error } = useCategories();
    const createMutation = useCreateCategory();
    const isMutating = useIsMutating(); // Global loading state

    const [isCreatingRoot, setIsCreatingRoot] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    if (isLoading) return <div>Cargando categorías...</div>;
    if (error) return <div>Error al cargar categorías</div>;

    const handleCreateRoot = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await createMutation.mutateAsync({ name: newCategoryName, order: 0 });
            setNewCategoryName('');
            setIsCreatingRoot(false);
        } catch (e) {
            console.error("Error creating root category", e);
        }
    };

    // Build full tree from flat list to support infinite nesting
    const rootCategories = categories?.data ? buildCategoryTree(categories.data) : [];

    return (
        <div className="relative p-4 bg-white shadow rounded-lg max-w-3xl mx-auto">
            {/* Blocking Overlay for Mutations */}
            {isMutating > 0 && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-blue-700">Procesando...</span>
                    </div>
                </div>
            )}

            <div className={`transition-opacity ${isMutating > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Gestor de Categorías</h2>
                    <button
                        onClick={() => setIsCreatingRoot(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                        <Plus size={16} /> Nueva Categoría Raíz
                    </button>
                </div>

                {/* ... (Create Root Form) ... */}
                {isCreatingRoot && (
                    <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de la categoría..."
                            className="flex-1 px-3 py-1 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button onClick={handleCreateRoot} className="text-blue-600 p-1 hover:bg-blue-100 rounded"><Save size={18} /></button>
                        <button onClick={() => setIsCreatingRoot(false)} className="text-gray-500 p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
                    </div>
                )}

                <div className="space-y-1">
                    {rootCategories.map(category => (
                        <CategoryItem key={category.id} category={category} level={0} />
                    ))}
                    {rootCategories.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No hay categorías definidas.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function CategoryItem({ category, level }: { category: Category; level: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreatingChild, setIsCreatingChild] = useState(false);
    const [name, setName] = useState(category.name);
    const [newChildName, setNewChildName] = useState('');

    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();
    const createMutation = useCreateCategory();

    const hasChildren = category.children && category.children.length > 0;

    const handleUpdate = async () => {
        if (name.trim() === category.name) {
            setIsEditing(false);
            return;
        }
        await updateMutation.mutateAsync({ id: category.id, data: { name } });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm(`¿Eliminar "${category.name}"? Sus subcategorías se moverán al nivel superior.`)) {
            await deleteMutation.mutateAsync(category.id);
        }
    };

    const handleCreateChild = async () => {
        if (!newChildName.trim()) return;
        await createMutation.mutateAsync({
            name: newChildName,
            parent_id: category.id,
            order: (category.children?.length || 0) + 1
        });
        setNewChildName('');
        setIsCreatingChild(false);
        setIsOpen(true); // Auto expand
    };

    return (
        <div className="select-none">
            <div
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group transition-colors"
            >
                <div
                    className="p-1 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    ) : (
                        <Folder size={16} className="text-blue-200" />
                    )}
                </div>

                {isEditing ? (
                    <div className="flex-1 flex gap-2 animate-in fade-in duration-200">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 px-2 py-0.5 border rounded text-sm outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <button onClick={handleUpdate} className="text-green-600 hover:bg-green-50 rounded p-0.5"><Save size={16} /></button>
                        <button onClick={() => { setIsEditing(false); setName(category.name); }} className="text-gray-500 hover:bg-gray-100 rounded p-0.5"><X size={16} /></button>
                    </div>
                ) : (
                    <span
                        className="flex-1 text-sm text-gray-700 font-medium cursor-pointer"
                        onDoubleClick={() => setIsEditing(true)}
                    >
                        {category.name}
                    </span>
                )}

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => setIsCreatingChild(true)}
                                title="Agregar subcategoría"
                                className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                title="Editar nombre"
                                className="p-1 text-gray-400 hover:text-orange-600 rounded hover:bg-orange-50"
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                onClick={handleDelete}
                                title="Eliminar"
                                className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            >
                                <Trash size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Formulario para nueva subcategoría */}
            {isCreatingChild && (
                <div className="ml-8 mb-2 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="w-4 border-l-2 border-b-2 border-gray-200 h-4 rounded-bl-md -mt-4 mr-1"></div>
                    <input
                        type="text"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder="Nombre de subcategoría..."
                        className="px-2 py-1 border rounded text-xs w-48 outline-none focus:ring-1 focus:ring-blue-400"
                        autoFocus
                    />
                    <button onClick={handleCreateChild} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded"><Save size={14} /></button>
                    <button onClick={() => setIsCreatingChild(false)} className="text-gray-500 hover:bg-gray-100 p-0.5 rounded"><X size={14} /></button>
                </div>
            )}

            {/* Recursividad para hijos - AQUI ESTA LA CORRECCION DE INDENTACION */}
            {isOpen && hasChildren && (
                <div className="pl-6 ml-2 border-l border-gray-100 animate-in slide-in-from-top-1 duration-300">
                    {category.children!.map(child => (
                        <CategoryItem key={child.id} category={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
