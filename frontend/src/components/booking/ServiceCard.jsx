import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import Badge from '../ui/Badge';

const ServiceCard = ({
  service,
  variant = 'default',
  showCategory = true,
  showProfessionals = false,
  professionals = [],
  onClick
}) => {
  const categoryIcons = {
    nails: Sparkles,
    hair: Heart,
    eyelashes: Star,
    other: Sparkles
  };

  const CategoryIcon = categoryIcons[service.category] || Sparkles;

  const variants = {
    default: 'card hover group',
    compact: 'card p-4 hover group',
    featured: 'card-elevated p-6 hover group'
  };

  return (
    <motion.article
      className={variants[variant]}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      {service.image && (
        <div className="relative h-40 sm:h-48 overflow-hidden rounded-xl mb-4">
          <motion.img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {service.isPopular && (
            <Badge variant="premium" className="absolute top-3 left-3" size="sm">
              Popular
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {showCategory && service.category && (
            <Badge variant="primary" size="sm" className="mb-2" dot>
              <CategoryIcon className="w-3 h-3" />
              {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
            </Badge>
          )}
          <h3 className="font-display font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {service.name}
          </h3>
        </div>
        <div className="flex items-baseline gap-1 text-neutral-600 shrink-0">
          <span className="font-display font-bold text-lg text-primary-600">
            {formatPrice(service.price)}
          </span>
          <span className="text-sm">COP</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {service.duration} min
        </span>
        {showProfessionals && professionals.length > 0 && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {professionals.length} pro
          </span>
        )}
      </div>

      {service.description && (
        <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
          {service.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver detalles
          <ArrowRight className="w-4 h-4" />
        </span>
        {service.isPopular && (
          <Badge variant="warning" size="sm">
            <Star className="w-3 h-3" />
            Top
          </Badge>
        )}
      </div>
    </motion.article>
  );
};

export default ServiceCard;