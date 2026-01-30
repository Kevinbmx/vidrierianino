import { Card, CardBody, CardHeader } from "@heroui/react";
import { CgRuler } from "react-icons/cg";
import { IoDocumentTextOutline } from "react-icons/io5";
import { VscTools } from "react-icons/vsc";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

export default function ServicesSection() {
  const features = [
    {
      icon: <CgRuler size={48} />,
      title: "Visita Técnica",
      description:
        "Medición láser de alta precisión en sitio para asegurar un ajuste perfecto sin errores.",
    },
    {
      icon: <IoDocumentTextOutline size={48} />,
      title: "Cotización Formal",
      description:
        "Transparencia total con presupuestos detallados por ítem. Sin costos ocultos de último minuto.",
    },
    {
      icon: <VscTools size={48} />,
      title: "Ejecución Maestra",
      description:
        "Mano de obra especializada. Instalamos bajo normas internacionales de seguridad.",
    },
    {
      icon: <IoShieldCheckmarkOutline size={48} />,
      title: "35+ Años de Respaldo",
      description:
        "Décadas de experiencia en el mercado cruceño que brindan seguridad total a su inversión.",
    },
  ];

  return (
    <section id="services" className="py-20 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-black">¿Por qué ser el contratista de confianza en Montero?</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Nuestro proceso artesanal garantiza resultados de excelencia y durabilidad para su inversión.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <Card
              key={i}
              className="text-center border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-xl transition-all group"
            >
              <CardHeader className="pt-6">
                {/* Icon inside square */}
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-lg bg-white transition-colors group-hover:bg-primary">
                  <div className="text-primary group-hover:text-white transition-colors">
                    {f.icon}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <h3 className="text-xl font-bold text-black mb-2">{f.title}</h3>
                <p className="text-black">{f.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
