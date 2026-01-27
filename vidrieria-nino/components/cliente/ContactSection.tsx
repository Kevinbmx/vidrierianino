import ContactForm from '../contact/page';

export default function ContactSection() {

  return (
    <section id="contact" className="py-20 bg-base-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary">Contáctanos</h2>
          <p className="mt-4 text-lg text-base-content">
            ¿Tienes un proyecto en mente? Estamos aquí para ayudarte.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}