import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconStar, IconMapPin, IconAward, IconArrowRight } from '@tabler/icons-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const ProfessionalCard = ({
  professional,
  variant = 'default',
  showServices = false,
  showBranches = false,
  onClick
}) => {
  const variants = {
    default: 'card hover group',
    compact: 'card p-4 hover group',
    featured: 'card-elevated p-6 hover group'
  };

  const user = professional.user || {};
  const services = professional.services || [];
  const branches = professional.branches || [];

  return (
    <motion.article
      className={variants[variant]}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={user.avatar}
          name={user.name}
          size="lg"
          status="online"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                {user.name}
              </h3>
              {professional.bio && (
                <p className="text-neutral-600 text-sm line-clamp-2 mt-1">
                  {professional.bio}
                </p>
              )}
            </div>
            {professional.isFeatured && (
              <Badge variant="warning" size="sm">
                <IconAward className="w-3 h-3" />
                Destacada
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-neutral-500">
            {professional.rating > 0 && (
              <span className="flex items-center gap-1 text-warning-600 font-medium">
                <IconStar className="w-4 h-4 fill-current" />
                {professional.rating.toFixed(1)}
                <span className="text-neutral-400">({professional.totalReviews})</span>
              </span>
            )}
            {professional.experienceYears > 0 && (
              <span className="flex items-center gap-1">
                <IconAward className="w-4 h-4" />
                {professional.experienceYears}+ años
              </span>
            )}
          </div>
        </div>
      </div>

      {showServices && services.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Especialidades
          </p>
          <div className="flex flex-wrap gap-2">
            {services.slice(0, 4).map((svc) => (
              <Badge key={svc.id} variant="neutral" size="sm" className="group-hover:variant-primary transition-colors">
                {svc.name}
              </Badge>
            ))}
            {services.length > 4 && (
              <Badge variant="primary" size="sm">
                +{services.length - 4} más
              </Badge>
            )}
          </div>
        </div>
      )}

      {showBranches && branches.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Sedes
          </p>
          <div className="flex flex-wrap gap-2">
            {branches.slice(0, 3).map((branch) => (
              <Badge key={branch.id} variant="secondary" size="sm" dot>
                {branch.branch?.name || branch.name}
              </Badge>
            ))}
            {branches.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{branches.length - 3} más
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver perfil
          <IconArrowRight className="w-4 h-4" />
        </span>
        {professional.rating >= 4.8 && (
          <Badge variant="success" size="sm">
            <IconStar className="w-3 h-3 fill-current" />
            Top Rated
          </Badge>
        )}
      </div>
    </motion.article>
  );
};

export default ProfessionalCard;