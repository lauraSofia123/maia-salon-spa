import { Link, useLocation } from 'react-router-dom';
import { IconCalendar, IconMenu } from '@tabler/icons-react';
import Logo from './Logo';
import { motion } from 'framer-motion';

const navLinks = [
  { path: '/', label: 'Inicio' },
  { path: '/servicios', label: 'Servicios' },
  { path: '/profesionales', label: 'Profesionales' },
  { path: '/sedes', label: 'Sedes' },
  { path: '/promociones', label: 'Promociones' },
  { path: '/galeria', label: 'Galería' },
  { path: '/contacto', label: 'Contacto' },
];

const NavLinkDesktop = ({ link, isActive }) => (
  <Link
    to={link.path}
    className={`relative inline-flex items-center text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-primary-700' : 'text-neutral-500 hover:text-primary-600'
    }`}
  >
    {link.label}
    <span
      className={`absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-secondary-300 transition-all duration-300 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    />
  </Link>
);

const Navbar = ({ onOpenMenu, isScrolled }) => {
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={`bg-white/95 backdrop-blur border-b transition-shadow duration-300 ${
        isScrolled ? 'shadow-soft border-transparent' : 'border-neutral-200/70 shadow-none'
      }`}
      aria-label="Navegación principal"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLinkDesktop key={link.path} link={link} isActive={isActive(link.path)} />
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center space-x-3">
            <Link
              to="/agendar"
              className="hidden lg:inline-flex items-center gap-2 h-[44px] px-6 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-600 transition-colors shadow-soft"
            >
              <IconCalendar className="w-4 h-4" aria-hidden="true" />
              Reservar cita
            </Link>

            {/* Hamburguesa */}
            <button
              type="button"
              onClick={onOpenMenu}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
              aria-label="Abrir menú"
              aria-haspopup="dialog"
            >
              <IconMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
export { navLinks };