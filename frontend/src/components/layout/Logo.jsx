import { Link } from 'react-router-dom';

const Logo = ({ className = '' }) => {
  return (
    <Link
      to="/"
      aria-label="Maia Salón & Spa - Inicio"
      className={`group inline-flex flex-col leading-none ${className}`}
    >
      <span className="font-display font-semibold text-2xl text-primary-600 tracking-tight">
        Maia
      </span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.35em] text-secondary-400">
        Salón &amp; Spa
      </span>
    </Link>
  );
};

export default Logo;