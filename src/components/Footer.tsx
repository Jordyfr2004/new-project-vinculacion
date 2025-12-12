import Link from 'next/link';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Sistema de Ayuda Social y Donaciones
              </span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Conectando corazones generosos con quienes más lo necesitan. 
              Juntos construimos un mundo más solidario y justo.
            </p>
            <div className="flex flex-col space-y-2 text-slate-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">contacto@ayudasocial.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Manta, Ecuador</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#inicio" className="text-slate-400 hover:text-green-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="text-slate-400 hover:text-green-400 transition-colors">
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link href="/#impacto" className="text-slate-400 hover:text-green-400 transition-colors">
                  Nuestro Impacto
                </Link>
              </li>
              <li>
                <Link href="/donantes" className="text-slate-400 hover:text-green-400 transition-colors">
                  Quiero Donar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacidad" className="text-slate-400 hover:text-green-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-slate-400 hover:text-green-400 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="text-slate-400 hover:text-green-400 transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © {currentYear} Sistema de Ayuda Social y Donaciones. Todos los derechos reservados.
            </p>
            <p className="text-slate-500 text-sm flex items-center space-x-1">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              <span>para ayudar</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
