import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Award, ChevronRight, Sparkles } from 'lucide-react';
import { Section, Container, SectionHeader } from '../components/layout/Section';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { professionalsAPI } from '../services/api';

// Helper mock para previsualizar sin backend
function getMockProfessional(id) {
  const mocks = [
    {
      id: 1,
      user: { name: 'Daniela Rodríguez', avatar: 'https://images.unsplash.com/photo-1595959183015-180ce516e828?auto=format&fit=crop&q=80&w=600' },
      specialty: 'Especialista en uñas',
      bio: 'Especialista en técnicas acrílicas, semipermanentes y Nail Art. Pasión por los detalles y la creatividad. Siempre buscando estar a la vanguardia de las últimas tendencias para ofrecer un servicio único y personalizado.',
      rating: 4.9,
      experienceYears: 4,
      services: [{ id: 1, name: 'Acrílicas' }, { id: 2, name: 'Semipermanente' }, { id: 3, name: 'Nail Art' }],
      branches: [{ id: 1, name: 'Sede Norte' }]
    },
    {
      id: 2,
      user: { name: 'Valeria Gómez', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600' },
      specialty: 'Estilista Master',
      bio: 'Experta en colorimetría, balayage y tratamientos capilares de hidratación profunda.',
      rating: 4.8,
      experienceYears: 6,
      services: [{ id: 4, name: 'Balayage' }, { id: 5, name: 'Corte' }, { id: 6, name: 'Keratina' }],
      branches: [{ id: 1, name: 'Sede Norte' }, { id: 2, name: 'Sede Chapinero' }]
    },
    {
      id: 3,
      user: { name: 'Camila Torres', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600' },
      specialty: 'Lashista',
      bio: 'Diseño de miradas, extensiones de pestañas volumen ruso y clásicas, lifting de pestañas.',
      rating: 5.0,
      experienceYears: 3,
      services: [{ id: 7, name: 'Volumen Ruso' }, { id: 8, name: 'Lifting' }],
      branches: [{ id: 2, name: 'Sede Chapinero' }]
    }
  ];
  return mocks.find(m => m.id === Number(id)) || mocks[0];
}

const ProfessionalProfileImage = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 flex items-center justify-center" aria-hidden="true">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary-400 mx-auto" />
          <p className="mt-2 text-sm font-medium text-primary-500">Foto próxima</p>
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
      className="w-full h-full object-cover"
    />
  );
};

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        setLoading(true);
        // Llamada real al backend
        const res = await professionalsAPI.getById(id);
        if (res.data?.data) {
          setProfessional(res.data.data);
        } else {
          setProfessional(getMockProfessional(id));
        }
      } catch (err) {
        console.error('Error fetching professional:', err);
        setProfessional(getMockProfessional(id));
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-24">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-neutral-50 text-center pt-24">
        <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Profesional no encontrada</h2>
        <p className="text-neutral-600 mb-6">No pudimos cargar la información de esta profesional.</p>
        <Link to="/profesionales">
          <Button>Volver al directorio</Button>
        </Link>
      </div>
    );
  }

  const user = professional.user || {};
  const services = professional.services || [];
  const branches = professional.branches || [];
  const firstName = user.name ? user.name.split(' ')[0] : 'Profesional';

  return (
    <div className="bg-neutral-50 min-h-screen pt-24 pb-16">
      <Container>
        {/* Breadcrumb / Back Link */}
        <Link 
          to="/profesionales" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a profesionales
        </Link>

        {/* Tarjeta Principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_-12px_rgba(77,53,94,0.1)] border border-neutral-100 mb-16"
        >
          <div className="flex flex-col md:flex-row">
            {/* Imagen Izquierda */}
            <div className="md:w-2/5 lg:w-1/3 aspect-[3/4] md:aspect-auto relative bg-neutral-100">
              <ProfessionalProfileImage src={user.avatar} alt={user.name} />
            </div>
            
            {/* Info Derecha */}
            <div className="md:w-3/5 lg:w-2/3 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-2">
                    {user.name}
                  </h1>
                  <p className="text-lg font-medium text-secondary-600">
                    {professional.specialty || 'Especialista en Belleza'}
                  </p>
                </div>
                {professional.rating > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-50 text-warning-700 rounded-full font-semibold text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    {professional.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {professional.bio && (
                <p className="text-neutral-600 text-lg leading-relaxed mb-8 max-w-3xl">
                  {professional.bio}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {branches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-widest mb-3">Sedes</h3>
                    <ul className="space-y-3">
                      {branches.map(b => (
                        <li key={b.id} className="flex items-center gap-3 text-neutral-600">
                          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-primary-500" />
                          </div>
                          {b.branch?.name || b.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {professional.experienceYears > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-widest mb-3">Experiencia</h3>
                    <div className="flex items-center gap-3 text-neutral-600">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-primary-500" />
                      </div>
                      {professional.experienceYears} años de experiencia
                    </div>
                  </div>
                )}
              </div>

              {services.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-widest mb-3">Servicios Destacados</h3>
                  <div className="flex flex-wrap gap-2">
                    {services.map(svc => (
                      <span key={svc.id} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg">
                        {svc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-neutral-100">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto shadow-soft"
                  onClick={() => navigate(`/reservar?professionalId=${professional.id}`)}
                >
                  Reservar con {firstName}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trabajos realizados (Portafolio) */}
        <Section background="transparent" className="px-0 py-0" id="portfolio">
          <SectionHeader align="left" title="Trabajos realizados" subtitle="Galería de servicios recientes" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {/* Mock de portafolio preparado para integrar con galería */}
            {[1, 2, 3, 4].map((item, index) => (
              <motion.div 
                key={item} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="aspect-square rounded-2xl overflow-hidden bg-neutral-200 group relative"
              >
                <img 
                  src={`https://images.unsplash.com/photo-${item === 1 ? '1519014816548-bf5fe459e981' : item === 2 ? '1522337660859-02fbefca4702' : item === 3 ? '1487412720507-e7ab37603c6f' : '1600948836101-f9ff09c1f0b6'}?auto=format&fit=crop&q=80&w=400`}
                  alt={`Trabajo realizado ${item}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium flex items-center gap-1">Ver más <ChevronRight className="w-4 h-4"/></span>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

      </Container>
    </div>
  );
};

export default ProfessionalProfile;
