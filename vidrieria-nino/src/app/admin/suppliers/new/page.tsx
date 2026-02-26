'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateSupplier } from '@/features/catalog/hooks';
import { Building2, ChevronRight, Save, ArrowLeft, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Formulario de creación de proveedor
// ─────────────────────────────────────────────────────────────

export default function NewSupplierPage() {
    const router = useRouter();
    const createSupplier = useCreateSupplier();

    const [form, setForm] = useState({
        name: '',
        rif: '',
        website: '',
        payment_terms: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        is_active: true,
    });
    const [error, setError] = useState<string | null>(null);

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.name.trim()) { setError('El nombre del proveedor es obligatorio.'); return; }
        try {
            const res = await createSupplier.mutateAsync(form);
            router.push(`/admin/suppliers/${res.data.id}`);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Error al crear el proveedor.');
        }
    };

    const isSaving = createSupplier.isPending;

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Breadcrumb */}
            <div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <a href="/admin" className="hover:text-blue-500 transition-colors">Admin</a>
                    <ChevronRight size={14} />
                    <Link href="/admin/suppliers" className="hover:text-blue-500 transition-colors">Proveedores</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-700 font-medium">Nuevo</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 size={22} className="text-blue-600" />
                    Nuevo Proveedor
                </h1>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Cabecera de sección */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Datos del Proveedor</h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Nombre */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Nombre Comercial <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={set('name')}
                            placeholder="Ej: Vidrios El Maestro S.A."
                            autoFocus
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* RIF */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            RIF / NIT
                        </label>
                        <input
                            type="text"
                            value={form.rif}
                            onChange={set('rif')}
                            placeholder="Ej: J-12345678-9"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Sitio Web */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Sitio Web
                        </label>
                        <input
                            type="text"
                            value={form.website}
                            onChange={set('website')}
                            placeholder="ejemplo.com"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Condiciones de Pago */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Condiciones de Pago
                        </label>
                        <input
                            type="text"
                            value={form.payment_terms}
                            onChange={set('payment_terms')}
                            placeholder="Ej: 30 días, Contado..."
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Persona de contacto */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Persona de Contacto
                        </label>
                        <input
                            type="text"
                            value={form.contact_name}
                            onChange={set('contact_name')}
                            placeholder="Ej: Carlos Gómez"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={set('phone')}
                            placeholder="0414-1234567"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={set('email')}
                            placeholder="contacto@proveedor.com"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Dirección
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={set('address')}
                            placeholder="Av. Principal, local 5, Caracas"
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Notas */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Notas / Condiciones
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={set('notes')}
                            placeholder="Horario de atención, condiciones de pago, tiempo de entrega habitual..."
                            rows={3}
                            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                        />
                    </div>

                    {/* Estado */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div
                                onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                                className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                Proveedor <span className={form.is_active ? 'text-green-600' : 'text-gray-400'}>
                                    {form.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                {/* Footer acciones */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                    <Link
                        href="/admin/suppliers"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Volver
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
                    >
                        {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {isSaving ? 'Guardando...' : 'Crear Proveedor'}
                    </button>
                </div>
            </form>
        </div>
    );
}
