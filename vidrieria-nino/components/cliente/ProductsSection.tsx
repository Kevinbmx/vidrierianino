import { Card, CardBody, CardHeader } from "@heroui/react";
import Image from "next/image";

export default function ProductsSection() {
  const products = [
    {
      image: "/images/products/enmarcaciones.jpg",
      title: "Enmarcaciones",
      description: "Trabajos profesionales de enmarcado para cuadros, espejos y obras de arte."
    },
    {
      image: "/images/products/vidrio-crudo.jpg",
      title: "Vidrios Crudos",
      description: "Venta de vidrios crudos en diferentes medidas y espesores para múltiples aplicaciones."
    },
    {
      image: "/images/products/vidrio-catedral.jpg",
      title: "Vidrios Catedral",
      description: "Vidrios decorativos con textura que proporcionan privacidad y estilo único."
    },
    {
      image: "/images/products/vidrio-5mm.webp",
      title: "Vidrios 5mm",
      description: "Ideales para mesas, muebles, repisas y otras aplicaciones que requieren resistencia."
    },
    {
      image: "/images/products/espejo-a-medida.jpg",
      title: "Espejos",
      description: "Espejos para baño, gimnasio, tocador y vestuario, fabricados a medida."
    },
    {
      image: "/images/products/vidrio-blindex.jpg",
      title: "Vidrios Blindex",
      description: "Vidrios de seguridad templados para puertas, ventanas y divisiones."
    },
  ];

  return (
    <section id="productos" className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary">Nuestros Productos</h2>
          <p className="text-xl max-w-2xl mx-auto text-base-content">
            Calidad y variedad en materiales para tus proyectos con vidrio y aluminio.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card key={index} className="overflow-hidden transform transition duration-300 hover:scale-105 bg-base-100 bg-secondary dark:bg-base-200 dark:bg-secondary/80">
              <CardHeader className="p-0">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              </CardHeader>
              <CardBody className="text-primary text-secondary-content dark:text-base-content">
                <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                <p>{product.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
