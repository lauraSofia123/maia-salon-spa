import { Clock } from 'lucide-react';
import SocialIcon from './SocialIcons';
import { WhatsAppIcon } from './SocialIcons';

const Socials = ({ size, className, iconClassName }) => (
  <div className={`flex items-center space-x-3 ${className}`}>
    <SocialIcon network="instagram" size={size} className={iconClassName} />
    <SocialIcon network="facebook" size={size} className={iconClassName} />
    <SocialIcon network="tiktok" size={size} className={iconClassName} />
  </div>
);

const TopBar = () => {
  const socials = [
    { network: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
    { network: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
    { network: 'tiktok', label: 'TikTok', href: 'https://tiktok.com' },
  ];

  return (
    <div className="hidden md:flex items-center justify-between bg-primary-700 text-primary-50 h-[34px] px-4 lg:px-8 text-[13px]">
      {/* Horario */}
      <div className="flex items-center gap-1.5 tracking-wide">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Lun - Sáb: 8:00 am - 7:00 pm</span>
      </div>

      {/* Socials */}

      {/* Zona secundaria: Síguenos */}
      <div className="flex items-center">
        <span className="mr-3 text-primary-200/80">Síguenos</span>
        <div className="flex items-center space-x-4">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-100 hover:text-secondary-300 transition-colors"
              aria-label={s.label}
            >
              <SocialIcon network={s.network} size="sm" className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      <a
        href="https://wa.me/573001234567"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-primary-100 hover:text-secondary-300 transition-colors"
        aria-label="WhatsApp +57 300 123 4567"
      >
        <WhatsAppIcon size={14} />
        <span className="tracking-wide">+57 300 123 4567</span>
      </a>
    </div>
  );
};

export { Socials };
export default TopBar;