import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    empresa: [
      { label: 'Nosotros', path: '/nosotros' },
      { label: 'Profesionales', path: '/profesionales' },
      { label: 'Sedes', path: '/sedes' },
      { label: 'Trabaja con nosotros', path: '/empleos' },
      { label: 'Blog', path: '/blog' }
    ],
    servicios: [
      { label: 'Uñas', path: '/servicios?category=nails' },
      { label: 'Cabello', path: '/servicios?category=hair' },
      { label: 'Pestañas', path: '/servicios?category=eyelashes' },
      { label: 'Promociones', path: '/promociones' },
      { label: 'Tarjetas regalo', path: '/tarjetas-regalo' }
    ],
    ayuda: [
      { label: 'Centro de ayuda', path: '/ayuda' },
      { label: 'Preguntas frecuentes', path: '/faq' },
      { label: 'Política de cancelación', path: '/politica-cancelacion' },
      { label: 'Términos y condiciones', path: '/terminos' },
      { label: 'Privacidad', path: '/privacidad' }
    ],
    contacto: [
      { icon: MapPin, label: 'Calle 72 # 10-25, Centro Comercial Andino', path: '/sedes' },
      { icon: Phone, label: '+57 1 234 5678', href: 'tel:+5712345678' },
      { icon: Mail, label: 'info@salonbelleza.com', href: 'mailto:info@salonbelleza.com' },
      { icon: Clock, label: 'Lun-Vie: 9:00 - 20:00', path: '/sedes' },
      { icon: Clock, label: 'Sáb: 9:00 - 19:00', path: '/sedes' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/salonbelleza', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/salonbelleza', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/salonbelleza', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/salonbelleza', label: 'YouTube' }
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-custom py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-2" aria-label="Salón de Belleza - Inicio">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a2 2 0 100 4 2 2 0 000-4zm8.949 11.364l-4.096 2.048A2 2 0 0112 18H4a2 2 0 01-1.853-2.592l4.096-2.048A2 2 0 018 14.414V5a2 2 0 012-2h8a2 2 0 012 2v7.414a2 2 0 01-.051 1.364z" />
                </svg>
              </div>
              <span className="font-display font-bold text-2xl text-white">Salón de Belleza</span>
            </Link>
            <p className="text-neutral-400 max-w-xs">
              Tu salón de belleza de confianza. Servicios profesionales de uñas, cabello y pestañas con los mejores especialistas.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-primary-500 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Servicios</h3>
            <ul className="space-y-3">
              {footerLinks.servicios.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Ayuda</h3>
            <ul className="space-y-3">
              {footerLinks.ayuda.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              {footerLinks.contacto.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <item.icon className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    {item.href ? (
                      <a href={item.href} className="text-neutral-400 hover:text-white transition-colors">{item.label}</a>
                    ) : (
                      <Link to={item.path} className="text-neutral-400 hover:text-white transition-colors">{item.label}</Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-neutral-500 text-sm">
            © {currentYear} Salón de Belleza. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/terminos" className="text-neutral-500 hover:text-white text-sm transition-colors">Términos</Link>
            <Link to="/privacidad" className="text-neutral-500 hover:text-white text-sm transition-colors">Privacidad</Link>
            <Link to="/cookies" className="text-neutral-500 hover:text-white text-sm transition-colors">Cookies</Link>
          </div>
          <button className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-elegant hover:bg-primary-600 transition-colors z-40" aria-label="Volver arriba">
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;