import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconSparkles, IconHeart, IconStar, IconMapPin, IconCheck, IconShield, IconTruck, IconHeadphones } from '@tabler/icons-react';
import { Section, Container, SectionHeader } from '../components/layout/Section';
import ProfessionalCard from '../components/booking/ProfessionalCard';
import BranchCard from '../components/booking/BranchCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { servicesAPI, professionalsAPI, branchesAPI } from '../services/api';
import Hero from '../components/home/Hero';
import FeaturedServices from '../components/home/FeaturedServices';

const Home = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredProfessionals, setFeaturedProfessionals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, prosRes, branchesRes] = await Promise.all([
          servicesAPI.getAll({ isPopular: true, limit: 6, sortBy: 'displayOrder' }),
          professionalsAPI.getAll({ isFeatured: true, limit: 3 }),
          branchesAPI.getAll()
        ]);
        setFeaturedServices(servicesRes.data.data || []);
        setFeaturedProfessionals(prosRes.data.data || []);
        setBranches(branchesRes.data.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
        setError('No se pudieron cargar los datos. Intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: IconShield, title: 'Profesionales Certificados', desc: 'Equipo experto con años de experiencia' },
    { icon: IconSparkles, title: 'Productos Premium', desc: 'Marcas profesionales de alta calidad' },
    { icon: IconTruck, title: 'Ambiente Relajante', desc: 'Espacios diseñados para tu bienestar' },
    { icon: IconHeadphones, title: 'Atención Personalizada', desc: 'Cada servicio se adapta a ti' }
  ];

  const categories = [
    { key: 'nails', label: 'Uñas', icon: IconSparkles, color: 'primary', count: 15,
      items: ['Acrílicas', 'Semipermanentes', 'Manicure', 'Pedicure', 'Nail Art'] },
    { key: 'hair', label: 'Cabello', icon: IconHeart, color: 'secondary', count: 12,
      items: ['Cortes', 'Peinados', 'Tratamientos', 'Color', 'Keratina'] },
    { key: 'eyelashes', label: 'Pestañas', icon: IconStar, color: 'accent', count: 8,
      items: ['Clásicas', 'Volumen Ruso', 'Híbridas', 'Lifting', 'Retoques'] }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Algo salió mal</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <Hero services={featuredServices} professionals={featuredProfessionals} />

      {/* Bloque 3 — Servicios Estrella */}
      <FeaturedServices />

      {/* Features */}
      <Section background="white" id="features">
        <Container>
          <SectionHeader
            title="Por qué elegirnos"
            subtitle="Experiencia, calidad y atención en cada detalle"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 text-center group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Categories */}
      <Section background="neutral-50" id="categories">
        <Container>
          <SectionHeader
            title="Nuestras Categorías"
            subtitle="Especialistas en cada área para ofrecerte lo mejor"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <Link
                key={cat.key}
                to={`/servicios?category=${cat.key}`}
                className="card-elevated p-6 group overflow-hidden relative"
                style={{ borderTop: `4px solid transparent` }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative z-10"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {cat.color === 'primary' && (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white">
                        <cat.icon className="w-7 h-7" />
                      </div>
                    )}
                    {cat.color === 'secondary' && (
                      <div className="w-full h-full bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white">
                        <cat.icon className="w-7 h-7" />
                      </div>
                    )}
                    {cat.color === 'accent' && (
                      <div className="w-full h-full bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white">
                        <cat.icon className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-xl text-neutral-900 mb-2">{cat.label}</h3>
                  <p className="text-neutral-600 mb-4">{cat.count} servicios disponibles</p>
                  <ul className="space-y-2 mb-6">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                    Ver todos
                    <IconArrowRight className="w-4 h-4" />
                  </span>
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured Professionals */}
      {featuredProfessionals.length > 0 && (
        <Section background="neutral-50" id="featured-professionals">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <SectionHeader align="left" title="Nuestras Profesionales" subtitle="Expertas apasionadas por su trabajo" />
              <Link to="/profesionales" className="mt-4 sm:mt-0 btn-outline">
                Ver equipo
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProfessionals.slice(0, 3).map((pro, index) => (
                <ProfessionalCard
                  key={pro.id}
                  professional={pro}
                  variant="featured"
                  showServices
                  showBranches
                  onClick={() => {}}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Branches */}
      {branches.length > 0 && (
        <Section background="white" id="branches">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <SectionHeader align="left" title="Nuestras Sedes" subtitle="Tres ubicaciones en Bogotá para tu comodidad" />
              <Link to="/sedes" className="mt-4 sm:mt-0 btn-outline">
                Ver todas
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, index) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  variant="featured"
                  onClick={() => {}}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA Section */}
      <Section background="gradient" id="cta">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              ¿Lista para tu próxima cita?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Reserva online en 2 minutos. Elige tu sede, servicio, profesional y hora favorita.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/reservar">
                <Button size="lg" variant="secondary" rightIcon={<IconArrowRight className="w-5 h-5" />} className="w-full sm:w-auto">
                  Reservar Ahora
                </Button>
              </Link>
              <Link to="/servicios">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Explorar Servicios
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
};

export default Home;