import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Clock } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8 border-t border-neutral-800">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-6 brightness-0 invert">
              <Logo />
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Experiencia premium en cuidado personal. Resalta tu belleza con los mejores profesionales y productos de alta calidad.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-display font-semibold text-lg mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/servicios" className="hover:text-primary-400 transition-colors">Servicios</Link>
              </li>
              <li>
                <Link to="/profesionales" className="hover:text-primary-400 transition-colors">Especialistas</Link>
              </li>
              <li>
                <Link to="/sedes" className="hover:text-primary-400 transition-colors">Nuestras Sedes</Link>
              </li>
              <li>
                <Link to="/reservar" className="hover:text-primary-400 transition-colors">Reservar Cita</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-display font-semibold text-lg mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span className="text-sm">Calle 122 #15-32, Bogotá<br />Sede Principal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span className="text-sm">+57 300 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span className="text-sm">hola@maiasalon.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-white font-display font-semibold text-lg mb-6">Horarios</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary-500 shrink-0" />
                <div>
                  <p className="text-white">Lunes a Viernes</p>
                  <p className="text-neutral-400">8:00 AM - 8:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary-500 shrink-0" />
                <div>
                  <p className="text-white">Sábados</p>
                  <p className="text-neutral-400">9:00 AM - 7:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-5 h-5 text-primary-500 shrink-0" />
                <div>
                  <p className="text-white">Domingos y Festivos</p>
                  <p className="text-neutral-400">Cerrado</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Maia Salón & Spa. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link to="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link to="/terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
