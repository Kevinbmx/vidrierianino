import { Card, CardBody, CardHeader } from "@heroui/react";
import { FaGlassMartini, FaRulerCombined, FaTools } from "react-icons/fa";

export default function ServicesSection() {
  const services = [
    {
      icon: <FaGlassMartini size={48} className="mx-auto text-secondary dark:text-primary" />,
      title: "Venta de Vidrios y Espejos",
      description: "Ofrecemos una amplia variedad de vidrios (crudos, ahumados, catedrales) y espejos para todo tipo de proyectos.",
    },
    {
      icon: <FaRulerCombined size={48} className="mx-auto text-secondary dark:text-primary" />,
      title: "Instalación y Colocación",
      description: "Instalación profesional de vidrios Blindex y convencionales, garantizando seguridad y acabados perfectos.",
    },
    {
      icon: <FaTools size={48} className="mx-auto text-secondary dark:text-primary" />,
      title: "Mantenimiento y Reparación",
      description: "Servicios de mantenimiento para carpintería de aluminio, Blindex y cambio de vidrios rotos.",
    },
  ];

  return (
    <section id="services" className="py-20 bg-base-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary">Nuestros Servicios</h2>
          <p className="mt-4 text-lg text-base-content">Soluciones integrales para tus necesidades en vidrio y aluminio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="text-center transform transition duration-500 hover:scale-105 border border-secondary dark:border-primary dark:bg-secondary/20">
              <CardHeader className="flex justify-center items-center pt-6">
                {service.icon}
              </CardHeader>
              <CardBody>
                <h3 className="text-xl font-bold mb-2 text-primary">{service.title}</h3>
                <p className="text-base-content">{service.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
