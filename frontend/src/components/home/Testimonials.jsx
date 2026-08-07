import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Carolina Herrera',
    service: 'Balayage Premium',
    image: 'https://i.pravatar.cc/150?u=1',
    text: 'La experiencia en Maia es de otro nivel. El equipo me asesoró desde el primer momento y el resultado de mi balayage fue exactamente lo que quería. El salón es hermoso y el ambiente súper relajante.',
    rating: 5
  },
  {
    id: 2,
    name: 'Valentina Restrepo',
    service: 'Uñas Acrílicas & Spa',
    image: 'https://i.pravatar.cc/150?u=2',
    text: 'Increíble la atención al detalle. Mis uñas quedaron perfectas y me duraron intactas casi un mes. Se nota que usan productos de primera calidad. ¡Totalmente recomendadas!',
    rating: 5
  },
  {
    id: 3,
    name: 'Sofía Vergara',
    service: 'Alisado Completo',
    image: 'https://i.pravatar.cc/150?u=3',
    text: 'Llevo años buscando un lugar donde me hagan un buen alisado sin dañar mi cabello, y por fin lo encontré. El brillo que le dejaron a mi pelo es espectacular. Definitivamente volveré.',
    rating: 5
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 relative overflow-hidden bg-neutral-900" id="testimonios">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-primary-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-gradient-to-l from-secondary-500/20 to-transparent blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary-400 uppercase mb-3"
          >
            <span className="w-6 h-px bg-primary-400/50" />
            Experiencias Reales
            <span className="w-6 h-px bg-primary-400/50" />
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Lo que dicen nuestras clientas
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-20">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-20">
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(207,67,144,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(207,67,144,0.6)]"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="relative overflow-hidden px-4 md:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative"
              >
                <Quote className="absolute top-8 left-8 w-16 h-16 text-white/5" />
                
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary-400 text-primary-400" />
                    ))}
                  </div>
                  
                  <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed font-light mb-10">
                    "{testimonials[currentIndex].text}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={testimonials[currentIndex].name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/50"
                      loading="lazy"
                    />
                    <div className="text-left">
                      <h4 className="text-white font-semibold font-display text-lg">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-primary-400 text-sm">
                        {testimonials[currentIndex].service}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir al testimonio ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-2 bg-primary-500' 
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
