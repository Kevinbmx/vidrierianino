"use client";
import { Button } from "@heroui/react";
import { BiMoneyWithdraw } from "react-icons/bi";
import { GrGallery } from "react-icons/gr";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative h-screen flex items-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url(/images/works/trabajo-vidrieria-nino-1.jpg)",
      }}
    >
      {/* Dark blue overlay */}
      <div className="absolute inset-0 bg-primary/60 dark:bg-black/70" />

      <div className="relative z-10 max-w-5xl px-4 md:ml-10 tracking-tighter">
        {/* Coral badge */}
        <span className="inline-block px-4 py-1 bg-coral text-white text-xs font-bold rounded-full uppercase tracking-widest">
          TRADICIÓN Y EXCELENCIA
        </span>

        {/* Title – serif */}
        <h1 className="text-5xl md:text-7xl font-black text-white mt-4">
          Más de 35 Años Poniendo Claridad y Seguridad
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-white/80 mt-4 max-w-2xl">
          Calidad artesanal y tecnología de vanguardia en Montero. El
          contratista de confianza para sus proyectos más exigentes en vidrio
          templado y aluminio.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button
            as={Link}
            href="#contact"
            color="primary"
            className="text-white"
            size="lg"
          >
            <BiMoneyWithdraw size={48} />
            COTICE SU PROYECTO
          </Button>

          <Button
            as={Link}
            href="#gallery"
            color="secondary"
            className="border border-white text-white bg-transparent hover:bg-white/10"
            size="lg"
          >
            <GrGallery size={48} />
            Ver Trabajos
          </Button>
        </div>
      </div>
    </section>
  );
}