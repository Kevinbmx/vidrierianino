"use client";
import Image from "next/image";
import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";

export default function PortfolioSection() {
  const [filter, setFilter] = useState("Todos");

  const projects = [
    {
      id: 1,
      category: "Ventanas",
      image: "/images/works/trabajo-vidrieria-nino-1.jpg",
      title: "Residencia El Palmar",
      description: "Sistema de carpintería de aluminio serie 25 con vidrios laminados de 10mm.",
    },
    {
      id: 2,
      category: "Cerramientos",
      image: "/images/works/trabajo-vidrieria-nino-2.jpg",
      title: "Oficinas Corporativas",
      description: "Cerramiento de vidrio acústico para salas de juntas y áreas comunes.",
    },
    {
      id: 3,
      category: "Cerramientos",
      image: "/images/works/trabajo-vidrieria-nino-3.jpg",
      title: "Edificio Mirador",
      description: "Barandas de seguridad en vidrio templado con herrajes de acero inoxidable.",
    },
    {
      id: 4,
      category: "Puertas",
      image: "/images/works/trabajo-vidrieria-nino-4.jpg",
      title: "Ingreso Principal",
      description: "Puerta batiente de cristal templado con manijón de acero.",
    },
    {
      id: 5,
      category: "Ventanas",
      image: "/images/works/trabajo-vidrieria-nino-5.jpg",
      title: "Condominio Norte",
      description: "Ventanas proyectantes con vidrio reflectivo.",
    },
    {
      id: 6,
      category: "Puertas",
      image: "/images/works/trabajo-vidrieria-nino-6.jpg",
      title: "Acceso Comercial",
      description: "Puertas automáticas con sensores de presencia.",
    }
  ];

  const filteredProjects = filter === "Todos"
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <section id="gallery" className="py-20 bg-white dark:bg-background-dark">
      <div className="container mx-auto px-6">
        {/* Header with tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-primary">
              Nuestro Portafolio de Proyectos
            </h2>
            <p className="text-gray-600">
              Inspiración para su próxima remodelación o construcción.
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-2">
            {["Todos", "Ventanas", "Puertas", "Cerramientos"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`border-b-3 pb-3 font-bold transition-colors whitespace-nowrap ${filter === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-primary"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: Mobile 1 (default), Tablet 2 (md), PC 3 (lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-shadow bg-white"
            >
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark overlay on hover (optional as per request "posible overlay oscuro") */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold mb-2 text-black">{project.title}</h4>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                <button className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm">
                  Ver Detalles
                  <span className="material-symbols-outlined !text-sm">
                    <FaArrowRightLong />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}