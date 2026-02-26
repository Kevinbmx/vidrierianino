'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch, Control, UseFormRegister, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories, useUnitsOfMeasure, useCreateProduct, useUpdateProduct, useProduct } from '../hooks';
import { buildCategoryTree, flattenCategoryTree } from '../utils';
import { UnitOfMeasure, Category } from '../types';
import { Plus, Trash, Save, Copy, Box, Ruler, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
// --- Types & Schema ---

const packagingSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    quantity: z.coerce.number().min(0.0001, "Factor requerido"),
    description: z.string().optional(),
    is_default_purchase: z.boolean().default(false)
});

const dimensionSchema = z.object({
    name: z.string().optional(), // "Plancha Jumbo"
    width: z.coerce.number().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    length: z.coerce.number().optional().nullable(),
    weight: z.coerce.number().optional().nullable(),
    is_default: z.boolean().default(false)
});

const variantSchema = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    sku: z.string().optional(),

    // Dimensions (New Array Structure)
    dimensions: z.array(dimensionSchema).optional(),

    // Packagings
    packagings: z.array(packagingSchema).optional(),

    // Pricing
    pricing_mode: z.enum(['fixed', 'markup']).default('fixed'),
    price: z.coerce.number().min(0).optional(),
    markup_percentage: z.coerce.number().min(0).max(1000).optional(),

    sale_unit_id: z.coerce.number().min(1, "Unidad de venta requerida"),

    stock_quantity: z.coerce.number().int().min(0).default(0),
    min_stock: z.coerce.number().int().min(0).default(1),
    is_active: z.boolean().default(true),
});

const productSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    category_id: z.coerce.number().min(1, "Selecciona una categoría"),
    description: z.string().optional(),
    variants: z.array(variantSchema).min(1, "Debes agregar al menos una variante"),
});

type ProductFormValues = z.infer<typeof productSchema>;

// --- Helper Hook for Category (simplified for types now) ---

// We still keep category logic for "hints" but strict logic moves to Unit Type
function useCategoryLogic(categoryId: number, categories: Category[] = [], units: UnitOfMeasure[] = []) {
    // ... (Existing logic can remain for suggestions, but strict input control moves to unit type)
    // For now returning simple suggestions
    const [suggestedUnitId, setSuggestedUnitId] = useState<number | undefined>();

    useEffect(() => {
        if (!categoryId || !categories.length) return;
        // Simple logic to find suggested unit based on keywords
        // ... (can be kept or simplified)
    }, [categoryId]);

    return { suggestedUnitId };
}


// --- Main ProductForm Component ---

