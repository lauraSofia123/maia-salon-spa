import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Star, ArrowRight, Users, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';

const BranchCard = ({
  branch,
  variant = 'default',
  showProfessionals = false,
  professionals = [],
  onClick
}) => {
  const variants = {
    default: 'card hover group',
    compact: 'card p-4 hover group',
    featured: 'card-elevated p-6 hover group'
  };

  const dayNames = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
    thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
  };

  const openingHours = branch.openingHours || {};
  const today = new Date().toLocaleLowerCase().split(',')[0].substring(0, 3);
  const todayKey = Object.keys(dayNames).find(k => dayNames[k].startsWith(today)) || 'monday';
  const todayHours = openingHours[todayKey];

  return (
    <motion.article
      className={variants[variant]}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      {branch.image && (
        <div className="relative h-40 sm:h-48 overflow-hidden rounded-xl mb-4">
          <motion.img
            src={branch.image}
            alt={branch.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {branch.isMain && (
            <Badge variant="primary" className="absolute top-3 left-3" size="sm">
              Sede Principal
            </Badge>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {branch.name}
            </h3>
            <p className="text-neutral-600 text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{branch.address}</span>
            </p>
          </div>
          {branch.isMain && (
            <Badge variant="warning" size="sm">
              <Sparkles className="w-3 h-3" />
              Principal
            </Badge>
          )}
        </div>

        {branch.description && (
          <p className="text-neutral-600 text-sm line-clamp-2 mb-3">
            {branch.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {branch.phone}
          </span>
          {todayHours && !todayHours.isClosed && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              Abierto {todayHours.open}-{todayHours.close}
            </span>
          )}
          {todayHours && todayHours.isClosed && (
            <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              Cerrado hoy
            </span>
          )}
        </div>
      </div>

      {showProfessionals && professionals.length > 0 && (
        <div className="mb-4 pt-4 border-t border-neutral-100">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Profesionales disponibles
          </p>
          <div className="flex flex-wrap gap-2">
            {professionals.slice(0, 3).map((pro) => (
              <Badge key={pro.id} variant="secondary" size="sm" dot>
                {pro.user?.name || pro.name}
              </Badge>
            ))}
            {professionals.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{professionals.length - 3} más
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {branch._count?.professionals || 0} pros
          </span>
        </div>
        <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver sede
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </motion.article>
  );
};

export default BranchCard;