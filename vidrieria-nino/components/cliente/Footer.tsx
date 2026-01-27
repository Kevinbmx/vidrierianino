import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-text)] py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Vidriería Niño</h2>
            <p>
              Especialistas en vidrios, aluminios y enmarcaciones desde 1988.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul>
              <li className="mb-2">
                <a href="#services" className="hover:underline">
                  Servicios
                </a>
              </li>
              <li className="mb-2">
                <a href="#gallery" className="hover:underline">
                  Galería
                </a>
              </li>
              <li className="mb-2">
                <a href="#testimonials" className="hover:underline">
                  Testimonios
                </a>
              </li>
              <li className="mb-2">
                <a href="#contact" className="hover:underline">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/vidrierianino" target="_blank" rel="noopener noreferrer">
                <FaFacebook size={24} />
              </a>
              <a href="https://www.instagram.com/vidrierianino?igsh=MTkxZHFoM2p5aDN0dA==" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={24} />
              </a>
              <a href="https://api.whatsapp.com/send?phone=70057475" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t">
          <p>
            &copy; {new Date().getFullYear()} Vidriería Niño. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}