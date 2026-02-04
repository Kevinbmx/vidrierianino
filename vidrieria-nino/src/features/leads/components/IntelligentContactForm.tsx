'use client';

import React, { useState } from 'react';
import { useCreateLead } from '../api/leads';
import { CreateLeadDTO, LEAD_LOCATIONS } from '../types';

export const IntelligentContactForm = () => {
    const { mutate: createLead, isPending, isSuccess } = useCreateLead();
    const [formData, setFormData] = useState<CreateLeadDTO>({
        name: '',
        phone: '',
        email: '',
        location: LEAD_LOCATIONS[0], // Default 'Montero'
        project_type: ''
    });

    const [showRemoteMessage, setShowRemoteMessage] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'location') {
            const isRemote = value !== 'Montero';
            setShowRemoteMessage(isRemote);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createLead(formData, {
            onSuccess: () => {
                // Optional: Reset form or show success modal
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">¡Gracias por contactarnos!</h3>
                <p className="text-green-700">
                    Hemos recibido sus datos correctamente.{' '}
                    {showRemoteMessage
                        ? 'Un asesor le contactará pronto para coordinar la videollamada.'
                        : 'Pronto nos pondremos en contacto para coordinar su visita.'}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ej. 70012345"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="ejemplo@email.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Dónde se encuentra su proyecto?</label>
                <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                    {LEAD_LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>

            {showRemoteMessage && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {/* Icon placeholder */}
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Para proyectos fuera de Montero, ofrecemos un proceso especial con
                                <span className="font-bold"> videollamada técnica inicial sin costo</span>.
                                Un asesor se contactará con usted para explicarle.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proyecto</label>
                <input
                    type="text"
                    name="project_type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ej. Ventanas para casa nueva, Mampara de baño..."
                    value={formData.project_type}
                    onChange={handleChange}
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                    ${isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'} 
                    transition-all duration-200`}
            >
                {isPending ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                    </span>
                ) : (
                    'Solicitar Presupuesto / Visita'
                )}
            </button>
        </form>
    );
};
