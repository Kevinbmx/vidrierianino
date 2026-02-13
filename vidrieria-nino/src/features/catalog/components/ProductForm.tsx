'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories, useUnitsOfMeasure, useCreateProduct } from '../hooks';
import { buildCategoryTree, flattenCategoryTree } from '../utils';
import { UnitOfMeasure } from '../types';
import { Plus, Trash, Info, Save } from 'lucide-react';
import { clsx } from 'clsx';

// --- Esquema Zod ---
// Validamos estructura compleja: producto + variantes
const productSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    category_id: z.coerce.number().min(1, "Selecciona una categoría"),
    description: z.string().optional(),
    variants: z.array(z.object({
        name: z.string().optional(),
        sku: z.string().optional(), // Generado auto en backend si vacío

        // Flexible Pricing
        pricing_mode: z.enum(['fixed', 'markup']).default('fixed'),
        price: z.coerce.number().min(0, "Precio inválido").optional(), // Solo para fixed
        markup_percentage: z.coerce.number().min(0).max(1000).optional(), // Solo para markup

        sale_unit_id: z.coerce.number().min(1, "Requerido"),

        stock_quantity: z.coerce.number().int().min(0).default(0),
        min_stock: z.coerce.number().int().min(0).default(1),
    })).min(1, "Debes agregar al menos una variante"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
    const { data: categories } = useCategories();
    const { data: units } = useUnitsOfMeasure();
    const createProductMutation = useCreateProduct();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            variants: [{
                stock_quantity: 0,
                min_stock: 5,
                pricing_mode: 'fixed',
                price: 0
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const onSubmit = async (data: ProductFormValues) => {
        setServerError(null);
        try {
            await createProductMutation.mutateAsync(data);
            reset();
            if (onSuccess) onSuccess();
            alert('Producto creado exitosamente');
        } catch (error: any) {
            console.error(error);
            setServerError(error.response?.data?.message || 'Error al crear producto');
        }
    };

    // Helper para aplanar categorías para el select (usando utilidades para evitar duplicados)
    const flattenedCategories = categories?.data ? flattenCategoryTree(buildCategoryTree(categories.data)) : [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Nuevo Producto</h2>
                <p className="text-gray-500 text-sm">Crea un producto base y define sus variantes de venta.</p>
            </div>

            {serverError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200">
                    {serverError}
                </div>
            )}

            {/* Datos Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombre del Producto</label>
                    <input
                        {...register('name')}
                        type="text"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: Vidrio Float, Varilla Pino..."
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Categoría</label>
                    <select
                        {...register('category_id')}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Seleccionar...</option>
                        {flattenedCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.displayName}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && <span className="text-red-500 text-xs">{errors.category_id.message}</span>}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        {...register('description')}
                        rows={2}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Variantes */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{fields.length}</span>
                        Variantes / SKUs
                    </h3>
                    <button
                        type="button"
                        onClick={() => append({
                            stock_quantity: 0, min_stock: 5,
                            pricing_mode: 'fixed', price: 0, sale_unit_id: 0
                        } as any)}
                        className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <Plus size={16} /> Agregar Variante
                    </button>
                </div>

                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <VariantRow
                            key={field.id}
                            index={index}
                            register={register}
                            control={control}
                            errors={errors}
                            remove={remove}
                            units={units?.data || []}
                            watch={watch}
                        />
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md transition-colors"
                >
                    <Save size={18} />
                    {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
            </div>
        </form>
    );
}

// Subcomponente para cada fila de variante
function VariantRow({ index, register, remove, units, watch, errors }: any) {
    const pricingMode = watch(`variants.${index}.pricing_mode`);

    return (
        <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg relative group transition-all hover:shadow-md">
            <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Eliminar variante"
            >
                <Trash size={18} />
            </button>

            <div className="grid grid-cols-1 gap-4">
                {/* 1. Identificación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Nombre Variante</label>
                        <input
                            {...register(`variants.${index}.name`)}
                            placeholder="Ej: Vidrio Float 5mm"
                            className="w-full text-sm p-2 border rounded bg-white mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Unidad de Venta</label>
                        <select
                            {...register(`variants.${index}.sale_unit_id`)}
                            className="w-full text-sm p-2 border rounded bg-white mt-1"
                        >
                            <option value="">Seleccionar...</option>
                            {units.map((u: UnitOfMeasure) => (
                                <option key={`s-${u.id}`} value={u.id}>{u.name} ({u.abbreviation})</option>
                            ))}
                        </select>
                        <span className="text-red-500 text-xs">{errors.variants?.[index]?.sale_unit_id?.message}</span>
                    </div>
                </div>

                {/* 2. Pricing Mode Toggle */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-blue-700 uppercase">Configuración de Precio</span>
                        <div className="h-px bg-blue-200 flex-1"></div>
                    </div>

                    {/* Radio Buttons for Pricing Mode */}
                    <div className="flex gap-6 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                {...register(`variants.${index}.pricing_mode`)}
                                value="fixed"
                                className="w-4 h-4 text-blue-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                                💵 Precio Fijo
                            </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                {...register(`variants.${index}.pricing_mode`)}
                                value="markup"
                                className="w-4 h-4 text-indigo-600 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                                📊 Markup % sobre costo
                            </span>
                        </label>
                    </div>

                    {/* Conditional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Precio Fijo - Solo visible si mode = fixed */}
                        <div className={`transition-all ${pricingMode === 'fixed' ? 'opacity-100' : 'opacity-40'}`}>
                            <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
                                Precio de Venta
                                {pricingMode !== 'fixed' && <span className="text-xs normal-case text-gray-400">(deshabilitado)</span>}
                            </label>
                            <div className="relative mt-1">
                                <span className="absolute left-2 top-2 text-gray-400">$</span>
                                <input
                                    type="number" step="0.01"
                                    {...register(`variants.${index}.price`)}
                                    disabled={pricingMode !== 'fixed'}
                                    className={clsx(
                                        "w-full text-sm pl-5 p-2 border rounded",
                                        pricingMode === 'fixed' ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                                    )}
                                    placeholder="2500.00"
                                />
                            </div>
                            {pricingMode === 'fixed' && (
                                <span className="text-red-500 text-xs">{errors.variants?.[index]?.price?.message}</span>
                            )}
                        </div>

                        {/* Markup % - Solo visible si mode = markup */}
                        <div className={`transition-all ${pricingMode === 'markup' ? 'opacity-100' : 'opacity-40'}`}>
                            <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
                                Porcentaje de Ganancia
                                {pricingMode !== 'markup' && <span className="text-xs normal-case text-gray-400">(deshabilitado)</span>}
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="number" step="0.01"
                                    {...register(`variants.${index}.markup_percentage`)}
                                    disabled={pricingMode !== 'markup'}
                                    className={clsx(
                                        "w-full text-sm pr-8 p-2 border rounded",
                                        pricingMode === 'markup' ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                                    )}
                                    placeholder="35.00"
                                />
                                <span className="absolute right-2 top-2 text-gray-400">%</span>
                            </div>
                            {pricingMode === 'markup' && (
                                <span className="text-red-500 text-xs">{errors.variants?.[index]?.markup_percentage?.message}</span>
                            )}
                        </div>
                    </div>

                    {/* Pricing Mode Explanations */}
                    {pricingMode === 'fixed' && (
                        <p className="mt-3 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                            <strong>Modo Fijo:</strong> El precio de venta que ingreses se mantiene constante, independiente del costo de proveedores.
                        </p>
                    )}
                    {pricingMode === 'markup' && (
                        <p className="mt-3 text-xs text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-200">
                            <strong>Modo Markup:</strong> El precio se calculará automáticamente como: Mejor Costo × (1 + Markup%/100).
                            Debes registrar ofertas de proveedores después de crear el producto.
                        </p>
                    )}
                </div>

                {/* 3. Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Stock Inicial</label>
                        <input
                            type="number"
                            {...register(`variants.${index}.stock_quantity`)}
                            className="w-full text-sm p-2 border rounded mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Stock Mínimo</label>
                        <input
                            type="number"
                            {...register(`variants.${index}.min_stock`)}
                            className="w-full text-sm p-2 border rounded mt-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Utils ---

