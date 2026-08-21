import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import SocialIcon from './SocialIcons';
import { WhatsAppIcon } from './SocialIcons';

const MenuLink = ({ link, onClick, isActive }) => (
  <Link
    to={link.path}
    onClick={onClick}
    className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors ${
      isActive ? 'text-primary-700 bg-primary-50' : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50/60'
    }`}
  >
    {link.label}
    {isActive && <span className="h-2 w-2 rounded-full bg-secondary-300" />}
  </Link>
);

const MobileMenu = ({ open, onClose, navLinks }) => {
  const location = useLocation();
  const closeRef = useRef(null);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const socials = [
    { network: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/573001234567' },
    { network: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
    { network: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
    { network: 'tiktok', label: 'TikTok', href: 'https://tiktok.com' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-primary-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[320px] bg-white shadow-elegant flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header drawer */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <span className="font-display font-semibold text-2xl text-primary-500">Maia</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-neutral-500 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                aria-label="Cerrar menú"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
              {navLinks.map((link) => (
                <MenuLink key={link.path} link={link} onClick={onClose} isActive={isActive(link.path)} />
              ))}
            </div>

            {/* Footer drawer */}
            <div className="border-t border-primary-100 p-5 space-y-5">
              <Link
                to="/agendar"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-soft"
              >
                <IconCalendar className="w-4 h-4" aria-hidden="true" />
                Reservar cita
              </Link>
              <div className="flex items-center justify-center space-x-5">
                {socials.map((s) => (
                  <a
                    key={s.network}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-neutral-200 text-neutral-500 hover:text-primary-600 hover:border-primary-200 transition-colors"
                    aria-label={s.label}
                  >
                    {s.network === 'whatsapp' ? (
                      <WhatsAppIcon size={18} />
                    ) : (
                      <SocialIcon network={s.network} size="md" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;