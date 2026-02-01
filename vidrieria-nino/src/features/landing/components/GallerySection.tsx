"use client";
import Image from "next/image";
import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { AnimatePresence } from "framer-motion";
import ProjectModal from "./ProjectModal";
import { Project } from "@/types/project";

export default function PortfolioSection() {
  const [filter, setFilter] = useState("Todos");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: 1,
      category: "Ventanas",
      title: "Residencia El Palmar",
      shortDescription: "Sistema de carpintería de aluminio serie 25 con vidrios laminados.",
      fullDescription: "Para este proyecto residencial, el desafío principal consistía en integrar la zona de la piscina con el salón principal mediante una apertura panorámica de gran formato. Implementamos un sistema de correderas de alto rendimiento que permite una transición invisible, garantizando aislamiento térmico y máxima seguridad con cristales laminados de control solar.",
      images: [
        "/images/works/trabajo-vidrieria-nino-1.jpg",
        "/images/works/trabajo-vidrieria-nino-2.jpg",
        "/images/works/trabajo-vidrieria-nino-3.jpg",
        "/images/works/trabajo-vidrieria-nino-4.jpg"
      ],
      specs: {
        glass: "Templado 10mm",
        profile: "Aluminio Serie 25",
        location: "Montero, SCZ",
        warranty: "5 Años Estructural"
      },
      review: {
        text: "Excelente terminación y cumplimiento en los tiempos. La calidad del aluminio es superior a lo que ofrecen otros talleres en la zona.",
        author: "FAMILIA VARGAS",
        rating: 5
      }
    },
    {
      id: 2,
      category: "Cerramientos",
      title: "Oficinas Corporativas",
      shortDescription: "Cerramiento de vidrio acústico para salas de juntas y áreas comunes.",
      fullDescription: "Diseño e instalación de divisiones de vidrio para oficinas modernas. El objetivo fue mantener la amplitud visual mientras se garantizaba la privacidad acústica necesaria para reuniones importantes. Utilizamos vidrio laminado acústico con perfiles minimalistas.",
      images: [
        "/images/works/trabajo-vidrieria-nino-2.jpg",
        "/images/works/trabajo-vidrieria-nino-3.jpg",
        "/images/works/trabajo-vidrieria-nino-5.jpg"
      ],
      specs: {
        glass: "Laminado Acústico 8mm",
        profile: "Serie 20 Negro Matte",
        location: "Santa Cruz, Centro",
        warranty: "3 Años"
      },
      review: {
        text: "Muy profesionales, el aislamiento acústico funcionó mejor de lo que esperábamos.",
        author: "ARQ. SEBASTIÁN LOPEZ",
        rating: 5
      }
    },
    {
      id: 3,
      category: "Cerramientos",
      title: "Edificio Mirador",
      shortDescription: "Barandas de seguridad en vidrio templado con herrajes de acero.",
      fullDescription: "Instalación completa de barandas perimetrales en balcones y terrazas. Se priorizó la seguridad utilizando vidrio templado de 10mm con botones de ajuste de acero inoxidable calidad 304, resistentes a la intemperie.",
      images: [
        "/images/works/trabajo-vidrieria-nino-3.jpg",
        "/images/works/trabajo-vidrieria-nino-1.jpg",
        "/images/works/trabajo-vidrieria-nino-6.jpg"
      ],
      specs: {
        glass: "Templado 10mm",
        profile: "Acero Inoxidable 304",
        location: "Zona Norte",
        warranty: "10 Años"
      }
    },
    {
      id: 4,
      category: "Puertas",
      title: "Ingreso Principal",
      shortDescription: "Puerta batiente de cristal templado con manijón de acero.",
      fullDescription: "Puerta de ingreso monumental para residencia de lujo. Sistema pivotante con freno hidráulico de piso y jaladores customizados de 1.20m en acero inoxidable.",
      images: [
        "/images/works/trabajo-vidrieria-nino-4.jpg",
        "/images/works/trabajo-vidrieria-nino-5.jpg"
      ],
      specs: {
        glass: "Templado 10mm Bronce",
        profile: "Freno Hidráulico",
        location: "Urubó",
        warranty: "5 Años Mecanismo"
      }
    },
    {
      id: 5,
      category: "Ventanas",
      title: "Condominio Norte",
      shortDescription: "Ventanas proyectantes con vidrio reflectivo.",
      fullDescription: "Renovación de fachada con ventanas proyectantes sistema integrado. El vidrio reflectivo azul ayuda a reducir la carga térmica del edificio, mejorando la eficiencia energética.",
      images: [
        "/images/works/trabajo-vidrieria-nino-5.jpg",
        "/images/works/trabajo-vidrieria-nino-4.jpg"
      ],
      specs: {
        glass: "Reflectivo Azul 6mm",
        profile: "Serie 20 Blanca",
        location: "Km 9 Al Norte",
        warranty: "2 Años"
      }
    },
    {
      id: 6,
      category: "Puertas",
      title: "Acceso Comercial",
      shortDescription: "Puertas automáticas con sensores de presencia.",
      fullDescription: "Sistema de acceso automático para centro comercial. Incluye sensores de movimiento, baterías de respaldo y sistema antipánico para evacuación.",
      images: [
        "/images/works/trabajo-vidrieria-nino-6.jpg",
        "/images/works/trabajo-vidrieria-nino-2.jpg"
      ],
      specs: {
        glass: "Templado Incoloro 10mm",
        profile: "Sistema Automático",
        location: "Av. Banzer",
        warranty: "1 Año Motor"
      },
      review: {
        text: "El sistema funciona perfecto con el alto tráfico de gente que tenemos.",
        author: "GERENCIA MALL",
        rating: 4
      }
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
              className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Ver Proyecto Completo <FaArrowRightLong />
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{project.category}</div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">{project.title}</h4>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                  {project.shortDescription}
                </p>
                <button className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm group-hover:translate-x-1">
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

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}