import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, ShoppingBag, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Modal from './ui/Modal';

const Header = () => {
  const { user, isAuthenticated, logout, isClient, isProfessional, isAdmin } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { scrollY } = useScroll();
  const y = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/galeria', label: 'Galería' },
    { path: '/profesionales', label: 'Profesionales' },
    { path: '/sedes', label: 'Sedes' }
  ];

  const userNavLinks = isClient ? [
    { path: '/mi-cuenta', label: 'Mi Cuenta', icon: User },
    { path: '/mi-cuenta/citas', label: 'Mis Citas', icon: Heart },
    { path: '/mi-cuenta/fidelidad', label: 'Fidelidad', icon: ShoppingBag }
  ] : isProfessional ? [
    { path: '/profesional', label: 'Dashboard', icon: User },
    { path: '/profesional/agenda', label: 'Mi Agenda', icon: Heart },
    { path: '/profesional/citas', label: 'Mis Citas', icon: ShoppingBag }
  ] : isAdmin ? [
    { path: '/admin', label: 'Panel Admin', icon: User }
  ] : [];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <nav className="container-custom" aria-label="Navegación principal">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" aria-label="Salón de Belleza - Inicio">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a2 2 0 100 4 2 2 0 000-4zm8.949 11.364l-4.096 2.048A2 2 0 0112 18H4a2 2 0 01-1.853-2.592l4.096-2.048A2 2 0 018 14.414V5a2 2 0 012-2h8a2 2 0 012 2v7.414a2 2 0 01-.051 1.364z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-neutral-900 hidden sm:block">Salón de Belleza</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors relative ${
                  location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                    ? 'text-primary-600'
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-colors lg:hidden"
              aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications/Quick actions */}
                <div className="relative hidden sm:block">
                  <button className="p-2 rounded-xl text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-colors relative">
                    <Heart className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </button>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar src={user?.avatar} name={user?.name} size="sm" />
                    <span className="hidden sm:block font-medium text-neutral-700">{user?.name}</span>
                    <svg className="w-4 h-4 text-neutral-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elegant border border-neutral-100 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <p className="font-medium text-neutral-900">{user?.name}</p>
                          <p className="text-sm text-neutral-500">{user?.email}</p>
                          {user?.loyaltyPoints !== undefined && (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="badge badge-warning text-xs">★ {user.loyaltyPoints} pts</span>
                              <span className={`badge text-xs capitalize ${user.loyaltyTier === 'gold' ? 'badge-warning' : user.loyaltyTier === 'silver' ? 'badge-neutral' : 'badge-primary'}`}>
                                {user.loyaltyTier}
                              </span>
                            </div>
                          )}
                        </div>
                        {userNavLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
                          >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                          </Link>
                        ))}
                        <div className="border-t border-neutral-100 pt-2">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="flex items-center space-x-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Cerrar sesión</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link to="/login" className="btn-ghost text-sm">Iniciar sesión</Link>
                <Link to="/register" className="btn-primary text-sm">Registrarse</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-neutral-100"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium ${
                      location.pathname === link.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  {isAuthenticated ? (
                    <>
                      {userNavLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary-600"
                        >
                          <link.icon className="w-5 h-5" />
                          <span>{link.label}</span>
                        </Link>
                      ))}
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar sesión</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-ghost w-full justify-center">Iniciar sesión</Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full justify-center">Registrarse</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

import { AnimatePresence } from 'framer-motion';

export default Header;