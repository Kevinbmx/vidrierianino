'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Building2, ChevronRight, Mail, Phone, FileText,
    Package, Star, Edit3, CheckCircle, XCircle, ArrowLeft,
    RefreshCw, Plus, AlertCircle, Loader2, Search, X as XIcon, Trash2, Save,
    UserCircle, UserPlus, Crown, Building
} from 'lucide-react';
import {
    useSupplier, useUpdateSupplier, useDeactivateSupplier,
    useActivateSupplier, useCreateOffer, useUpdateOffer, useDeleteOffer,
    useSupplierContacts, useCreateSupplierContact, useUpdateSupplierContact,
    useDeleteSupplierContact, useSetContactPrimary,
    useSupplierBranches, useCreateSupplierBranch, useUpdateSupplierBranch, useDeleteSupplierBranch,
    useSetBranchMain
} from '@/features/catalog/hooks';
import api from '@/lib/axios';

// ─────────────────────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────────────────────

interface OfferVariant {
    id: number;
    sku: string | null;
    name: string | null;
    sale_unit_abbr: string | null;
    product: { id: number; name: string } | null;
}

interface ProductOffer {
    id: number;
    is_preferred: boolean;
    base_unit_cost: string | null;
    notes: string | null;
    variant: OfferVariant;
}

interface VariantSearchResult {
    id: number;
    sku: string | null;
    name: string | null;
    sale_unit_id: number;
    sale_unit?: { id: number; abbreviation: string };
    product: { id: number; name: string };
}

interface CartItem {
    variant: VariantSearchResult;
    cost: string;
    isPreferred: boolean;
    status: 'pending' | 'saving' | 'ok' | 'error';
    errorMsg?: string;
}

interface SupplierContact {
    id: number;
    branch_id: number | null;
    name: string;
    role: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    is_primary: boolean;
}

interface SupplierBranch {
    id: number;
    name: string;
    city: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
    is_main: boolean;
    contacts: SupplierContact[];
}

// ─────────────────────────────────────────────────────────────
// OfferCard — edición inline + eliminación
// ─────────────────────────────────────────────────────────────

