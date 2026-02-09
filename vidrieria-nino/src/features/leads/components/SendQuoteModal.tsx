import React, { useState } from 'react';
import { useSendQuote } from '../api/leads';

interface SendQuoteModalProps {
    leadId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const SendQuoteModal = ({ leadId, isOpen, onClose }: SendQuoteModalProps) => {
    const { mutate: sendQuote, isPending } = useSendQuote();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [file, setFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('amount', amount);
        if (note) formData.append('note', note);
        if (file) formData.append('attachment', file);

        sendQuote({
            id: leadId,
            data: formData,
        }, {
            onSuccess: () => {
                onClose();
                setAmount('');
                setNote('');
                setFile(null);
                alert('Cotización enviada correctamente por correo.');
            },
            onError: () => {
                alert('Error al enviar la cotización.');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Enviar Cotización Formal</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Se enviará un PDF con la cotización al correo del cliente. Puede adjuntar un archivo adicional.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Monto Total (Bs.)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nota / Detalles Adicionales</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Detalles sobre materiales, plazos, etc..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adjuntar Archivo (Opcional)</label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                        {file && <p className="text-xs text-green-600 mt-1">Archivo seleccionado: {file.name}</p>}
                    </div>

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
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {isPending ? 'Enviando...' : 'Enviar Cotización'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
