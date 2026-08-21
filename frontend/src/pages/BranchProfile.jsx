import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ArrowLeft, MapPin, Clock, Phone, ChevronRight, Star } from 'lucide-react';
import { Container } from '../components/layout/Section';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { branchesAPI } from '../services/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFpYS1zYWxvbiIsImEiOiJjbHhxNGRnM24wMm9tMmtvOG51NWVjbnoyIn0.dummy_token';

function getMockBranch(id) {
  const mocks = [
    {
      id: 1,
      name: 'Sede Norte',
      address: 'Calle 122 # 15-20, Bogotá',
      hours: 'Lunes a Sábado: 8:00 AM - 8:00 PM\nDomingos y Festivos: Cerrado',
      phone: '+57 300 123 4567',
      lat: 4.7001,
      lng: -74.0321,
      services: ['Acrílicas', 'Semipermanente', 'Corte', 'Colorimetría', 'Peinados'],
      professionals: [
        { id: 1, name: 'Daniela Rodríguez', avatar: 'https://images.unsplash.com/photo-1595959183015-180ce516e828?auto=format&fit=crop&q=80&w=150', specialty: 'Especialista en uñas' },
        { id: 2, name: 'Valeria Gómez', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150', specialty: 'Estilista Master' }
      ]
    },
    {
      id: 2,
      name: 'Sede Chapinero',
      address: 'Cra. 7 # 60-12, Bogotá',
      hours: 'Lunes a Sábado: 9:00 AM - 7:00 PM\nDomingos: 9:00 AM - 2:00 PM',
      phone: '+57 300 987 6543',
      lat: 4.6461,
      lng: -74.0617,
      services: ['Balayage', 'Keratina', 'Volumen Ruso', 'Lifting'],
      professionals: [
        { id: 2, name: 'Valeria Gómez', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150', specialty: 'Estilista Master' },
        { id: 3, name: 'Camila Torres', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', specialty: 'Lashista' }
      ]
    }
  ];
  return mocks.find(m => m.id === Number(id)) || mocks[0];
}

const BranchProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const res = await branchesAPI.getById(id);
        if (res.data?.data) {
          setBranch(res.data.data);
        } else {
          setBranch(getMockBranch(id));
        }
      } catch (err) {
        console.error('Error fetching branch:', err);
        setBranch(getMockBranch(id));
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 pt-24">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-neutral-50 text-center pt-24">
        <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Sede no encontrada</h2>
        <p className="text-neutral-600 mb-6">No pudimos cargar la información de esta sede.</p>
        <Link to="/sedes">
          <Button>Volver al directorio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pt-24 pb-16">
      <Container>
        {/* Breadcrumb */}
        <Link 
          to="/sedes" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a sedes
        </Link>

        {/* Tarjeta Principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_-12px_rgba(77,53,94,0.1)] border border-neutral-100 mb-16"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Info Izquierda */}
            <div className="w-full lg:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-3">
                  {branch.name}
                </h1>
                <div className="flex items-center gap-2 text-sm font-semibold text-warning-700 bg-warning-50 w-fit px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" /> Sede Maia
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm uppercase tracking-wider mb-1">Dirección</h3>
                    <p className="text-neutral-600">{branch.address}</p>
                    <a 
                      href={`https://maps.google.com/?q=${branch.lat},${branch.lng}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Cómo llegar →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm uppercase tracking-wider mb-1">Horarios</h3>
                    <p className="text-neutral-600 whitespace-pre-line">{branch.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm uppercase tracking-wider mb-1">Contacto</h3>
                    <p className="text-neutral-600">{branch.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-neutral-100">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto shadow-soft"
                  onClick={() => navigate(`/reservar?locationId=${branch.id}`)}
                >
                  Reservar en esta sede
                </Button>
              </div>
            </div>

            {/* Mapa Derecha */}
            <div className="w-full lg:w-1/2 h-[400px] lg:h-auto bg-neutral-200 relative border-l border-neutral-100">
              {branch.lat && branch.lng ? (
                <Map
                  initialViewState={{
                    longitude: branch.lng,
                    latitude: branch.lat,
                    zoom: 14.5
                  }}
                  mapStyle="mapbox://styles/mapbox/light-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  attributionControl={false}
                  interactive={true}
                >
                  <NavigationControl position="top-right" />
                  <Marker longitude={branch.lng} latitude={branch.lat} anchor="bottom">
                    <div className="relative flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-primary-600 fill-primary-100" />
                    </div>
                  </Marker>
                </Map>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400">
                  <MapPin className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">Ubicación no disponible en el mapa</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sección Especialistas y Servicios */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Especialistas en esta Sede */}
          {branch.professionals && branch.professionals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                Especialistas disponibles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {branch.professionals.map(pro => (
                  <Link
                    key={pro.id}
                    to={`/profesionales/${pro.id}`}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <img 
                      src={pro.avatar || 'https://via.placeholder.com/100'} 
                      alt={pro.name} 
                      className="w-14 h-14 rounded-full object-cover border border-neutral-100"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 text-sm group-hover:text-primary-600 transition-colors">{pro.name}</h4>
                      <p className="text-xs text-neutral-500">{pro.specialty}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-500" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Servicios en esta Sede */}
          {branch.services && branch.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                Servicios destacados
              </h2>
              <div className="flex flex-wrap gap-2">
                {branch.services.map((svc, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-xl shadow-sm">
                    {svc}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

      </Container>
    </div>
  );
};

export default BranchProfile;
