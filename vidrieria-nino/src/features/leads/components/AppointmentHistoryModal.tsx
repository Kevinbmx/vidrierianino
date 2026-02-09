import React from 'react';
import { LeadAppointmentHistory } from '../types';

interface AppointmentHistoryModalProps {
    history?: LeadAppointmentHistory[];
    isOpen: boolean;
    onClose: () => void;
}

export const AppointmentHistoryModal = ({ history, isOpen, onClose }: AppointmentHistoryModalProps) => {
    if (!isOpen) return null;

    if (!history || history.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h2 className="text-lg font-bold mb-4">Historial de Citas</h2>
                    <p className="text-gray-500 text-center py-4">No hay historial de citas registrado.</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Cerrar</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold">Historial de Citas</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">Cerrar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-4">
                    {history.map((record) => (
                        <div
                            key={record.id}
                            className={`p-4 rounded-lg border-l-4 ${record.type === 'cancelled' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`font-bold ${record.type === 'cancelled' ? 'text-red-700' : 'text-blue-700'}`}>
                                        {record.type === 'cancelled' ? 'Cita Cancelada' : 'Cita Agendada'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Fecha Cita: <span className="font-medium">{new Date(record.appointment_at).toLocaleString()}</span>
                                    </p>
                                    {record.appointment_type && (
                                        <p className="text-sm text-gray-600">
                                            Tipo: {record.appointment_type}
                                        </p>
                                    )}
                                    {record.reason && (
                                        <p className="text-sm text-red-600 mt-2 bg-white/50 p-2 rounded">
                                            Motivo: {record.reason}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    <p>{new Date(record.created_at).toLocaleString()}</p>
                                    <p>Por: {record.user_name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
