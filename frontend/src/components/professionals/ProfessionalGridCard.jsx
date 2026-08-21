import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, Sparkles } from 'lucide-react';

const ProfessionalImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 flex items-center justify-center" aria-hidden="true">
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-primary-400 mx-auto" />
          <p className="mt-2 text-xs font-medium text-primary-500">Foto próxima</p>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

const ProfessionalGridCard = ({ professional }) => {
  const navigate = useNavigate();
  const user = professional.user || {};
  const services = professional.services || [];
  const branches = professional.branches || [];

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group card bg-white h-full flex flex-col overflow-hidden rounded-[20px] border border-white/70 shadow-[0_8px_30px_-12px_rgba(77,53,94,0.3)] hover:shadow-[0_20px_45px_-15px_rgba(77,53,94,0.45)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <ProfessionalImage src={user.avatar} alt={user.name} />
        {professional.rating > 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold tracking-wide text-warning-700 uppercase flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {professional.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="font-display text-xl font-semibold text-primary-800 group-hover:text-primary-600 transition-colors">
          {user.name}
        </h3>
        <p className="text-sm font-medium text-secondary-600 mt-1">
          {professional.specialty || 'Especialista en Belleza'}
        </p>
        {professional.bio && (
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-2">{professional.bio}</p>
        )}

        {services.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5">
              {services.slice(0, 3).map((svc) => (
                <span key={svc.id} className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md">
                  {svc.name}
                </span>
              ))}
              {services.length > 3 && (
                <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md">
                  +{services.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {branches.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            <span className="truncate">
              {branches.map(b => b.branch?.name || b.name).join(', ')}
            </span>
          </div>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <Link
            to={`/profesionales/${professional.id}`}
            className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all"
          >
            Ver perfil
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/reservar?professionalId=${professional.id}`);
            }}
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-soft"
          >
            Reservar cita
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProfessionalGridCard;
