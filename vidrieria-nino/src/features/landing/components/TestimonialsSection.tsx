import { Avatar, Card, CardBody } from "@heroui/react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Maria Rodriguez',
      testimonial: '¡Excelente servicio! Muy profesionales y atentos a los detalles. El trabajo quedó impecable.',
      avatar: 'https://picsum.photos/seed/a/100/100'
    },
    {
      name: 'Juan Perez',
      testimonial: 'Los recomiendo al 100%. Cumplieron con los plazos y el resultado superó mis expectativas.',
      avatar: 'https://picsum.photos/seed/b/100/100'
    },
    {
      name: 'Ana Gomez',
      testimonial: 'Muy buena atención y asesoramiento. Me ayudaron a elegir la mejor opción para mi casa.',
      avatar: 'https://picsum.photos/seed/c/100/100'
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-primary text-primary-content dark:bg-base-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold dark:text-primary-content">Qué dicen nuestros clientes</h2>
          <p className="mt-4 text-lg text-secondary dark:text-primary">La satisfacción de nuestros clientes es nuestra mejor carta de presentación.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center bg-transparent shadow-none border-none">
              <CardBody>
                <Avatar src={testimonial.avatar} alt={testimonial.name} size="lg" className="mx-auto mb-4" />
                <p className="mb-4 text-secondary dark:text-primary">"{testimonial.testimonial}"</p>
                <h3 className="text-xl font-bold text-secondary dark:text-primary-content">- {testimonial.name}</h3>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