export default function ProductForm({
    onSuccess,
    productId, // Si se pasa, activa el modo EDICIÓN
}: {
    onSuccess?: () => void;
    productId?: number;
}) {
    const isEditing = !!productId;
    const { data: categories } = useCategories();
    const { data: units } = useUnitsOfMeasure();
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(productId ?? 0);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            variants: [{
                stock_quantity: 0,
                min_stock: 5,
                pricing_mode: 'fixed',
                price: 0,
                packagings: [],
                dimensions: [],
                is_active: true
            }]
        }
    });

    // 🔄 Modo EDICIÓN: al cargar el producto, poblar el formulario
    useEffect(() => {
        if (isEditing && existingProduct?.data) {
            const p = existingProduct.data;
            reset({
                name: p.name,
                category_id: p.category_id ?? undefined,
                description: p.description ?? '',
                variants: (p.variants ?? []).map(v => ({
                    id: v.id,
                    name: v.name ?? '',
                    sku: v.sku ?? '',
                    pricing_mode: v.pricing_mode ?? 'fixed',
                    price: parseFloat(String(v.price ?? 0)),
                    markup_percentage: v.markup_percentage ? parseFloat(String(v.markup_percentage)) : undefined,
                    sale_unit_id: v.sale_unit_id,
                    stock_quantity: v.stock_quantity ?? 0,
                    min_stock: v.min_stock ?? 1,
                    is_active: v.is_active ?? true,
                    packagings: (v.packagings ?? []).map(pk => ({
                        name: pk.name,
                        quantity: pk.quantity,
                        description: pk.description ?? '',
                        is_default_purchase: pk.is_default_purchase,
                    })),
                    dimensions: (v.dimensions ?? []).map(d => ({
                        name: d.name ?? '',
                        width: d.width ?? undefined,
                        height: d.height ?? undefined,
                        length: d.length ?? undefined,
                        weight: d.weight ?? undefined,
                        is_default: d.is_default ?? false,
                    })),
                })),
            });
        }
    }, [existingProduct, isEditing, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const selectedCategoryId = watch('category_id');

    const onSubmit = async (data: ProductFormValues) => {
        setServerError(null);
        setSuccessMessage(null);
        try {
            if (isEditing && productId) {
                // Modo EDICIÓN: PUT /api/products/{id}
                await updateProductMutation.mutateAsync({ id: productId, data });
                setSuccessMessage('✅ Producto actualizado correctamente.');
            } else {
                // Modo CREACIÓN: POST /api/products
                await createProductMutation.mutateAsync(data);
                reset();
                setSuccessMessage('✅ Producto creado correctamente.');
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message
                ?? error.response?.data?.errors
                ?? (isEditing ? 'Error al actualizar producto' : 'Error al crear producto');
            setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    const duplicateVariant = (index: number) => {
        const variantToClone = watch(`variants.${index}`);
        append({
            ...variantToClone,
            name: `${variantToClone.name} (Copia)`,
            sku: '',
            packagings: variantToClone.packagings ? [...variantToClone.packagings] : [],
            dimensions: variantToClone.dimensions ? [...variantToClone.dimensions] : []
        });
    };

    const flattenedCategories = categories?.data ? flattenCategoryTree(buildCategoryTree(categories.data)) : [];

    // Estado de carga en modo edición
    if (isEditing && isLoadingProduct) {
        return (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm">Cargando datos del producto...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full space-y-8 p-4 md:p-8 bg-white shadow-lg rounded-xl">
            <div className="border-b pb-4 mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {isEditing ? `Editar Producto` : 'Nuevo Producto'}
                    </h2>
                    {isEditing && existingProduct?.data && (
                        <p className="text-sm text-gray-400 mt-1 font-mono">
                            ID #{productId} &mdash; {existingProduct.data.name}
                        </p>
                    )}
                    <p className="text-gray-500 text-sm md:text-base mt-1">
                        {isEditing
                            ? 'Modifica las especificaciones técnicas, variantes y precios del producto.'
                            : 'Define las especificaciones técnicas, variantes y formas de empaque.'}
                    </p>
                </div>
            </div>

            {/* Mensajes de servidor */}
            {serverError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 flex items-start gap-2">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                </div>
            )}
            {successMessage && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
                    {successMessage}
                </div>
            )}

            {/* SECCIÓN 1: DATOS GENERALES */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-700 border-l-4 border-blue-500 pl-3">
                    1. Información General
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Categoría *</label>
                        <select
                            {...register('category_id')}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                        >
                            <option value="">Seleccionar Categoría...</option>
                            {flattenedCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.displayName}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && <span className="text-red-500 text-xs">{errors.category_id.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Nombre del Producto *</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Ej: Vidrio Float Incoloro"
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Descripción</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400"
                            placeholder="Descripción detallada del producto para facilitar búsquedas..."
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: VARIANTES */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-bold text-gray-700 border-l-4 border-blue-500 pl-3 flex items-center gap-2">
                        2. Ficha Técnica y Variantes
                    </h3>
                    <button
                        type="button"
                        onClick={() => append({
                            pricing_mode: 'fixed',
                            price: 0,
                            stock_quantity: 0,
                            min_stock: 5,
                            sale_unit_id: 0,
                            packagings: [],
                            dimensions: []
                        } as any)}
                        className="w-full md:w-auto text-sm flex justify-center items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Agregar Variante
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    {fields.map((field, index) => (
                        <VariantRow
                            key={field.id}
                            index={index}
                            register={register}
                            control={control}
                            errors={errors}
                            remove={remove}
                            duplicate={duplicateVariant}
                            units={units?.data || []}
                            watch={watch}
                            setValue={setValue}
                        />
                    ))}

                    {fields.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
                            <Box size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No hay variantes definidas. Agrega la primera para comenzar.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 border-t flex justify-between items-center sticky bottom-0 bg-white/95 backdrop-blur py-4 -mx-4 md:-mx-8 px-4 md:px-8 border-t-gray-100 z-10">
                <div className="text-xs text-gray-400 hidden md:block">
                    {isEditing ? '⚡ Modo Edición — los cambios reemplazarán los datos actuales.' : ''}
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full md:w-auto text-white px-8 py-3 rounded-lg disabled:opacity-50 flex justify-center items-center gap-2 font-bold shadow-lg transition-all hover:scale-[1.02] text-base ${isEditing
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-green-600 hover:bg-green-700'
                        }`}
                >
                    {isSubmitting ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Save size={20} />
                    )}
                    {isSubmitting
                        ? (isEditing ? 'Actualizando...' : 'Guardando...')
                        : (isEditing ? 'Actualizar Producto' : 'Guardar Producto Completo')}
                </button>
            </div>
        </form>
    );
}

// --- Variant Row Component ---

import { usePackagingTypes, useDimensionTemplates } from '../hooks';

function VariantRow({ index, register, control, remove, duplicate, units, watch, setValue, errors }: any) {
    const { data: packagingTemplates } = usePackagingTypes();

    // We get sale_unit_id to determine what fields to show in Dimension Manager
    const saleUnitId = watch(`variants.${index}.sale_unit_id`);
    // Find the unit object
    const selectedUnit = units.find((u: UnitOfMeasure) => u.id == saleUnitId);

    // Determine input flags based on unit type
    const showDimensions = selectedUnit?.type === 'area' || selectedUnit?.type === 'length';
    const showWeight = selectedUnit?.type === 'weight';
    const unitType = selectedUnit?.type || 'unit';

    const pricingMode = watch(`variants.${index}.pricing_mode`);

    return (
        <div className="bg-white border text-gray-700 font-sans border-gray-200 rounded-xl overflow-hidden shadow-md transition-shadow hover:shadow-lg">
            {/* Header / Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-xs">#{index + 1}</span>
                    <div className="flex-1 sm:flex-none">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block sm:hidden mb-1">Nombre Variante</label>
                        <input
                            {...register(`variants.${index}.name`)}
                            placeholder="Nombre Variante (ej: 4mm Incoloro)"
                            className="bg-transparent border-b border-gray-300 focus:border-blue-500 font-semibold text-gray-800 placeholder:text-gray-400 w-full sm:w-80 text-base py-1 outline-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activo</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" {...register(`variants.${index}.is_active`)} />
                            <div className={`w-10 h-5 rounded-full transition-colors relative ${watch(`variants.${index}.is_active`) ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${watch(`variants.${index}.is_active`) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                        </div>
                    </label>
                    <div className="flex items-center gap-1 border-l pl-4 border-gray-300">
                        <button type="button" onClick={() => duplicate(index)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Duplicar">
                            <Copy size={18} />
                        </button>
                        <button type="button" onClick={() => remove(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Eliminar">
                            <Trash size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:divide-x lg:divide-gray-100">

                {/* BLOQUE A: DEFINICIÓN FÍSICA (Left Column) */}
                <div className="lg:col-span-4 space-y-6">
                    <h4 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2 border-b pb-2">
                        <Ruler size={16} /> Unidad & Dimensiones
                    </h4>

                    {/* Unidad Base */}
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Unidad de Venta *</label>
                        <select
                            {...register(`variants.${index}.sale_unit_id`)}
                            className="w-full text-sm p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Seleccionar Unidad...</option>
                            {units.map((u: UnitOfMeasure) => (
                                <option key={`s-${u.id}`} value={u.id}>{u.name} ({u.abbreviation})</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                            <InfoIcon />
                            <span>Determina los campos de dimensión habilitados.</span>
                        </p>
                    </div>

                    {/* Dimension Manager (Multi-Row) */}
                    {(selectedUnit) && (
                        <div>
                            <DimensionManager
                                nestIndex={index}
                                control={control}
                                register={register}
                                unitType={unitType}
                                setValue={setValue}
                            />
                        </div>
                    )}
                </div>

                {/* BLOQUE B: EMPAQUES Y PRICING (Middle & Right) */}
                <div className="lg:col-span-8 flex flex-col gap-6 lg:pl-6">

                    {/* Empaques */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2 border-b pb-2">
                            <Box size={16} /> Formas de Entrega / Empaques
                        </h4>
                        <PackagingManager
                            nestIndex={index}
                            control={control}
                            register={register}
                            setValue={setValue}
                            packagingTemplates={packagingTemplates?.data}
                        />
                    </div>

                    {/* Pricing Config */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2">
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                            💰 Precio y Stock
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Columna Stock */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase">Control de Inv.</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Stock Inicial</label>
                                        <input
                                            {...register(`variants.${index}.stock_quantity`)}
                                            type="number"
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm text-center font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Min. Alerta</label>
                                        <input
                                            {...register(`variants.${index}.min_stock`)}
                                            type="number"
                                            className="w-full p-2 border border-blue-200 bg-blue-50 rounded-lg text-sm text-center font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Columna Precio */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Modo de Precio</label>
                                    <select
                                        {...register(`variants.${index}.pricing_mode`)}
                                        className="text-xs p-1 border rounded bg-white"
                                    >
                                        <option value="fixed">Fijo ($)</option>
                                        <option value="markup">Margen (%)</option>
                                    </select>
                                </div>

                                {pricingMode === 'fixed' ? (
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Precio Venta Unitario</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                            <input
                                                {...register(`variants.${index}.price`)}
                                                type="number" step="0.01"
                                                className="w-full p-2 pl-7 border border-gray-300 rounded-lg text-base font-bold text-gray-800"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs text-blue-600 mb-1 block font-bold">Margen sobre Costo</label>
                                        <div className="relative">
                                            <input
                                                {...register(`variants.${index}.markup_percentage`)}
                                                type="number"
                                                step="0.1"
                                                placeholder="30"
                                                className="w-full p-2 pr-8 border border-blue-300 bg-blue-50 rounded-lg text-base font-bold text-blue-700"
                                            />
                                            <span className="absolute right-3 top-2.5 text-blue-500 font-bold">%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- Nested Dimension Manager ---

function DimensionManager({ nestIndex, control, register, unitType, setValue }: any) {
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: `variants.${nestIndex}.dimensions`
    });

    const { data: dimensionTemplates } = useDimensionTemplates(unitType);
    const [mode, setMode] = useState<'standard' | 'custom'>(fields.length === 0 ? 'custom' : 'standard');

    const [hasInitialized, setHasInitialized] = useState(false);

    // Detectar si ya hay dimensiones para setear el modo inicial al cargar
    useEffect(() => {
        if (!hasInitialized) {
            if (fields.length > 0) {
                setMode('standard');
            } else {
                setMode('custom');
            }
            setHasInitialized(true);
        }
    }, [fields.length, hasInitialized]);

    const handleModeChange = (newMode: 'standard' | 'custom') => {
        setMode(newMode);
        if (newMode === 'custom') {
            // Limpiar dimensiones si cambia a custom
            replace([]);
        }
    };

    const applyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = parseInt(e.target.value);
        const template = dimensionTemplates?.data.find((t: any) => t.id === templateId);

        if (template) {
            append({
                name: template.name,
                width: template.width,
                height: template.height,
                length: template.length,
                weight: null,
                is_default: fields.length === 0
            });
            e.target.value = "";
        }
    };

    if (unitType === 'unit') return null;

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            {/* Mode Selector */}
            <div className="flex gap-4 mb-4 border-b border-gray-200 pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={`dim_mode_${nestIndex}`}
                        checked={mode === 'standard'}
                        onChange={() => handleModeChange('standard')}
                        className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Formatos Estándar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={`dim_mode_${nestIndex}`}
                        checked={mode === 'custom'}
                        onChange={() => handleModeChange('custom')}
                        className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">A Medida / Variable</span>
                </label>
            </div>

            {mode === 'custom' ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                    <Ruler className="mx-auto text-blue-400 mb-2" size={24} />
                    <p className="text-sm font-medium text-blue-800">Producto Dimensionado</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Las dimensiones exactas (Ancho x Alto) se especificarán en cada transacción (Compra/Venta).
                        No es necesario registrar formatos fijos aquí.
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase">Formatos Permitidos</h5>

                        {dimensionTemplates?.data && (
                            <select
                                onChange={applyTemplate}
                                className="text-[10px] p-1.5 border rounded bg-white w-full sm:w-auto shadow-sm"
                            >
                                <option value="">+ Cargar Plantilla...</option>
                                {dimensionTemplates.data.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, k) => (
                            <div key={field.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group transition-all hover:border-blue-300 hover:shadow-md">
                                {/* Header Row: Name & Delete */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 mr-2">
                                        <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Nombre Formato</label>
                                        <input
                                            {...register(`variants.${nestIndex}.dimensions.${k}.name`)}
                                            placeholder="Ej: Plancha Jumbo"
                                            className="w-full text-xs font-semibold border-b border-slate-100 focus:border-blue-500 py-1 px-0 outline-none placeholder:font-normal"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(k)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded bg-slate-50"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>

                                {/* Dimensions Row */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(unitType === 'area') && (
                                        <>
                                            <div>
                                                <label className="block text-[9px] text-slate-400 font-bold uppercase">Ancho (m)</label>
                                                <input
                                                    {...register(`variants.${nestIndex}.dimensions.${k}.width`)}
                                                    type="number" step="0.001"
                                                    className="w-full mt-1 p-1.5 text-xs border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] text-slate-400 font-bold uppercase">Alto (m)</label>
                                                <input
                                                    {...register(`variants.${nestIndex}.dimensions.${k}.height`)}
                                                    type="number" step="0.001"
                                                    className="w-full mt-1 p-1.5 text-xs border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {(unitType === 'length') && (
                                        <div className="col-span-2">
                                            <label className="block text-[9px] text-slate-400 font-bold uppercase">Largo (ml)</label>
                                            <input
                                                {...register(`variants.${nestIndex}.dimensions.${k}.length`)}
                                                type="number" step="0.001"
                                                className="w-full mt-1 p-1.5 text-xs border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}
                                    {(unitType === 'weight') && (
                                        <div className="col-span-2">
                                            <label className="block text-[9px] text-slate-400 font-bold uppercase">Peso (kg)</label>
                                            <input
                                                {...register(`variants.${nestIndex}.dimensions.${k}.weight`)}
                                                type="number" step="0.001"
                                                className="w-full mt-1 p-1.5 text-xs border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Default Badge (Logic TBD) */}
                                {k === 0 && (
                                    <div className="absolute -top-2 -left-2">
                                        <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-200 shadow-sm">
                                            ★ Default
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => append({ name: 'Estándar', width: null, height: null, length: null, weight: null, is_default: false })}
                            className="w-full py-3 text-xs font-medium text-center border-2 border-dashed border-blue-200 rounded-lg text-blue-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={14} />
                            Agregar Nuevo Formato
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}


// --- Nested Packaging Manager ---

function PackagingManager({ nestIndex, control, register, setValue, packagingTemplates }: { nestIndex: number, control: Control<any>, register: UseFormRegister<any>, setValue: any, packagingTemplates?: any[] }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `variants.${nestIndex}.packagings`
    });

    const applyPackagingTemplate = (templateId: string) => {
        const template = packagingTemplates?.find(t => t.id === parseInt(templateId));
        if (template) {
            append({
                name: template.name,
                quantity: parseFloat(template.default_quantity),
                description: template.description || '',
                is_default_purchase: false
            });
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    {/* Template Selector */}
                    {packagingTemplates && (
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    applyPackagingTemplate(e.target.value);
                                    e.target.value = ""; // Reset
                                }
                            }}
                            className="text-xs p-2 border border-gray-300 rounded-lg bg-white shadow-sm outline-none focus:border-blue-500 w-full sm:w-auto"
                        >
                            <option value="">+ Cargar Plantilla...</option>
                            {packagingTemplates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({parseFloat(t.default_quantity)})</option>
                            ))}
                        </select>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => append({ name: '', quantity: 1, description: '', is_default_purchase: false })}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                >
                    + Agregar Manual
                </button>
            </div>

            <div className="p-3 space-y-3">
                {fields.map((item, k) => (
                    <div key={item.id} className="relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 mr-8">
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Nombre (Alias)</label>
                                <input
                                    {...register(`variants.${nestIndex}.packagings.${k}.name`)}
                                    placeholder="Ej: Caja"
                                    className="w-full text-sm font-semibold border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(k)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"
                            >
                                <Trash size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Factor (Unids)</label>
                                <input
                                    {...register(`variants.${nestIndex}.packagings.${k}.quantity`)}
                                    type="number"
                                    step="0.001"
                                    placeholder="1"
                                    className="w-full p-2 border border-gray-200 rounded bg-gray-50 focus:bg-white focus:border-blue-500 outline-none text-sm text-center font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Descripción</label>
                                <input
                                    {...register(`variants.${nestIndex}.packagings.${k}.description`)}
                                    placeholder="Opcional"
                                    className="w-full p-2 border border-gray-200 rounded bg-gray-50 focus:bg-white focus:border-blue-500 outline-none text-xs"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs italic">
                        No hay empaques definidos. Agrega uno manual o desde plantilla.
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    );
}
