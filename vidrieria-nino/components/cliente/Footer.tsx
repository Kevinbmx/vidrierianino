import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Column 1 – logo & description */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-coral"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4C25.78 14.22 33.78 22.22 44 24C33.78 25.78 25.78 33.78 24 44C22.22 33.78 14.22 25.78 4 24C14.22 22.22 22.22 14.22 24 4Z"
                fill="currentColor"
              />
            </svg>
            <h2 className="text-xl font-black tracking-tight">VIDRIERÍA MONTERO</h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Líderes en carpintería de aluminio y vidrio de alta gama en el Norte
            Integrado de Santa Cruz. Calidad que perdura.
          </p>
        </div>

        {/* Column 2 – quick links */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-white">Enlaces Rápidos</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-400">
            <li>
              <a href="#nosotros" className="hover:text-primary transition-colors">
                Nosotros
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-primary transition-colors">
                Nuestros Servicios
              </a>
            </li>
            <li>
              <a href="#gallery" className="hover:text-primary transition-colors">
                Portafolio
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-primary transition-colors">
                Preguntas Frecuentes
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 – contact */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-white">Contáctenos</h4>
          <ul className="flex flex-col gap-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">location_on</span>
              Av. Circular, Barrio El Paraíso, Montero
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">phone_in_talk</span>
              +591 760 01243
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              info@vidreriamontero.com
            </li>
          </ul>
        </div>

        {/* Column 4 – map placeholder */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-white">Ubicación</h4>
          <div className="h-40 bg-gray-800 rounded-lg overflow-hidden grayscale opacity-80 hover:opacity-100 transition-opacity relative group">
            {/* Map Image Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <span className="material-symbols-outlined text-4xl text-gray-500 group-hover:text-white transition-colors">map</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
        <p>© 2024 Vidriería de Alta Gama Montero. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">
            Términos y Condiciones
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Políticas de Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}