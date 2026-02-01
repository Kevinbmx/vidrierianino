"use client";
import React from 'react';
import { AiOutlineSend } from "react-icons/ai";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white dark:bg-background-dark overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl">
          {/* Left Column - Image */}
          <div className="lg:w-1/2 relative min-h-[400px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url(/images/works/trabajo-vidrieria-nino-3.jpg)' }}
            />
            <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] flex flex-col justify-end p-12 text-white">
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl border border-white/30">
                <h3 className="text-2xl font-black mb-4 leading-tight">Comprometidos con su Tiempo</h3>
                <p className="text-base opacity-95 leading-relaxed">
                  Entendemos que su obra no puede esperar. Garantizamos una respuesta técnica y económica en menos de 24 horas hábiles.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:w-1/2 p-8 md:p-12 bg-[#F8FAFC] dark:bg-gray-900">
            <h2 className="text-3xl font-black mb-8 text-black dark:text-white">Solicite su Cotización con Garantía</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Nombre Completo</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                    placeholder="Ej: Juan Pérez"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Teléfono / WhatsApp</label>
                  <input
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                    placeholder="+591 ..."
                    type="tel"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Correo Electrónico</label>
                <input
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                  placeholder="nombre@ejemplo.com"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1 tracking-widest">Descripción del Proyecto</label>
                <textarea
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
                  placeholder="Cuéntenos qué necesita (ej: Ventana para dormitorio 2x1.5m)"
                  rows={4}
                ></textarea>
              </div>
              <div className="flex items-center gap-3">
                <input
                  defaultChecked
                  className="rounded text-primary focus:ring-primary h-5 w-5 border-gray-300 cursor-pointer"
                  id="whatsapp"
                  type="checkbox"
                />
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer" htmlFor="whatsapp">
                  Deseo recibir mi presupuesto por WhatsApp para agilidad.
                </label>
              </div>
              <button className="w-full bg-primary text-white font-black py-4 rounded-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all">
                ENVIAR SOLICITUD DE COTIZACIÓN
                <AiOutlineSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}