function OfferCard({ offer, onRefresh }: { offer: ProductOffer; onRefresh: () => void }) {
    const updateOffer = useUpdateOffer();
    const deleteOffer = useDeleteOffer();

    const [editing, setEditing] = useState(false);
    const [cost, setCost] = useState(offer.base_unit_cost ?? '');
    const [notes, setNotes] = useState(offer.notes ?? '');
    const [isPreferred, setIsPreferred] = useState(offer.is_preferred);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unit = offer.variant.sale_unit_abbr ?? 'u';

    const handleSave = async () => {
        setError(null);
        setSaving(true);
        try {
            await updateOffer.mutateAsync({
                offerId: offer.id,
                data: {
                    cost: cost ? parseFloat(cost) : 0,
                    notes: notes.trim() || undefined,
                    is_preferred: isPreferred,
                } as any,
            });
            setEditing(false);
            onRefresh();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'No se pudo guardar.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setCost(offer.base_unit_cost ?? '');
        setNotes(offer.notes ?? '');
        setIsPreferred(offer.is_preferred);
        setError(null);
        setEditing(false);
    };

    const handleDelete = async () => {
        const productName = offer.variant.product?.name ?? 'este producto';
        if (!confirm(`¿Eliminar "${productName}" de este proveedor?`)) return;
        setDeleting(true);
        try {
            await deleteOffer.mutateAsync(offer.id);
            onRefresh();
        } catch {
            alert('No se pudo eliminar. Intentá de nuevo.');
            setDeleting(false);
        }
    };

    if (editing) {
        return (
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                {/* Encabezado */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Edit3 size={13} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{offer.variant.product?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400 truncate">
                            {offer.variant.name ?? ''}{offer.variant.sku ? ` · ${offer.variant.sku}` : ''}
                        </p>
                    </div>
                </div>

                {/* Costo */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Costo por {unit} (opcional)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                        <input
                            type="number" step="0.0001" min="0"
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                            autoFocus
                            placeholder="0.0000"
                            className="w-full pl-7 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                        />
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Notas (opcional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Ej: Precio válido hasta marzo..."
                        className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                    />
                </div>

                {/* Preferido toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                        onClick={() => setIsPreferred(p => !p)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${isPreferred ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPreferred ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-xs font-medium ${isPreferred ? 'text-amber-600' : 'text-gray-500'}`}>
                        {isPreferred ? 'Proveedor preferido ⭐' : 'Marcar como preferido'}
                    </span>
                </label>

                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                {/* Acciones */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSave} disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button onClick={handleCancel} className="px-4 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all group ${offer.is_preferred ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'} hover:shadow-sm`}>
            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${offer.is_preferred ? 'bg-amber-100' : 'bg-blue-50'}`}>
                {offer.is_preferred
                    ? <Star size={15} className="text-amber-600 fill-amber-400" />
                    : <Package size={15} className="text-blue-500" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{offer.variant.product?.name ?? '—'}</p>
                <p className="text-xs text-gray-500 truncate">
                    {offer.variant.name ?? ''} {offer.variant.sku ? `· SKU: ${offer.variant.sku}` : ''}
                </p>
                {offer.notes && <p className="text-xs text-gray-400 italic mt-1 truncate">{offer.notes}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Precio */}
                <div className="text-right mr-1">
                    {offer.base_unit_cost ? (
                        <p className="text-sm font-bold text-gray-700">
                            ${parseFloat(offer.base_unit_cost).toFixed(2)}
                            <span className="text-[10px] text-gray-400 ml-0.5">/{unit}</span>
                        </p>
                    ) : (
                        <p className="text-xs text-gray-300 italic">Sin precio</p>
                    )}
                    {offer.is_preferred && (
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Preferido</span>
                    )}
                </div>

                {/* Botón editar */}
                <button
                    onClick={() => setEditing(true)}
                    title="Editar"
                    className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Edit3 size={13} />
                </button>

                {/* Botón eliminar */}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    title="Eliminar"
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                    {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// BranchesAndContactsPanel — sucursales + contactos del proveedor
// ─────────────────────────────────────────────────────────────

const EMPTY_CONTACT = { name: '', role: '', phone: '', email: '', notes: '', is_primary: false, branch_id: null as number | null };
const EMPTY_BRANCH = { name: '', city: '', address: '', phone: '', email: '', notes: '', is_main: false };

// ─────────────────────────────────────────────────────────────
// ContactCard — componente extraído para evitar pérdida de focus
// (si se define dentro del render de BranchesAndContactsPanel,
//  React lo destruye/recrea en cada state update y pierde el cursor)
// ─────────────────────────────────────────────────────────────

interface ContactCardProps {
    c: SupplierContact;
    branches: SupplierBranch[];
    editingContactId: number | null;
    editContactForm: typeof EMPTY_CONTACT;
    saving: boolean;
    error: string | null;
    onChangeField: (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onChangeBranch: (val: string) => void;
    onSave: (id: number) => void;
    onCancel: () => void;
    onStartEdit: (c: SupplierContact) => void;
    onDelete: (c: SupplierContact) => void;
    onSetPrimary: (id: number) => void;
}

function ContactCard({
    c, branches, editingContactId, editContactForm, saving, error,
    onChangeField, onChangeBranch, onSave, onCancel, onStartEdit, onDelete, onSetPrimary,
}: ContactCardProps) {
    if (editingContactId === c.id) return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2 mt-2">
            <input type="text" value={editContactForm.name} onChange={onChangeField('name')} placeholder="Nombre *"
                autoFocus
                className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
            <div className="grid grid-cols-2 gap-2">
                <input type="text" value={editContactForm.role} onChange={onChangeField('role')} placeholder="Cargo"
                    className="px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                <input type="tel" value={editContactForm.phone} onChange={onChangeField('phone')} placeholder="Teléfono"
                    className="px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
            </div>
            <input type="email" value={editContactForm.email} onChange={onChangeField('email')} placeholder="Email"
                className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
            <select value={editContactForm.branch_id ?? ''}
                onChange={e => onChangeBranch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white">
                <option value="">Sin sucursal</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ''}</option>)}
            </select>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
                <button onClick={() => onSave(c.id)} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Guardar
                </button>
                <button onClick={onCancel}
                    className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
            </div>
        </div>
    );
    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg group hover:bg-white transition-all ${c.is_primary ? 'bg-amber-50' : 'bg-transparent'
            }`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${c.is_primary ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                {c.is_primary ? <Crown size={11} className="text-amber-600" /> : <UserCircle size={11} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{c.name}</span>
                    {c.is_primary && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1 py-0.5 rounded uppercase">Principal</span>}
                </div>
                {c.role && <p className="text-[11px] text-gray-400">{c.role}</p>}
                <div className="flex gap-2">
                    {c.phone && <a href={`tel:${c.phone}`} className="text-[11px] text-blue-600 hover:underline">{c.phone}</a>}
                    {c.email && <a href={`mailto:${c.email}`} className="text-[11px] text-blue-600 hover:underline">{c.email}</a>}
                </div>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {!c.is_primary && (
                    <button title="Marcar principal" onClick={() => onSetPrimary(c.id)}
                        className="p-1 text-gray-300 hover:text-amber-500 rounded transition-colors"><Crown size={12} /></button>
                )}
                <button onClick={() => onStartEdit(c)}
                    className="p-1 text-gray-300 hover:text-blue-500 rounded transition-colors"><Edit3 size={12} /></button>
                <button onClick={() => onDelete(c)}
                    className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 size={12} /></button>
            </div>
        </div>
    );
}


function BranchesAndContactsPanel({ supplierId }: { supplierId: number }) {
    // Queries
    const { data: branchesData, isLoading: loadingBranches } = useSupplierBranches(supplierId);
    const { data: contactsData, isLoading: loadingContacts } = useSupplierContacts(supplierId);
    const createBranch = useCreateSupplierBranch(supplierId);
    const updateBranch = useUpdateSupplierBranch(supplierId);
    const deleteBranch = useDeleteSupplierBranch(supplierId);
    const setMainBranch = useSetBranchMain(supplierId);
    const createContact = useCreateSupplierContact(supplierId);
    const updateContact = useUpdateSupplierContact(supplierId);
    const deleteContact = useDeleteSupplierContact(supplierId);
    const setPrimary = useSetContactPrimary(supplierId);

    const branches: SupplierBranch[] = branchesData?.data ?? [];
    const allContacts: SupplierContact[] = contactsData?.data ?? [];
    // Contactos sin sucursal asignada
    const unassignedContacts = allContacts.filter(c => !c.branch_id);

    // Panel state: 'branches' | 'contacts'
    const [activeTab, setActiveTab] = useState<'branches' | 'contacts'>('branches');

    // Branch form state
    const [showBranchForm, setShowBranchForm] = useState(false);
    const [branchForm, setBranchForm] = useState({ ...EMPTY_BRANCH });
    const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
    const [editBranchForm, setEditBranchForm] = useState({ ...EMPTY_BRANCH });

    // Contact form state
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({ ...EMPTY_CONTACT });
    const [editingContactId, setEditingContactId] = useState<number | null>(null);
    const [editContactForm, setEditContactForm] = useState({ ...EMPTY_CONTACT });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setBF = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setBranchForm(prev => ({ ...prev, [f]: e.target.value }));
    const setEBF = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setEditBranchForm(prev => ({ ...prev, [f]: e.target.value }));
    const setCF = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setContactForm(prev => ({ ...prev, [f]: e.target.value }));
    const setECF = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setEditContactForm(prev => ({ ...prev, [f]: e.target.value }));

    // ── Branch handlers ────────────────────────────────────────
    const handleCreateBranch = async () => {
        if (!branchForm.name.trim()) { setError('El nombre es obligatorio.'); return; }
        setError(null); setSaving(true);
        try { await createBranch.mutateAsync(branchForm); setBranchForm({ ...EMPTY_BRANCH }); setShowBranchForm(false); }
        catch (e: any) { setError(e?.response?.data?.message ?? 'Error al guardar.'); }
        finally { setSaving(false); }
    };
    const handleUpdateBranch = async (id: number) => {
        setSaving(true); setError(null);
        try { await updateBranch.mutateAsync({ branchId: id, data: editBranchForm }); setEditingBranchId(null); }
        catch (e: any) { setError(e?.response?.data?.message ?? 'Error al guardar.'); }
        finally { setSaving(false); }
    };
    const handleDeleteBranch = async (b: SupplierBranch) => {
        if (!confirm(`¿Eliminar sucursal "${b.name}"? Los contactos quedarán sin sucursal asignada.`)) return;
        await deleteBranch.mutateAsync(b.id);
    };

    // ── Contact handlers ───────────────────────────────────────
    const handleCreateContact = async () => {
        if (!contactForm.name.trim()) { setError('El nombre es obligatorio.'); return; }
        setError(null); setSaving(true);
        try {
            await createContact.mutateAsync({
                ...contactForm,
                branch_id: contactForm.branch_id || null,
            });
            setContactForm({ ...EMPTY_CONTACT }); setShowContactForm(false);
        } catch (e: any) { setError(e?.response?.data?.message ?? 'Error al guardar.'); }
        finally { setSaving(false); }
    };
    const handleUpdateContact = async (id: number) => {
        setSaving(true); setError(null);
        try { await updateContact.mutateAsync({ contactId: id, data: editContactForm }); setEditingContactId(null); }
        catch (e: any) { setError(e?.response?.data?.message ?? 'Error al guardar.'); }
        finally { setSaving(false); }
    };
    const handleDeleteContact = async (c: SupplierContact) => {
        if (!confirm(`¿Eliminar a "${c.name}"?`)) return;
        await deleteContact.mutateAsync(c.id);
    };
    const startEditContact = (c: SupplierContact) => {
        setEditingContactId(c.id);
        setEditContactForm({
            name: c.name, role: c.role ?? '', phone: c.phone ?? '',
            email: c.email ?? '', notes: c.notes ?? '', is_primary: c.is_primary,
            branch_id: c.branch_id
        });
    };

    // ContactCard se definió arriba como componente externo para evitar pérdida de focus.
    // Los props necesarios se pasan en el JSX más abajo.

    const loading = loadingBranches || loadingContacts;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header con tabs */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <button onClick={() => setActiveTab('branches')}
                            className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 pb-0.5 border-b-2 transition-colors ${activeTab === 'branches' ? 'text-white border-blue-400' : 'text-gray-400 border-transparent hover:text-gray-200'
                                }`}>
                            <Building size={12} /> Sucursales
                            <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{branches.length}</span>
                        </button>
                        <button onClick={() => setActiveTab('contacts')}
                            className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 pb-0.5 border-b-2 transition-colors ${activeTab === 'contacts' ? 'text-white border-blue-400' : 'text-gray-400 border-transparent hover:text-gray-200'
                                }`}>
                            <UserCircle size={12} /> Todos los Contactos
                            <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{allContacts.length}</span>
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            setError(null);
                            if (activeTab === 'branches') { setShowBranchForm(p => !p); setBranchForm({ ...EMPTY_BRANCH }); }
                            else { setShowContactForm(p => !p); setContactForm({ ...EMPTY_CONTACT }); }
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-200 hover:text-white transition-colors">
                        <Plus size={12} /> Agregar
                    </button>
                </div>
            </div>

            <div className="p-4">
                {loading && <div className="flex items-center gap-2 text-gray-400 py-4"><Loader2 size={14} className="animate-spin" /> Cargando...</div>}

                {/* ════════ TAB: SUCURSALES ════════ */}
                {!loading && activeTab === 'branches' && (
                    <div className="space-y-3">
                        {/* Formulario nueva sucursal */}
                        {showBranchForm && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                <p className="text-[10px] font-bold text-blue-800 uppercase">Nueva Sucursal</p>
                                <input type="text" placeholder="Nombre *" value={branchForm.name} onChange={setBF('name')}
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Ciudad" value={branchForm.city} onChange={setBF('city')}
                                        className="px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                    <input type="tel" placeholder="Teléfono" value={branchForm.phone} onChange={setBF('phone')}
                                        className="px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                </div>
                                <input type="text" placeholder="Dirección" value={branchForm.address} onChange={setBF('address')}
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <div onClick={() => setBranchForm(p => ({ ...p, is_main: !p.is_main }))}
                                        className={`relative w-9 h-5 rounded-full transition-colors ${branchForm.is_main ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${branchForm.is_main ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    <span className={`text-xs ${branchForm.is_main ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                                        {branchForm.is_main ? 'Sede principal ⭐' : 'Marcar como sede principal'}
                                    </span>
                                </label>
                                {error && <p className="text-xs text-red-600">{error}</p>}
                                <div className="flex gap-2">
                                    <button onClick={handleCreateBranch} disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Guardar
                                    </button>
                                    <button onClick={() => { setShowBranchForm(false); setError(null); }}
                                        className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                                </div>
                            </div>
                        )}

                        {branches.length === 0 && !showBranchForm && (
                            <p className="text-xs text-gray-400 italic text-center py-4">Sin sucursales. Agrega la primera sede.</p>
                        )}

                        {branches.map(branch => (
                            <div key={branch.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Branch header */}
                                {editingBranchId === branch.id ? (
                                    <div className="bg-blue-50 p-3 space-y-2">
                                        <input type="text" value={editBranchForm.name} onChange={setEBF('name')} placeholder="Nombre *"
                                            className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" value={editBranchForm.city} onChange={setEBF('city')} placeholder="Ciudad"
                                                className="px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                            <input type="tel" value={editBranchForm.phone} onChange={setEBF('phone')} placeholder="Teléfono"
                                                className="px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                        </div>
                                        <input type="text" value={editBranchForm.address} onChange={setEBF('address')} placeholder="Dirección"
                                            className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                        {error && <p className="text-xs text-red-600">{error}</p>}
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdateBranch(branch.id)} disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Guardar
                                            </button>
                                            <button onClick={() => { setEditingBranchId(null); setError(null); }}
                                                className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex items-center gap-3 px-4 py-3 group ${branch.is_main ? 'bg-amber-50' : 'bg-gray-50'
                                        }`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${branch.is_main ? 'bg-amber-100' : 'bg-gray-200'
                                            }`}>
                                            <Building size={14} className={branch.is_main ? 'text-amber-600' : 'text-gray-500'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-gray-800 text-sm">{branch.name}</span>
                                                {branch.is_main && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">Principal</span>}
                                            </div>
                                            <div className="flex gap-2 text-[11px] text-gray-400">
                                                {branch.city && <span>{branch.city}</span>}
                                                {branch.phone && <a href={`tel:${branch.phone}`} className="text-blue-600 hover:underline">{branch.phone}</a>}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0">{(branch.contacts ?? []).length} contacto(s)</span>
                                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!branch.is_main && (
                                                <button title="Marcar principal" onClick={() => setMainBranch.mutate(branch.id)}
                                                    className="p-1.5 text-gray-300 hover:text-amber-500 rounded-lg transition-colors"><Crown size={13} /></button>
                                            )}
                                            <button onClick={() => { setEditingBranchId(branch.id); setEditBranchForm({ name: branch.name, city: branch.city ?? '', address: branch.address ?? '', phone: branch.phone ?? '', email: branch.email ?? '', notes: branch.notes ?? '', is_main: branch.is_main }); }}
                                                className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={13} /></button>
                                            <button onClick={() => handleDeleteBranch(branch)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                )}

                                {/* Contacts in this branch */}
                                <div className="px-3 pb-2 bg-white divide-y divide-gray-50">
                                    {(branch.contacts ?? []).length === 0 && (
                                        <p className="text-[11px] text-gray-300 italic py-2 px-1">Sin contactos en esta sucursal.</p>
                                    )}
                                    {(branch.contacts ?? []).map(c => (
                                        <ContactCard key={c.id} c={c}
                                            branches={branches}
                                            editingContactId={editingContactId}
                                            editContactForm={editContactForm}
                                            saving={saving} error={error}
                                            onChangeField={setECF}
                                            onChangeBranch={val => setEditContactForm(p => ({ ...p, branch_id: val ? Number(val) : null }))}
                                            onSave={handleUpdateContact}
                                            onCancel={() => { setEditingContactId(null); setError(null); }}
                                            onStartEdit={startEditContact}
                                            onDelete={handleDeleteContact}
                                            onSetPrimary={id => setPrimary.mutate(id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Contactos sin sucursal */}
                        {unassignedContacts.length > 0 && (
                            <div className="border border-dashed border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                                    <UserCircle size={13} className="text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-500">Sin sucursal asignada</span>
                                </div>
                                <div className="px-3 pb-2 bg-white divide-y divide-gray-50">
                                    {unassignedContacts.map(c => (
                                        <ContactCard key={c.id} c={c}
                                            branches={branches}
                                            editingContactId={editingContactId}
                                            editContactForm={editContactForm}
                                            saving={saving} error={error}
                                            onChangeField={setECF}
                                            onChangeBranch={val => setEditContactForm(p => ({ ...p, branch_id: val ? Number(val) : null }))}
                                            onSave={handleUpdateContact}
                                            onCancel={() => { setEditingContactId(null); setError(null); }}
                                            onStartEdit={startEditContact}
                                            onDelete={handleDeleteContact}
                                            onSetPrimary={id => setPrimary.mutate(id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ════════ TAB: TODOS LOS CONTACTOS ════════ */}
                {!loading && activeTab === 'contacts' && (
                    <div className="space-y-3">
                        {/* Formulario nuevo contacto */}
                        {showContactForm && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                <p className="text-[10px] font-bold text-blue-800 uppercase">Nuevo Contacto</p>
                                <input type="text" placeholder="Nombre *" value={contactForm.name} onChange={setCF('name')}
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Cargo (Vendedora, Gerente...)" value={contactForm.role} onChange={setCF('role')}
                                        className="px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                    <input type="tel" placeholder="Teléfono / WhatsApp" value={contactForm.phone} onChange={setCF('phone')}
                                        className="px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                </div>
                                <input type="email" placeholder="Email" value={contactForm.email} onChange={setCF('email')}
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white" />
                                <select value={contactForm.branch_id ?? ''}
                                    onChange={e => setContactForm(p => ({ ...p, branch_id: e.target.value ? Number(e.target.value) : null }))}
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg outline-none bg-white">
                                    <option value="">Sin sucursal</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ''}</option>)}
                                </select>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <div onClick={() => setContactForm(p => ({ ...p, is_primary: !p.is_primary }))}
                                        className={`relative w-9 h-5 rounded-full transition-colors ${contactForm.is_primary ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${contactForm.is_primary ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </div>
                                    <span className={`text-xs ${contactForm.is_primary ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                                        {contactForm.is_primary ? 'Contacto principal ⭐' : 'Marcar como principal'}
                                    </span>
                                </label>
                                {error && <p className="text-xs text-red-600">{error}</p>}
                                <div className="flex gap-2">
                                    <button onClick={handleCreateContact} disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Guardar
                                    </button>
                                    <button onClick={() => { setShowContactForm(false); setError(null); }}
                                        className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                                </div>
                            </div>
                        )}

                        {allContacts.length === 0 && !showContactForm && (
                            <p className="text-xs text-gray-400 italic text-center py-4">Sin contactos registrados.</p>
                        )}

                        {/* Contactos agrupados por sucursal */}
                        {branches.map(branch => {
                            const branchContacts = allContacts.filter(c => c.branch_id === branch.id);
                            if (branchContacts.length === 0) return null;
                            return (
                                <div key={branch.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className={`flex items-center gap-2 px-3 py-2 ${branch.is_main ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                        <Building size={11} className={branch.is_main ? 'text-amber-500' : 'text-gray-400'} />
                                        <span className="text-xs font-semibold text-gray-600">{branch.name}</span>
                                        {branch.city && <span className="text-[10px] text-gray-400">— {branch.city}</span>}
                                        {branch.is_main && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full ml-auto">Sede Principal</span>}
                                        <span className="text-[9px] text-gray-400 ml-auto">{branchContacts.length} contacto{branchContacts.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="bg-white divide-y divide-gray-50 px-2">
                                        {branchContacts.map(c => (
                                            <ContactCard key={c.id} c={c}
                                                branches={branches}
                                                editingContactId={editingContactId}
                                                editContactForm={editContactForm}
                                                saving={saving} error={error}
                                                onChangeField={setECF}
                                                onChangeBranch={val => setEditContactForm(p => ({ ...p, branch_id: val ? Number(val) : null }))}
                                                onSave={handleUpdateContact}
                                                onCancel={() => { setEditingContactId(null); setError(null); }}
                                                onStartEdit={startEditContact}
                                                onDelete={handleDeleteContact}
                                                onSetPrimary={id => setPrimary.mutate(id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Contactos sin sucursal asignada */}
                        {(() => {
                            const unassigned = allContacts.filter(c => !c.branch_id);
                            if (unassigned.length === 0) return null;
                            return (
                                <div className="border border-dashed border-orange-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-50">
                                        <AlertCircle size={11} className="text-orange-400" />
                                        <span className="text-xs font-semibold text-orange-600">Sin sucursal asignada</span>
                                        <span className="text-[9px] text-orange-400 ml-auto">{unassigned.length} sin asignar</span>
                                    </div>
                                    <div className="bg-white divide-y divide-gray-50 px-2">
                                        {unassigned.map(c => (
                                            <ContactCard key={c.id} c={c}
                                                branches={branches}
                                                editingContactId={editingContactId}
                                                editContactForm={editContactForm}
                                                saving={saving} error={error}
                                                onChangeField={setECF}
                                                onChangeBranch={val => setEditContactForm(p => ({ ...p, branch_id: val ? Number(val) : null }))}
                                                onSave={handleUpdateContact}
                                                onCancel={() => { setEditingContactId(null); setError(null); }}
                                                onStartEdit={startEditContact}
                                                onDelete={handleDeleteContact}
                                                onSetPrimary={id => setPrimary.mutate(id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// Modal de edición de datos del proveedor
// ─────────────────────────────────────────────────────────────

function EditModal({ supplier, onClose }: { supplier: any; onClose: () => void }) {
    const updateSupplier = useUpdateSupplier();
    const [form, setForm] = useState({
        name: supplier.name ?? '',
        rif: supplier.rif ?? '',
        payment_terms: supplier.payment_terms ?? '',
        website: supplier.website ?? '',
        notes: supplier.notes ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSave = async () => {
        setError(null);
        if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
        setSaving(true);
        try {
            await updateSupplier.mutateAsync({ id: supplier.id, data: form });
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'No se pudo guardar. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <Edit3 size={14} /> Editar Proveedor
                    </h2>
                    <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-white text-xl leading-none disabled:opacity-40">×</button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre — ocupa las 2 columnas */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre *</label>
                        <input type="text" value={form.name} onChange={set('name')} disabled={saving}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50" />
                    </div>
                    {/* RIF */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">RIF</label>
                        <input type="text" placeholder="J-12345678-9" value={form.rif} onChange={set('rif')} disabled={saving}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50" />
                    </div>
                    {/* Condiciones de pago */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Condiciones de Pago</label>
                        <input type="text" placeholder="30 días, contado, crédito..." value={form.payment_terms} onChange={set('payment_terms')} disabled={saving}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50" />
                    </div>
                    {/* Sitio web */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sitio Web</label>
                        <input type="text" placeholder="proveedor.com" value={form.website} onChange={set('website')} disabled={saving}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-50" />
                    </div>
                    {/* Notas */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notas Internas</label>
                        <textarea value={form.notes} onChange={set('notes')} rows={2} disabled={saving}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none disabled:bg-gray-50" />
                    </div>
                    {error && (
                        <div className="md:col-span-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                            <AlertCircle size={14} className="flex-shrink-0" />{error}
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button onClick={onClose} disabled={saving}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}



// ─────────────────────────────────────────────────────────────
// Panel tipo "carrito": múltiples productos + guardado masivo
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function AddProductPanel({
    supplierId,
    assignedVariantIds,   // IDs de variantes ya asignadas a este proveedor
    onAdded,
}: {
    supplierId: number;
    assignedVariantIds: Set<number>;
    onAdded: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<VariantSearchResult[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [page, setPage] = useState(1);
    const [searching, setSearching] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const createOffer = useCreateOffer();

    // IDs ya en el carrito temporal
    const cartIds = new Set(cart.map(c => c.variant.id));

    // ── Fetch paginado ─────────────────────────────────────────
    const fetchResults = useCallback(async (val: string, pageNum: number) => {
        if (!val.trim()) { setResults([]); setTotalResults(0); return; }
        setSearching(true);
        try {
            const res = await api.get('/api/products', {
                params: { search: val, per_page: PAGE_SIZE, page: pageNum }
            });
            const raw = res.data?.data ?? [];
            const variants: VariantSearchResult[] = [];
            for (const product of raw) {
                for (const v of product.variants ?? []) {
                    variants.push({
                        id: v.id,
                        sku: v.sku,
                        name: v.name,
                        sale_unit_id: v.sale_unit_id ?? v.sale_unit?.id,
                        sale_unit: v.sale_unit,
                        product: { id: product.id, name: product.name },
                    });
                }
            }
            setResults(prev => pageNum === 1 ? variants : [...prev, ...variants]);
            setTotalResults(res.data?.meta?.total ?? res.data?.total ?? variants.length);
        } catch { setResults([]); }
        finally { setSearching(false); }
    }, []);

    const handleSearch = useCallback((val: string) => {
        setQuery(val);
        setPage(1);
        if (!val.trim()) { setResults([]); setTotalResults(0); return; }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchResults(val, 1), 300);
    }, [fetchResults]);

    const handleClearSearch = () => {
        setQuery('');
        setResults([]);
        setTotalResults(0);
        setPage(1);
        inputRef.current?.focus();
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(query, nextPage);
    };

    // ── Agregar al carrito (sin borrar búsqueda) ───────────────
    const addToCart = (v: VariantSearchResult) => {
        if (cartIds.has(v.id) || assignedVariantIds.has(v.id)) return;
        setCart(prev => [...prev, { variant: v, cost: '', isPreferred: false, status: 'pending' }]);
    };

    const updateItem = (id: number, field: 'cost' | 'isPreferred', value: any) =>
        setCart(prev => prev.map(c => c.variant.id === id ? { ...c, [field]: value } : c));

    const removeItem = (id: number) =>
        setCart(prev => prev.filter(c => c.variant.id !== id));

    // ── Guardar todo ──────────────────────────────────────────
    const handleSaveAll = async () => {
        if (cart.length === 0) return;
        setGlobalError(null);
        setSaving(true);
        setCart(prev => prev.map(c => ({ ...c, status: 'saving' as const })));

        let anyError = false;
        const updated = [...cart];

        for (let i = 0; i < updated.length; i++) {
            const item = updated[i];
            const costVal = item.cost.trim() ? parseFloat(item.cost) : null;
            if (costVal !== null && (isNaN(costVal) || costVal < 0)) {
                updated[i] = { ...item, status: 'error', errorMsg: 'Costo inválido' };
                anyError = true; continue;
            }
            if (!item.variant.sale_unit_id) {
                updated[i] = { ...item, status: 'error', errorMsg: 'Sin unidad de medida' };
                anyError = true; continue;
            }
            try {
                await createOffer.mutateAsync({
                    variantId: item.variant.id,
                    data: {
                        supplier_id: supplierId,
                        cost: costVal ?? 0,
                        purchase_unit_id: item.variant.sale_unit_id,
                        is_preferred: item.isPreferred,
                        is_active: true,
                    } as any,
                });
                updated[i] = { ...item, status: 'ok' };
            } catch (e: any) {
                updated[i] = { ...item, status: 'error', errorMsg: e?.response?.data?.message ?? 'Error al guardar' };
                anyError = true;
            }
            setCart([...updated]);
        }

        setSaving(false);
        if (!anyError) {
            setTimeout(() => { setCart([]); setOpen(false); handleClearSearch(); onAdded(); }, 700);
        } else {
            setCart(updated.filter(c => c.status !== 'ok'));
            setGlobalError('Algunos productos no pudieron guardarse.');
            onAdded();
        }
    };

    const pendingCount = cart.filter(c => c.status === 'pending').length;

    const handleClose = () => {
        setOpen(false); setCart([]); handleClearSearch();
        setPage(1); setTotalResults(0); setGlobalError(null);
    };

    if (!open) {
        return (
            <button
                onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-sm font-medium transition-all"
            >
                <Plus size={16} /> Agregar Productos a este Proveedor
            </button>
        );
    }

    return (
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl overflow-hidden">

            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus size={14} /> Agregar Productos
                    {cart.length > 0 && (
                        <span className="bg-white text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {cart.length}
                        </span>
                    )}
                </span>
                <button onClick={handleClose} className="text-blue-200 hover:text-white transition-colors">
                    <XIcon size={16} />
                </button>
            </div>

            <div className="p-4 space-y-4">

                {/* ── Buscador ── */}
                <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1.5">
                        Buscar y agregar productos
                    </label>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Nombre o SKU del producto..."
                            className="w-full pl-9 pr-16 py-2.5 text-sm border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        {/* Spinner de búsqueda + botón limpiar */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searching && <Loader2 size={13} className="text-blue-400 animate-spin" />}
                            {query && !searching && (
                                <button
                                    onClick={handleClearSearch}
                                    title="Limpiar búsqueda"
                                    className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <XIcon size={10} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Dropdown */}
                    {results.length > 0 && (
                        <div className="mt-1 bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden">
                            {/* Contador */}
                            <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                                <span className="text-[10px] text-blue-600 font-semibold">
                                    {results.length} de {totalResults} resultado{totalResults !== 1 ? 's' : ''}
                                </span>
                                {(cartIds.size + [...results].filter(v => assignedVariantIds.has(v.id)).length) > 0 && (
                                    <span className="text-[10px] text-green-600 font-semibold">
                                        {cartIds.size} en lista · {[...results].filter(v => assignedVariantIds.has(v.id)).length} ya asignados
                                    </span>
                                )}
                            </div>

                            <div className="max-h-52 overflow-y-auto">
                                {results.map(v => {
                                    const inCart = cartIds.has(v.id);
                                    const alreadyAssigned = assignedVariantIds.has(v.id);
                                    const disabled = inCart || alreadyAssigned;

                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => { if (!disabled) addToCart(v); }}
                                            disabled={disabled}
                                            className={`w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 flex items-center justify-between gap-2 transition-colors
                                                ${alreadyAssigned ? 'bg-gray-50 cursor-default'
                                                    : inCart ? 'bg-green-50 cursor-default'
                                                        : 'hover:bg-blue-50 cursor-pointer'}`}
                                        >
                                            <div>
                                                <p className={`text-sm font-semibold ${alreadyAssigned ? 'text-gray-400' : 'text-gray-800'}`}>
                                                    {v.product.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {v.name ?? 'Sin nombre'}{v.sku ? ` · ${v.sku}` : ''} · {v.sale_unit?.abbreviation ?? 'sin unidad'}
                                                </p>
                                            </div>
                                            {alreadyAssigned
                                                ? <span className="text-[10px] font-bold text-gray-400 flex-shrink-0 italic">Ya asignado</span>
                                                : inCart
                                                    ? <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5 flex-shrink-0"><CheckCircle size={11} /> En lista</span>
                                                    : <span className="text-[10px] font-bold text-blue-500 flex-shrink-0">+ Agregar</span>
                                            }
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Ver más */}
                            {results.length < totalResults && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={searching}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-blue-600 hover:bg-blue-50 border-t border-blue-100 transition-colors disabled:opacity-50"
                                >
                                    {searching
                                        ? <><Loader2 size={11} className="animate-spin" /> Cargando...</>
                                        : <>Ver más resultados ({totalResults - results.length} restantes)</>
                                    }
                                </button>
                            )}
                        </div>
                    )}
                    {query && !searching && results.length === 0 && (
                        <p className="text-xs text-gray-400 italic mt-1.5 px-1">Sin resultados para "{query}"</p>
                    )}
                </div>

                {/* ── Lista del carrito ── */}
                {cart.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                            Productos a agregar ({cart.length})
                        </p>

                        {cart.map(item => {
                            const unit = item.variant.sale_unit?.abbreviation ?? 'u';
                            const isOk = item.status === 'ok';
                            const isErr = item.status === 'error';
                            const isSav = item.status === 'saving';

                            return (
                                <div
                                    key={item.variant.id}
                                    className={`rounded-xl border p-3 transition-all ${isOk ? 'bg-green-50 border-green-200' : isErr ? 'bg-red-50 border-red-200' : isSav ? 'bg-blue-50 border-blue-200 opacity-70' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 flex-shrink-0">
                                            {isOk && <CheckCircle size={15} className="text-green-600" />}
                                            {isErr && <AlertCircle size={15} className="text-red-500" />}
                                            {isSav && <Loader2 size={15} className="text-blue-500 animate-spin" />}
                                            {item.status === 'pending' && <Package size={15} className="text-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.variant.product.name}</p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {item.variant.name ?? ''}{item.variant.sku ? ` · ${item.variant.sku}` : ''} · {unit}
                                            </p>
                                            {isErr && <p className="text-xs text-red-600 mt-0.5">{item.errorMsg}</p>}
                                        </div>
                                        {item.status === 'pending' && (
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <button
                                                    title={item.isPreferred ? 'Quitar preferido' : 'Marcar como preferido'}
                                                    onClick={() => updateItem(item.variant.id, 'isPreferred', !item.isPreferred)}
                                                    className={`p-1 rounded-lg transition-colors ${item.isPreferred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                                                >
                                                    <Star size={14} className={item.isPreferred ? 'fill-amber-400' : ''} />
                                                </button>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                                    <input
                                                        type="number" step="0.0001" min="0"
                                                        value={item.cost}
                                                        onChange={e => updateItem(item.variant.id, 'cost', e.target.value)}
                                                        placeholder="Precio"
                                                        title={`Costo por ${unit} (opcional)`}
                                                        className="pl-5 pr-1 py-1 w-24 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.variant.id)}
                                                    className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                                                    title="Quitar de la lista"
                                                >
                                                    <XIcon size={14} />
                                                </button>
                                            </div>
                                        )}
                                        {isOk && <span className="text-xs text-green-600 font-bold flex-shrink-0">¡Guardado!</span>}
                                    </div>
                                </div>
                            );
                        })}

                        {globalError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{globalError}</div>
                        )}

                        <button
                            onClick={handleSaveAll}
                            disabled={saving || pendingCount === 0}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {saving
                                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                                : <><CheckCircle size={15} /> Guardar {pendingCount} producto{pendingCount !== 1 ? 's' : ''}</>
                            }
                        </button>
                    </div>
                )}

                {cart.length === 0 && (
                    <p className="text-xs text-blue-400 italic text-center py-2">
                        Buscá productos arriba para agregarlos a la lista.
                    </p>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Página principal de detalle
// ─────────────────────────────────────────────────────────────

export default function SupplierDetailPage() {
    const params = useParams();
    const supplierId = Number(params.id);
    const [showEdit, setShowEdit] = useState(false);

    const { data, isLoading, isError, refetch } = useSupplier(supplierId);
    const deactivate = useDeactivateSupplier();
    const activate = useActivateSupplier();

    const supplier = data?.data as any;

    const handleToggleActive = async () => {
        if (!supplier) return;
        if (supplier.is_active) {
            if (!confirm(`¿Desactivar a "${supplier.name}"?`)) return;
            await deactivate.mutateAsync(supplierId);
        } else {
            await activate.mutateAsync(supplierId);
        }
        refetch();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32 gap-3 text-gray-400">
                <RefreshCw size={22} className="animate-spin" />
                <span>Cargando proveedor...</span>
            </div>
        );
    }

    if (isError || !supplier) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-red-500">
                <AlertCircle size={32} />
                <p className="font-medium">Proveedor no encontrado</p>
                <Link href="/admin/suppliers" className="text-sm text-blue-600 underline">Volver a Proveedores</Link>
            </div>
        );
    }

    const productOffers: ProductOffer[] = supplier.product_offers ?? [];
    const preferredOffers = productOffers.filter(o => o.is_preferred);
    const regularOffers = productOffers.filter(o => !o.is_preferred);
    const assignedVariantIds = new Set<number>(productOffers.map(o => o.variant.id));

    // Contacto principal desde la API (puede ser null si ninguno está marcado)
    const primaryContact = supplier.primary_contact ?? null;

    return (
        <>
            {showEdit && <EditModal supplier={supplier} onClose={() => { setShowEdit(false); refetch(); }} />}

            <div className="max-w-5xl mx-auto space-y-5">

                {/* ══════════════════════════════════════════════════
                    HEADER — nombre, estado, breadcrumb, acciones
                ══════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
                            <ChevronRight size={12} />
                            <Link href="/admin/suppliers" className="hover:text-white transition-colors">Proveedores</Link>
                            <ChevronRight size={12} />
                            <span className="text-slate-300 truncate max-w-[200px]">{supplier.name}</span>
                        </div>
                        {/* Nombre + estado */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Building2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white leading-tight">{supplier.name}</h1>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {supplier.rif && (
                                            <span className="text-xs text-slate-400 font-mono">{supplier.rif}</span>
                                        )}
                                        {supplier.is_active ? (
                                            <span className="text-[10px] font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">Activo</span>
                                        ) : (
                                            <span className="text-[10px] font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">Inactivo</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Acciones */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Link href="/admin/suppliers"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                    <ArrowLeft size={12} /> Volver
                                </Link>
                                <button onClick={() => setShowEdit(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-200 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors">
                                    <Edit3 size={12} /> Editar
                                </button>
                                <button onClick={handleToggleActive}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${supplier.is_active
                                        ? 'text-red-300 bg-red-500/20 border-red-500/30 hover:bg-red-500/30'
                                        : 'text-green-300 bg-green-500/20 border-green-500/30 hover:bg-green-500/30'
                                        }`}>
                                    {supplier.is_active ? <><XCircle size={12} /> Desactivar</> : <><CheckCircle size={12} /> Activar</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    CONTENIDO PRINCIPAL — 2 columnas en desktop
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── COLUMNA IZQUIERDA: Datos de la empresa ── */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* Datos de la empresa */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building2 size={13} className="text-slate-500" /> Datos de la Empresa
                                </h2>
                                <button onClick={() => setShowEdit(true)}
                                    className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50">
                                    <Edit3 size={12} />
                                </button>
                            </div>
                            <div className="p-5 space-y-3">
                                {supplier.rif && (
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs text-gray-400 font-medium mt-0.5">RIF</span>
                                        <span className="font-mono text-sm font-semibold text-gray-800">{supplier.rif}</span>
                                    </div>
                                )}
                                {supplier.payment_terms && (
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-gray-400 font-medium mt-0.5 flex-shrink-0">Pago</span>
                                        <span className="text-sm text-gray-700 text-right">{supplier.payment_terms}</span>
                                    </div>
                                )}
                                {supplier.website && (
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-gray-400 font-medium mt-0.5 flex-shrink-0">Web</span>
                                        <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline text-right truncate max-w-[160px]">
                                            {supplier.website}
                                        </a>
                                    </div>
                                )}
                                {!supplier.rif && !supplier.payment_terms && !supplier.website && (
                                    <p className="text-xs text-gray-400 italic text-center py-2">
                                        Sin datos registrados. <button onClick={() => setShowEdit(true)} className="text-blue-500 hover:underline">Editar</button>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Notas internas */}
                        {supplier.notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={13} className="text-amber-600" />
                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Notas Internas</span>
                                </div>
                                <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{supplier.notes}</p>
                            </div>
                        )}

                        {/* Stats rápidos */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Resumen</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center bg-gray-50 rounded-xl p-3">
                                    <p className="text-2xl font-bold text-gray-800">{productOffers.length}</p>
                                    <p className="text-[10px] text-gray-400 uppercase mt-0.5">Productos</p>
                                </div>
                                <div className="text-center bg-amber-50 rounded-xl p-3">
                                    <p className="text-2xl font-bold text-amber-600">{preferredOffers.length}</p>
                                    <p className="text-[10px] text-amber-400 uppercase mt-0.5">Preferidos</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-400">Proveedor desde</span>
                                <span className="text-xs text-gray-600 font-medium">
                                    {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('es-VE') : '—'}
                                </span>
                            </div>
                        </div>

                        {/* Contacto principal — acceso rápido */}
                        {primaryContact && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100">
                                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <UserCircle size={13} className="text-slate-500" /> Contacto Principal
                                    </h2>
                                </div>
                                <div className="p-5 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Crown size={14} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{primaryContact.name}</p>
                                            {primaryContact.role && (
                                                <p className="text-xs text-gray-400">{primaryContact.role}</p>
                                            )}
                                        </div>
                                    </div>
                                    {primaryContact.phone && (
                                        <a href={`tel:${primaryContact.phone}`}
                                            className="flex items-center gap-2 text-xs text-blue-600 hover:underline mt-1">
                                            <Phone size={11} className="text-gray-400" />{primaryContact.phone}
                                        </a>
                                    )}
                                    {primaryContact.email && (
                                        <a href={`mailto:${primaryContact.email}`}
                                            className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                            <Mail size={11} className="text-gray-400" />{primaryContact.email}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── COLUMNA DERECHA (2/3): Contactos+Sucursales y Productos ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Sección: Sucursales y Contactos */}
                        <BranchesAndContactsPanel supplierId={supplierId} />

                        {/* Sección: Productos que suministra */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Package size={13} /> Productos que Suministra
                                </h2>
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {productOffers.length}
                                </span>
                            </div>

                            <div className="p-5 space-y-4">
                                {preferredOffers.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                                            <Star size={10} className="fill-amber-400" /> Proveedor Preferido Para
                                        </p>
                                        <div className="space-y-2">
                                            {preferredOffers.map(offer => (
                                                <OfferCard key={offer.id} offer={offer} onRefresh={refetch} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {regularOffers.length > 0 && (
                                    <div>
                                        {preferredOffers.length > 0 && (
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 mt-4">Otros Productos</p>
                                        )}
                                        <div className="space-y-2">
                                            {regularOffers.map(offer => (
                                                <OfferCard key={offer.id} offer={offer} onRefresh={refetch} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productOffers.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <Package size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Sin productos asignados aún.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Panel agregar producto */}
                        <AddProductPanel
                            supplierId={supplierId}
                            assignedVariantIds={assignedVariantIds}
                            onAdded={refetch}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}