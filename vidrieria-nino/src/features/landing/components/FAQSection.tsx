"use client";
import React, { useState } from 'react';
import { FaAngleDown } from "react-icons/fa";

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "¿Ofrecen garantía por escrito sobre la instalación?",
            answer: "Sí, absolutamente. Gracias a nuestra tradición de más de 35 años en Montero, respaldamos cada instalación con una garantía escrita que cubre tanto materiales como mano de obra. Nuestra reputación se basa en la durabilidad y la confianza de miles de clientes satisfechos que saben que siempre estamos aquí para responder."
        },
        {
            question: "¿Cuál es el tiempo promedio de entrega?",
            answer: "El tiempo de entrega depende de la complejidad del trabajo. Generalmente para trabajos estándar es de 48 a 72 horas hábiles."
        },
        {
            question: "¿La visita técnica tiene algún costo?",
            answer: "No, la visita técnica y el asesoramiento son totalmente gratuitos dentro del radio urbano de Montero."
        },
        {
            question: "¿Qué tipos de vidrio utilizan para proyectos de seguridad?",
            answer: "Utilizamos vidrios templados (Blindex) y laminados certificados con normas de seguridad internacional para garantizar la máxima protección."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-white dark:bg-background-dark">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
                        Preguntas Frecuentes sobre nuestros Proyectos
                    </h2>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${openIndex === index
                                ? 'bg-gray-50 dark:bg-gray-900 border-primary/20 shadow-sm'
                                : 'bg-white dark:bg-background-dark border-gray-200 dark:border-gray-800'
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                                className="w-full flex items-center justify-between p-6 cursor-pointer focus:outline-none text-left"
                            >
                                <span className={`font-display font-semibold text-lg ${openIndex === index ? 'text-primary' : 'text-black dark:text-white'}`}>
                                    {faq.question}
                                </span>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : 'text-gray-400'}`}>
                                    <FaAngleDown />
                                </span>
                            </button>

                            <div
                                className={`transition-[max-height,opacity] duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed font-display border-t border-gray-100 dark:border-gray-800 pt-4">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
