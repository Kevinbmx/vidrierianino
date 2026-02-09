import React, { useState } from 'react';
import { useLead, useGetWhatsAppLink, useCancelAppointment, useUpdateStatus } from '../api/leads';
import { LeadStatusBadge } from './LeadStatusBadge';
import { StatusHistoryTimeline } from './StatusHistoryTimeline';
import { AppointmentModal } from './AppointmentModal';
import { SendQuoteModal } from './SendQuoteModal';
import { AppointmentHistoryModal } from './AppointmentHistoryModal';
import { Lead, STATUS_LABELS } from '../types';

interface LeadDetailsModalProps {
    leadId: number | null;
    onClose: () => void;
}

export const LeadDetailsModal = ({ leadId, onClose }: LeadDetailsModalProps) => {
    // 1. Force refetch on mount to ensure fresh data
    const { data: lead, isLoading, error, refetch } = useLead(leadId || 0);
    const { mutateAsync: getWhatsApp } = useGetWhatsAppLink();
    const { mutateAsync: cancelAppointment } = useCancelAppointment();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateStatus();

    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isApptHistoryOpen, setIsApptHistoryOpen] = useState(false);
    const [waLoading, setWaLoading] = useState(false);

    // Calculate time in status
    const getTimeInStatus = () => {
        if (!lead) return '';
        // If status_history exists and has entries, use the latest one. Otherwise use updated_at.
        const lastChange = lead.status_history && lead.status_history.length > 0
            ? new Date(lead.status_history[0].created_at) // Assuming sorted desc
            : new Date(lead.updated_at);

        const now = new Date();
        const diffMs = now.getTime() - lastChange.getTime();

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days}d ${hours}h`;
    };

    if (!leadId) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="font-medium text-gray-700">Cargando detalles...</p>
                </div>
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p className="text-sm text-gray-500 mb-6">No se pudo obtener la información del lead. Por favor intente nuevamente.</p>
                    <div className="flex justify-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">Cerrar</button>
                        <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white">Reintentar</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleWhatsAppClick = async (template: string = 'hello') => {
        try {
            setWaLoading(true);
            const link = await getWhatsApp({ id: lead.id, template });
            window.open(link, '_blank');
        } catch (e) {
            alert('Error al generar enlace de WhatsApp');
        } finally {
            setWaLoading(false);
        }
    };

    const handleStatusUpdate = (newStatus: any) => {
        if (confirm(`¿Cambiar estado a ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus}?`)) {
            updateStatus({ id: lead.id, data: { status: newStatus } });
        }
    };

    /**
     * Render Quick Actions based on Status Flow
     */
    const renderQuickActions = () => {
        if (isUpdatingStatus) {
            return (
                <div className="flex flex-col gap-3 items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">Actualizando estado...</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-3">
                {/* 1. NEW STATUS FLOW */}
                {lead.status === 'new' && (
                    <>
                        <button
                            onClick={() => handleWhatsAppClick('hello')}
                            disabled={waLoading}
                            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                        >
                            WhatsApp (Saludo Inicial)
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('contacted')}
                            className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium"
                        >
                            Marcar Contactado
                        </button>
                    </>
                )}

                {/* 2. CONTACTED FLOW - Schedule Appointment */}
                {lead.status === 'contacted' && (
                    <>
                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                            Agendar Cita / Videollamada
                        </button>
                        <button
                            onClick={() => handleWhatsAppClick('visit_coordination')}
                            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                            WhatsApp: Coordinar Visita
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('no_answer')}
                            className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                            Sin Respuesta
                        </button>
                    </>
                )}

                {/* RE-ENGAGEMENT ACTIONS (For No Answer or others) */}
                {lead.status === 'no_answer' && (
                    <>
                        <button
                            onClick={() => handleWhatsAppClick('hello')} // Or a specific re-engagement template
                            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                            Intentar Contactar de Nuevo (WhatsApp)
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('contacted')}
                            className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium"
                        >
                            Reactivar (Marcar Contactado)
                        </button>
                    </>
                )}

                {/* 3. APPOINTMENT SCHEDULED FLOW */}
                {lead.status === 'appointment_scheduled' && lead.appointment_at && (
                    <>
                        <div className="bg-blue-50 p-2 rounded text-sm text-blue-800 mb-2">
                            Cita confirmada: <br />
                            <strong>{new Date(lead.appointment_at).toLocaleString()}</strong>
                        </div>

                        <button
                            onClick={async () => {
                                const reason = prompt('Motivo de la cancelación:');
                                if (reason) {
                                    try {
                                        await cancelAppointment({ id: lead.id, reason });
                                        alert('Cita cancelada correctamente');
                                    } catch (e) {
                                        alert('Error al cancelar cita');
                                    }
                                }
                            }}
                            className="w-full py-2 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 font-medium"
                        >
                            Cancelar Cita
                        </button>
                        <button
                            onClick={() => handleWhatsAppClick('appointment_reminder')}
                            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                            WhatsApp: Confirmación Cita
                        </button>

                        <button
                            onClick={() => handleStatusUpdate('visit_done')}
                            className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-bold mt-2"
                        >
                            ✅ Visita / Cita Realizada
                        </button>
                    </>
                )}

                {/* 4. VISIT DONE -> QUOTE */}
                {(lead.status === 'visit_done') && (
                    <>
                        <button
                            onClick={() => setIsQuoteModalOpen(true)}
                            className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                        >
                            Enviar Presupuesto
                        </button>
                        <button
                            // Implemented as placeholder, needs actual upload modal
                            onClick={() => alert('Función de subir fotos próximamente')}
                            className="w-full py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded text-sm"
                        >
                            Subir Fotos / Notas de Visita
                        </button>
                    </>
                )}

                {/* 5. QUOTED */}
                {lead.status === 'quoted' && (
                    <>
                        <button
                            onClick={() => handleStatusUpdate('approved')}
                            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                        >
                            Aprobar Proyecto
                        </button>
                        <button
                            onClick={() => handleWhatsAppClick('quote_sent')}
                            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                            WhatsApp: Seguimiento
                        </button>
                    </>
                )}

                {/* GLOBAL ACTIONS (Always visible if applicable) */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <button
                        onClick={() => setIsApptHistoryOpen(true)}
                        className="text-gray-500 text-xs hover:text-gray-700 underline"
                    >
                        Ver Historial de Citas
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-start sticky top-0 bg-white rounded-t-lg z-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                                <LeadStatusBadge status={lead.status} />
                            </div>
                            <p className="text-gray-500 mt-1 flex gap-2">
                                <span>ID: #{lead.id}</span>
                                <span className="text-gray-300">|</span>
                                <span className="font-mono text-blue-600 bg-blue-50 px-1 rounded" title="Tiempo en estado actual">
                                    ⏱ {getTimeInStatus()}
                                </span>
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Left Column: Info */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Contact Info */}
                                <section className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Información de Contacto</h3>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                        <div>
                                            <dt className="text-gray-500">Teléfono</dt>
                                            <dd className="font-medium text-gray-900 flex items-center gap-2">
                                                {lead.phone}
                                                <button
                                                    onClick={() => handleWhatsAppClick('hello')}
                                                    disabled={waLoading}
                                                    className="text-green-600 hover:text-green-800 text-xs border border-green-200 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"
                                                >
                                                    WhatsApp
                                                </button>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Email</dt>
                                            <dd className="font-medium text-gray-900">{lead.email || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Ubicación</dt>
                                            <dd className="font-medium text-gray-900">{lead.location} {lead.is_local ? '(Local)' : '(Remoto)'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Proyecto</dt>
                                            <dd className="font-medium text-gray-900">{lead.project_type}</dd>
                                        </div>
                                    </dl>
                                </section>

                                {/* Appointment Info if exists */}
                                {lead.appointment_at && (
                                    <section className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h3 className="font-semibold text-blue-900 mb-3 border-b border-blue-200 pb-2">
                                            Cita Programada
                                        </h3>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                            <div>
                                                <dt className="text-blue-700">Fecha y Hora</dt>
                                                <dd className="font-medium text-blue-900">
                                                    {new Date(lead.appointment_at).toLocaleString()}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-blue-700">Tipo</dt>
                                                <dd className="font-medium text-blue-900 capitalize">{lead.appointment_type}</dd>
                                            </div>
                                            {lead.address_details && (
                                                <div className="sm:col-span-2">
                                                    <dt className="text-blue-700">Detalles/Dirección</dt>
                                                    <dd className="font-medium text-blue-900">{lead.address_details}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </section>
                                )}
                            </div>

                            {/* Right Column: Actions & History */}
                            <div className="space-y-6">
                                {/* Actions Box */}
                                <div className="bg-white p-4 rounded-lg border shadow-sm ring-1 ring-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Acciones Rápidas</h3>
                                    {renderQuickActions()}
                                </div>

                                {/* History Timeline */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Historial de Estados</h3>
                                    <StatusHistoryTimeline history={lead.status_history} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50 flex justify-end sticky bottom-0 rounded-b-lg">
                        <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Modals */}
            <AppointmentModal
                leadId={lead.id}
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
            />
            <SendQuoteModal
                leadId={lead.id}
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
            />
            <AppointmentHistoryModal
                history={lead.appointment_history}
                isOpen={isApptHistoryOpen}
                onClose={() => setIsApptHistoryOpen(false)}
            />
        </>
    );
};
