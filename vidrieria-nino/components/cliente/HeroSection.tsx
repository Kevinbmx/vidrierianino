"use client";
import { Button } from "@heroui/react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center bg-cover bg-center" style={{ backgroundImage: 'url(/images/works/trabajo-vidrieria-nino-1.jpg)' }}>
      {/* Overlay que usa los colores del tema */}
      <div className="absolute inset-0 bg-secondary opacity-60 dark:bg-black dark:opacity-70"></div>
      
      <div className="relative z-10 max-w-4xl px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {/* Soluciones en Vidrio y Aluminio a tu Medida */}
          Más de 35 años poniendo claridad y seguridad
        </h1>
        <p className="text-lg md:text-xl text-white mb-8">
          {/* En Vidriería Niño, transformamos tus espacios con productos de alta calidad y un servicio excepcional. Desde vidrios crudos hasta instalaciones de Blindex y mantenimiento de carpintería de aluminio. */}
          calidad artesanal y tecnologia de vanguardia. Somos la confianza para sus proyectos mas exigentes en vidrio templado y aluminio
        </p>
        <Button as={Link} href="#contact" color="primary" size="lg">
          Contáctanos
        </Button>
      </div>
    </section>
  );
}
