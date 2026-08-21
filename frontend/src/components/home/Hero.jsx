import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconCalendar, IconArrowRight, IconStar, IconLock, IconShieldCheck, IconSparkles } from '@tabler/icons-react';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

// Imagen definitiva del Hero (asset local en /public/images/hero.png)
const HERO_IMAGE = '/images/hero.png';

const HeroImage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25 }}
      className="relative flex items-center justify-center my-8 lg:my-0"
      aria-hidden="true"
    >
      <div
        className="w-full overflow-hidden rounded-[20px] h-[320px] sm:h-[360px] lg:h-auto lg:rounded-none lg:aspect-[4/5] lg:[mask-image:radial-gradient(120%_120%_at_50%_40%,#000_60%,transparent_90%)]"
      >
        <img
          src={HERO_IMAGE}
          alt=""
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-secondary-200/40 blur-2xl rounded-full" />
    </motion.div>
  );
};

const BookingForm = ({ services = [], professionals = [] }) => {
  const [values, setValues] = useState({ service: '', professional: '', date: '', time: '' });

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="w-full lg:max-w-[380px] mx-auto lg:ml-auto bg-white/80 backdrop-blur-xl rounded-[24px] p-5 sm:p-8 border border-white/60 shadow-[0_30px_60px_-20px_rgba(77,53,94,0.45)] ring-1 ring-primary-100/40"
    >
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-primary-800">
          Reserva tu cita <span className="text-secondary-500">✦</span>
        </h3>
        <p className="text-sm text-neutral-500 mt-1">Rápido, fácil y seguro</p>
      </div>

      <form className="space-y-[17px]" onSubmit={(e) => e.preventDefault()} autoComplete="off">
        <Select
          label="Servicio"
          placeholder="Selecciona un servicio"
          name="service"
          value={values.service}
          onChange={set('service')}
          options={services.slice(0, 8).map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          label="Profesional"
          placeholder="Elige tu profesional"
          name="professional"
          value={values.professional}
          onChange={set('professional')}
          options={professionals.map((p) => ({ value: p.id, label: p.user?.name || p.name }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" placeholder="Selecciona fecha" value={values.date} onChange={set('date')} autoComplete="off" />
          <Input label="Hora" type="time" placeholder="Selecciona hora" value={values.time} onChange={set('time')} autoComplete="off" />
        </div>

        <Button type="submit" size="lg" fullWidth rightIcon={<IconArrowRight className="w-5 h-5" />} className="h-12">
          Reservar ahora
        </Button>
      </form>

      <p className="mt-4 text-xs text-neutral-500 flex items-center justify-center gap-1.5">
        <IconLock className="w-3.5 h-3.5" aria-hidden="true" />
        Tus datos están protegidos y son confidenciales.
      </p>
    </motion.div>
  );
};

const Hero = ({ services = [], professionals = [] }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-secondary-100 to-primary-200/70">
      {/* Capa mesh: glows radiales que crean profundidad 3D */}
      <div className="absolute inset-0" aria-hidden="true" style={{ background: 'radial-gradient(60% 50% at 20% 20%, rgba(255,255,255,0.85) 0%, transparent 60%), radial-gradient(50% 45% at 85% 15%, rgba(99,72,117,0.18) 0%, transparent 60%), radial-gradient(55% 50% at 78% 88%, rgba(238,231,247,0.9) 0%, transparent 65%), radial-gradient(45% 45% at 15% 90%, rgba(108,99,123,0.14) 0%, transparent 60%)' }} />

      {/* Textura de puntos sutil (2D) */}
      <div className="absolute inset-0 opacity-[0.15]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle, rgba(77,53,94,0.35) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Orbes flotantes con animación de profundidad */}
      <motion.div
        className="absolute -top-24 right-10 w-[380px] h-[380px] rounded-full bg-secondary-300/40 blur-3xl"
        aria-hidden="true"
        animate={{ y: [0, -28, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -left-16 top-1/3 w-[320px] h-[320px] rounded-full bg-primary-400/30 blur-3xl"
        aria-hidden="true"
        animate={{ y: [0, 24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-200/40 blur-3xl"
        aria-hidden="true"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Destello de luz superior (gloss elegante) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-white/40 blur-3xl" aria-hidden="true" />

      {/* Viñeta sutil para asentar el contenido */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,transparent_55%,rgba(77,93,94,0.10)_100%)]" aria-hidden="true" />

      <div className="relative container-custom">
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)] gap-10 lg:gap-6 items-center py-14 sm:py-16 lg:py-0 lg:min-h-[600px]">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-primary-600 mb-5">
              <IconStar className="w-4 h-4 fill-secondary-300 text-secondary-300" aria-hidden="true" />
              <span>Belleza que refleja tu esencia</span>
            </p>

            <h1 className="font-display leading-[1.05] text-primary-800">
              <span className="block text-[44px] sm:text-6xl lg:text-[64px] font-semibold">
                Tu mejor versión
              </span>
              <span className="block text-[40px] sm:text-5xl lg:text-[54px] font-medium italic text-secondary-400 mt-1">
                comienza aquí
              </span>
            </h1>

            <p className="mt-6 text-primary-800/80 leading-relaxed max-w-[470px]">
              En Maia Salón &amp; Spa realzamos tu belleza con técnicas de vanguardia,
              productos premium y un servicio pensado para hacerte sentir única.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3.5">
              <Link to="/agendar" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  leftIcon={<IconCalendar className="w-5 h-5" />}
                  className="h-12 px-7 rounded-[13px] w-full"
                >
                  Reservar cita
                </Button>
              </Link>
              <Link
                to="/servicios"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[13px] text-primary-600 border border-primary-200 hover:bg-primary-50/60 transition-colors font-medium w-full sm:w-auto"
              >
                Ver servicios
                <IconArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>

            {/* Franja de confianza */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 border-t border-primary-100/70 pt-6 max-w-[470px]">
              <div className="flex items-center gap-2">
                <div className="flex text-accent-500" aria-label="Valoración 4.9 de 5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <IconStar key={i} className="w-4 h-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-neutral-500">
                  <span className="font-semibold text-primary-800">4.9</span> en opiniones
                </p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-primary-100/70" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <IconShieldCheck className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <p className="text-sm text-neutral-500">Reserva segura y garantizada</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-primary-100/70" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-secondary-500" aria-hidden="true" />
                <p className="text-sm text-neutral-500">+1.200 clientas satisfechas</p>
              </div>
            </div>
          </motion.div>

          {/* Imagen */}
          <div className="order-2 lg:order-2 w-full flex items-center justify-center lg:py-8">
            <HeroImage />
          </div>

          {/* Reserva rápida */}
          <div className="order-3 lg:order-3 w-full justify-self-center lg:justify-self-end">
            <BookingForm services={services} professionals={professionals} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;