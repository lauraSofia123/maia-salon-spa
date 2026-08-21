import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconClock, IconArrowRight, IconChevronRight, IconSparkles } from '@tabler/icons-react';
import { categories, featuredServices } from '../../data/featuredServices';
import { formatPrice } from '../../utils/formatters';

const CATEGORY_NAME = { hair: 'Cabello', nails: 'Uñas', eyelashes: 'Pestañas', hairstyle: 'Peinados', smoothing: 'Alisados', cuts: 'Cortes' };

const ServiceImage = ({ service }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 flex items-center justify-center" aria-hidden="true">
        <div className="text-center">
          <IconSparkles className="w-10 h-10 text-primary-400 mx-auto" />
          <p className="mt-2 text-xs font-medium text-primary-500">Foto próxima</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={service.image}
      alt={service.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

const ServiceCard = ({ service }) => (
  <motion.article
    whileHover={{ y: -8 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="group card bg-white h-full flex flex-col overflow-hidden rounded-[20px] border border-white/70 shadow-[0_8px_30px_-12px_rgba(77,53,94,0.3)] hover:shadow-[0_20px_45px_-15px_rgba(77,53,94,0.45)]"
  >
    <div className="relative aspect-square overflow-hidden">
      <ServiceImage service={service} />
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold tracking-wide text-primary-700 uppercase">
        {CATEGORY_NAME[service.category] || 'Maia'}
      </span>
    </div>

    <div className="flex flex-col flex-1 p-5 sm:p-6">
      <h3 className="font-display text-xl font-semibold text-primary-800 group-hover:text-primary-600 transition-colors">
        {service.name}
      </h3>
      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{service.description}</p>

      <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary-600/80">
        <IconClock className="w-4 h-4" aria-hidden="true" />
        {service.duration}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-100">
        <span className="text-xs text-neutral-400">Desde</span>
        <p className="font-display font-bold text-2xl text-primary-700">
          $ {formatPrice(service.price)}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver detalles
          <IconChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
        <Link
          to={`/servicios/${service.id}`}
          className="inline-flex items-center justify-center h-11 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-soft"
        >
          Reservar
        </Link>
      </div>
    </div>
  </motion.article>
);

const FeaturedServices = () => {
  const [active, setActive] = useState('all');
  const [activeDot, setActiveDot] = useState(0);
  const carouselRef = useRef(null);

  const filtered = active === 'all' ? featuredServices : featuredServices.filter((s) => s.category === active);

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const items = el.children;
    let index = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].offsetLeft <= el.scrollLeft + 8) index = i;
    }
    setActiveDot(Math.min(index, filtered.length - 1));
  };

  const goTo = (index) => {
    const el = carouselRef.current;
    if (!el) return;
    const target = el.children[index];
    if (!target) return;
    el.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    setActiveDot(index);
  };

  return (
    <section id="servicios-estrella" className="relative overflow-hidden py-16 sm:py-24 lg:py-28" aria-labelledby="servicios-estrella-heading">
      {/* Fondo 2D/3D */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-50 to-accent-100" aria-hidden="true" />
      {/* Textura de puntos */}
      <div className="absolute inset-0 opacity-25" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle, rgba(77,53,94,0.45) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
      <motion.div
        className="absolute -top-20 -right-20 w-[460px] h-[460px] rounded-full bg-secondary-200 blur-xl"
        aria-hidden="true"
        animate={{ y: [0, -26, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-6 -left-28 w-[400px] h-[400px] rounded-full bg-primary-300 blur-xl"
        aria-hidden="true"
        animate={{ y: [0, 22, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-300 blur-xl"
        aria-hidden="true"
        animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-16 right-8 w-[220px] h-[220px] rounded-full bg-primary-200 blur-xl"
        aria-hidden="true"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative container-custom">
        {/* Encabezado de sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-8 lg:mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary-500 uppercase mb-3">
                <span className="w-6 h-px bg-primary-300" aria-hidden="true" />
                Descubre Maia
              </p>
              <h2 id="servicios-estrella-heading" className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-primary-900">
                Nuestros servicios estrella
              </h2>
              <p className="mt-3 text-lg text-neutral-500 max-w-xl">
                Todo lo que necesitas para sentirte y verte increíble.
              </p>
            </div>
            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:gap-3 transition-all w-fit"
            >
              Ver todos los servicios
              <IconArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        {/* Selector de categorías (deslizable en móvil) */}
        <div
          role="tablist"
          aria-label="Filtrar servicios por categoría"
          className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mb-2 snap-x"
        >
          {categories.map((cat) => {
            const isActive = active === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActive(cat.key);
                  setActiveDot(0);
                  carouselRef.current?.scrollTo?.({ left: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 h-[44px] px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 snap-start touch-manipulation ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-accent-50/70 text-primary-600 border border-primary-100/60 hover:bg-accent-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Carrusel en móvil */}
        <div className="md:hidden">
          <motion.div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto no-scrollbar pt-6 snap-x snap-mandatory -mx-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            {filtered.map((service) => (
              <div key={service.id} className="card-width w-[86%] shrink-0 snap-center">
                <ServiceCard service={service} />
              </div>
            ))}
          </motion.div>

          {/* Indicador de puntos */}
          {filtered.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-6" aria-label="Posición del carrusel">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Ir al servicio ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeDot === i ? 'w-6 bg-primary-500' : 'w-2 bg-primary-200'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Enlace al catálogo en móvil */}
          <div className="mt-8 text-center">
            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:gap-3 transition-all"
            >
              Ver todos los servicios
              <IconArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Grilla en desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-7 mt-4">
          {filtered.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;