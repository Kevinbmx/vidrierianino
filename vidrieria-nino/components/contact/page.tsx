import ContactForm from '@/components/contact/ContactForm';
import {Card, CardBody, CardHeader} from "@heroui/react";

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Contáctanos</h1>
          </CardHeader>
          <CardBody>
            <p className="text-center mb-6">¿Tienes alguna pregunta o quieres una cotización? Completa el formulario y te responderemos a la brevedad.</p>
            <ContactForm />
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
