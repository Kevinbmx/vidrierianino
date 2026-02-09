import React, { useState } from 'react';
import { useScheduleAppointment } from '../api/leads';
import { AppointmentType } from '../types';

interface AppointmentModalProps {
    leadId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const AppointmentModal = ({ leadId, isOpen, onClose }: AppointmentModalProps) => {
    const { mutate: schedule, isPending } = useScheduleAppointment();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState<AppointmentType>('visita');
    const [address, setAddress] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Combine date and time into ISO string
        const appointmentAt = new Date(`${date}T${time}`).toISOString();

        schedule({
            id: leadId,
            data: {
                appointment_at: appointmentAt,
                appointment_type: type,
                address_details: address || undefined,
            }
        }, {
            onSuccess: () => {
                onClose();
                // Reset form?
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Agendar Cita</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as AppointmentType)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="visita">Visita Técnica</option>
                            <option value="videollamada">Videollamada</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hora</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    {type === 'visita' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección / Detalles</label>
                            <textarea
                                required={type === 'visita'}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Dirección específica o referencias (Obligatorio para visitas)..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPending ? 'Agendando...' : 'Confirmar Cita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
