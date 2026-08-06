import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Star, MapPin, Check, Shield, Truck, Headphones } from 'lucide-react';
import { Section, Container, SectionHeader } from '../components/layout/Section';
import ServiceCard from '../components/booking/ServiceCard';
import ProfessionalCard from '../components/booking/ProfessionalCard';
import BranchCard from '../components/booking/BranchCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { servicesAPI, professionalsAPI, branchesAPI } from '../services/api';
import { formatPrice } from '../utils/formatters';

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
    { icon: Shield, title: 'Profesionales Certificados', desc: 'Equipo experto con años de experiencia' },
    { icon: Sparkles, title: 'Productos Premium', desc: 'Marcas profesionales de alta calidad' },
    { icon: Truck, title: 'Ambiente Relajante', desc: 'Espacios diseñados para tu bienestar' },
    { icon: Headphones, title: 'Atención Personalizada', desc: 'Cada servicio se adapta a ti' }
  ];

  const categories = [
    { key: 'nails', label: 'Uñas', icon: Sparkles, color: 'primary', count: 15,
      items: ['Acrílicas', 'Semipermanentes', 'Manicure', 'Pedicure', 'Nail Art'] },
    { key: 'hair', label: 'Cabello', icon: Heart, color: 'secondary', count: 12,
      items: ['Cortes', 'Peinados', 'Tratamientos', 'Color', 'Keratina'] },
    { key: 'eyelashes', label: 'Pestañas', icon: Star, color: 'accent', count: 8,
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
      <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ec4899%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <Badge variant="primary" className="mb-6" size="lg" dot>
                ¡Nueva sede en Chapinero!
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-neutral-900 leading-tight mb-6">
                Tu belleza, <span className="gradient-text">nuestra pasión</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Salón de belleza integral: uñas, cabello y pestañas. Profesionales certificados, productos premium y una experiencia única en cada visita.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/reservar">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto">
                    Reservar Cita
                  </Button>
                </Link>
                <Link to="/servicios">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Ver Servicios
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>3 sedes en Bogotá</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>35+ servicios</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <span>Reserva online 24/7</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-2 overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">Reserva en 3 pasos</h3>
                      <p className="text-neutral-600">Elige sede, servicio y hora. Paga online o en salón.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

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
                    <ArrowRight className="w-4 h-4" />
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

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <Section background="white" id="featured-services">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <SectionHeader align="left" title="Servicios Destacados" subtitle="Los más solicitados por nuestras clientas" />
              <Link to="/servicios" className="mt-4 sm:mt-0 btn-outline">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.slice(0, 6).map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  variant="featured"
                  onClick={() => {}}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Featured Professionals */}
      {featuredProfessionals.length > 0 && (
        <Section background="neutral-50" id="featured-professionals">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <SectionHeader align="left" title="Nuestras Profesionales" subtitle="Expertas apasionadas por su trabajo" />
              <Link to="/profesionales" className="mt-4 sm:mt-0 btn-outline">
                Ver equipo
                <ArrowRight className="w-4 h-4" />
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
                <ArrowRight className="w-4 h-4" />
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
                <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto">
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