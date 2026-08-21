import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Star, Sparkles, ChevronRight, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { Container } from '../components/layout/Section';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProfessionalAvatar from '../components/ui/ProfessionalAvatar';
import { professionalsAPI, branchesAPI } from '../services/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const isMapboxTokenValid = MAPBOX_TOKEN && !MAPBOX_TOKEN.includes('dummy_token');

const ServiceIcons = () => (
  <div className="flex gap-2 mt-2">
    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
    </div>
    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
    </div>
    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
    </div>
    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    </div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
    <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
    <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Algo salió mal</h3>
    <p className="text-neutral-600 mb-6">No pudimos cargar la información en este momento.</p>
    <Button onClick={onRetry}>Reintentar</Button>
  </div>
);

const EmptyState = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
      <Star className="w-8 h-8 text-neutral-400" />
    </div>
    <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">Aún no hay datos disponibles</h3>
    <p className="text-neutral-600">Estamos preparando nuestros servicios para ti.</p>
  </div>
);

const Professionals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/sedes' ? 'branches' : 'professionals'); 
  const [professionals, setProfessionals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Selecciones del usuario
  const [selectedPro, setSelectedPro] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Map state
  const [viewState, setViewState] = useState({
    longitude: -74.0450,
    latitude: 4.6700,
    zoom: 11
  });
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);
      const [prosRes, branchesRes] = await Promise.all([
        professionalsAPI.getAll(),
        branchesAPI.getAll()
      ]);

      const prosData = prosRes.data?.data || [];
      const branchesData = branchesRes.data?.data || [];
      
      setProfessionals(prosData);
      setBranches(branchesData);

      // Centrar el mapa en la primera sede si existe
      if (branchesData.length > 0 && branchesData[0].latitude && branchesData[0].longitude) {
        setViewState(prev => ({
          ...prev,
          latitude: Number(branchesData[0].latitude),
          longitude: Number(branchesData[0].longitude),
          zoom: 11
        }));
      }

    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    if (branch.latitude && branch.longitude) {
      setViewState({
        longitude: Number(branch.longitude),
        latitude: Number(branch.latitude),
        zoom: 13,
        transitionDuration: 1000
      });
      setPopupInfo(branch);
    }
  };

  const checkCompatibility = () => {
    if (!selectedPro || !selectedBranch) return true;
    
    // Si el profesional tiene un array de Locations/Branches, validarlo.
    // Si no lo tiene, asumimos que es compatible por defecto para no romper el flujo
    // si el backend no lo envía aún.
    const proLocations = selectedPro.Locations || selectedPro.branches || [];
    if (proLocations.length > 0) {
      return proLocations.some(loc => loc.id === selectedBranch.id);
    }
    
    return true; // Compatible si no hay data estricta para validar
  };

  const isCompatible = checkCompatibility();

  const handleContinue = () => {
    if (selectedPro && selectedBranch && isCompatible) {
      navigate(`/reservar?professionalId=${selectedPro.id}&locationId=${selectedBranch.id}`);
    } else if (selectedPro) {
      navigate(`/reservar?professionalId=${selectedPro.id}`);
    } else if (selectedBranch) {
      navigate(`/reservar?locationId=${selectedBranch.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] pt-24 gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-neutral-500 font-medium">Cargando profesionales y sedes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-[#FDFBF7] pt-24 min-h-screen"><ErrorState onRetry={fetchData} /></div>;
  }

  if (professionals.length === 0 && branches.length === 0) {
    return <div className="bg-[#FDFBF7] pt-24 min-h-screen"><EmptyState /></div>;
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen pt-24 pb-32">
      <Container>
        {/* Header Block exactly as in the image */}
        <div className="mb-10 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-[42px] font-semibold text-primary-900 mb-2">
            Profesionales & Sedes
          </h1>
          <p className="text-neutral-600 text-lg mb-6 max-w-md">
            Elige tu profesional y la sede más cercana para tu cita ideal. <Sparkles className="inline-block w-5 h-5 text-accent-500" />
          </p>
          
          {/* Mobile Tabs */}
          <div className="inline-flex lg:hidden items-center p-1 bg-white border border-neutral-200/60 rounded-xl shadow-sm mb-4">
            <button
              onClick={() => setActiveTab('professionals')}
              className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'professionals'
                  ? 'bg-primary-700 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Profesionales
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'branches'
                  ? 'bg-primary-700 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Sedes
            </button>
          </div>
        </div>

        {/* Desktop: Two Columns | Mobile: Active Tab */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Profesionales Column (Hidden on mobile if activeTab is branches) */}
            <div className={`flex-col gap-4 ${activeTab === 'professionals' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-display text-xl text-primary-900">Nuestros profesionales</h3>
                <Link to="/profesionales" className="text-sm font-medium text-primary-600 hover:text-primary-800">Ver todos</Link>
              </div>
              
              <div className="flex flex-col gap-4">
                {professionals.length === 0 && (
                  <p className="text-neutral-500 text-sm italic">No hay profesionales registrados aún.</p>
                )}
                {professionals.map((pro) => {
                  const isSelected = selectedPro?.id === pro.id;
                  const name = pro.user?.firstName ? `${pro.user.firstName} ${pro.user.lastName || ''}` : pro.user?.name || pro.name || 'Profesional';
                  const avatarUrl = pro.user?.profilePicture || pro.user?.avatar || null;

                  return (
                    <div 
                      key={pro.id} 
                      onClick={() => setSelectedPro(isSelected ? null : pro)}
                      className={`bg-white rounded-2xl p-5 cursor-pointer flex items-center gap-4 transition-all duration-300 border
                        ${isSelected ? 'border-primary-500 bg-primary-50/20 ring-1 ring-primary-500' : 'border-neutral-100 shadow-sm hover:shadow-md'}`}
                    >
                      <ProfessionalAvatar src={avatarUrl} name={name} size="md" />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 text-base">{name}</h4>
                        <p className="text-sm text-neutral-500 mb-2">{pro.specialty || 'Especialista'}</p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {(pro.rating > 0) && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 text-warning-500 fill-warning-500" />
                              {pro.rating} <span className="text-neutral-400 font-normal">({pro.reviews || 0})</span>
                            </span>
                          )}
                          {pro.topPro && (
                            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                              Top Pro
                            </span>
                          )}
                          {!pro.topPro && pro.specialty?.toLowerCase().includes('maquillaje') && (
                            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                              Maquillaje
                            </span>
                          )}
                           {!pro.topPro && pro.specialty?.toLowerCase().includes('extensiones') && (
                            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                              Extensiones
                            </span>
                          )}
                          {/* Eliminada la disponibilidad ficticia según Prompt 11 - Se integrará en Prompt 12 */}
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-primary-600 text-white' : 'bg-[#F2EFE9] text-primary-800'}`}>
                        {isSelected ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sedes Column (Hidden on mobile if activeTab is professionals) */}
            <div className={`flex-col gap-4 ${activeTab === 'branches' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-display text-xl text-primary-900">Nuestras sedes</h3>
                <Link to="/sedes" className="text-sm font-medium text-primary-600 hover:text-primary-800">Ver todas</Link>
              </div>
              
              <div className="flex flex-col gap-4">
                {branches.length === 0 && (
                  <p className="text-neutral-500 text-sm italic">No hay sedes registradas aún.</p>
                )}
                {branches.map((branch) => {
                  const isSelected = selectedBranch?.id === branch.id;
                  return (
                    <div 
                      key={branch.id}
                      onClick={() => handleSelectBranch(branch)}
                      className={`bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 border
                        ${isSelected ? 'border-primary-500 bg-primary-50/20 ring-1 ring-primary-500' : 'border-neutral-100 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <h4 className="font-semibold text-neutral-900 text-base">{branch.name}</h4>
                        {branch.recommended && (
                          <span className="ml-2 px-2.5 py-0.5 bg-[#F4E9D8] text-primary-900 text-[11px] font-semibold rounded-full">
                            Sede recomendada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mb-1 pl-7">{branch.address}</p>
                      
                      {/* En vez de isOpen ficticio, verificamos si existe la prop real del backend */}
                      {(branch.hours || branch.openTime) && (
                         <p className="text-sm font-medium text-neutral-700 mb-3 pl-7">
                           <span className="text-green-600 font-semibold">{branch.isActive !== false ? 'Abierto' : 'Cerrado'}</span> · {branch.hours || `${branch.openTime} - ${branch.closeTime}`}
                         </p>
                      )}
                      
                      <div className="pl-7">
                        <p className="text-xs text-neutral-400 mb-1">Servicios disponibles</p>
                        <ServiceIcons />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Map Section (Appears below branches on mobile, and spans both columns on desktop via CSS grid in theory, but user wanted it below both columns on desktop. Let's move it outside the grid for desktop) */}
              
              <div className="mt-4 lg:hidden block">
                {/* Mobile map placement */}
                {isMapboxTokenValid ? (
                  <div className="bg-neutral-200 rounded-3xl overflow-hidden h-[350px] relative border border-neutral-100 shadow-sm">
                    <Map
                      ref={mapRef}
                      {...viewState}
                      onMove={evt => setViewState(evt.viewState)}
                      mapStyle="mapbox://styles/mapbox/light-v11"
                      mapboxAccessToken={MAPBOX_TOKEN}
                      attributionControl={false}
                    >
                      <NavigationControl position="top-right" />
                      {branches.map(branch => branch.latitude && branch.longitude && (
                        <Marker 
                          key={branch.id}
                          longitude={Number(branch.longitude)} 
                          latitude={Number(branch.latitude)} 
                          anchor="bottom"
                          onClick={e => {
                            e.originalEvent.stopPropagation();
                            handleSelectBranch(branch);
                          }}
                        >
                          <div className="relative flex items-center justify-center cursor-pointer group pb-12">
                            <div className="absolute bottom-2">
                               <MapPin className={`w-8 h-8 transition-colors ${selectedBranch?.id === branch.id ? 'text-primary-700 fill-primary-100 scale-110' : 'text-primary-900 fill-white group-hover:text-primary-600'}`} />
                            </div>
                          </div>
                        </Marker>
                      ))}
                      {popupInfo && (
                        <Popup
                          anchor="bottom"
                          longitude={Number(popupInfo.longitude)}
                          latitude={Number(popupInfo.latitude)}
                          onClose={() => setPopupInfo(null)}
                          closeOnClick={false}
                          className="rounded-2xl overflow-hidden shadow-lg border-0 pb-4 z-10"
                          maxWidth="320px"
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-5 h-5 text-primary-700" />
                              <h4 className="font-display font-semibold text-lg text-primary-900">{popupInfo.name}</h4>
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">{popupInfo.address}</p>
                            <Button 
                              onClick={() => window.open(`https://maps.google.com/?q=${popupInfo.latitude},${popupInfo.longitude}`, '_blank')}
                              className="w-full h-9 text-xs bg-primary-700 text-white rounded-lg hover:bg-primary-800"
                            >
                              Cómo llegar
                            </Button>
                          </div>
                        </Popup>
                      )}
                    </Map>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl h-[350px] border border-neutral-200 flex flex-col items-center justify-center text-center p-6">
                    <MapPin className="w-10 h-10 text-neutral-300 mb-3" />
                    <p className="text-neutral-500 font-medium">No pudimos cargar el mapa en este momento.</p>
                    <p className="text-neutral-400 text-sm mt-1">Verifica tu configuración de Mapbox.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Desktop map placement (Full width below columns) */}
          <div className="hidden lg:block mt-10">
            {isMapboxTokenValid ? (
              <div className="bg-neutral-200 rounded-3xl overflow-hidden h-[400px] relative border border-neutral-100 shadow-sm">
                <Map
                  ref={mapRef}
                  {...viewState}
                  onMove={evt => setViewState(evt.viewState)}
                  mapStyle="mapbox://styles/mapbox/light-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  attributionControl={false}
                >
                  <NavigationControl position="top-right" />
                  
                  {branches.map(branch => branch.latitude && branch.longitude && (
                    <Marker 
                      key={branch.id}
                      longitude={Number(branch.longitude)} 
                      latitude={Number(branch.latitude)} 
                      anchor="bottom"
                      onClick={e => {
                        e.originalEvent.stopPropagation();
                        handleSelectBranch(branch);
                      }}
                    >
                      <div className="relative flex items-center justify-center cursor-pointer group pb-12">
                        <div className="absolute bottom-2">
                           <MapPin className={`w-8 h-8 transition-colors ${selectedBranch?.id === branch.id ? 'text-primary-700 fill-primary-100 scale-110' : 'text-primary-900 fill-white group-hover:text-primary-600'}`} />
                        </div>
                      </div>
                    </Marker>
                  ))}

                  {popupInfo && (
                    <Popup
                      anchor="bottom"
                      longitude={Number(popupInfo.longitude)}
                      latitude={Number(popupInfo.latitude)}
                      onClose={() => setPopupInfo(null)}
                      closeOnClick={false}
                      className="rounded-2xl overflow-hidden shadow-lg border-0 pb-4 z-10"
                      maxWidth="320px"
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-primary-700" />
                          <h4 className="font-display font-semibold text-lg text-primary-900">{popupInfo.name}</h4>
                        </div>
                        {popupInfo.recommended && (
                          <p className="text-[11px] text-neutral-500 mb-2 font-medium">Nuestra sede recomendada</p>
                        )}
                        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{popupInfo.address}</p>
                        <Button 
                          onClick={() => window.open(`https://maps.google.com/?q=${popupInfo.latitude},${popupInfo.longitude}`, '_blank')}
                          className="w-full h-10 text-sm bg-primary-700 text-white rounded-lg hover:bg-primary-800"
                        >
                          Cómo llegar
                        </Button>
                      </div>
                    </Popup>
                  )}
                </Map>
              </div>
            ) : (
              <div className="bg-white rounded-3xl h-[400px] border border-neutral-200 flex flex-col items-center justify-center text-center p-6">
                <MapPin className="w-12 h-12 text-neutral-300 mb-4" />
                <h4 className="text-lg font-bold text-neutral-700 mb-1">Mapa no disponible</h4>
                <p className="text-neutral-500">No pudimos cargar el mapa en este momento.</p>
                <p className="text-neutral-400 text-sm mt-1">Verifica tu configuración de VITE_MAPBOX_TOKEN.</p>
              </div>
            )}
          </div>

        </div>
      </Container>

      {/* Sticky Summary Bottom Bar */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 sm:bottom-6 left-0 right-0 z-50 px-4 pointer-events-none pb-safe"
        >
          <div className="max-w-4xl mx-auto flex justify-center">
            <div className="bg-[#4B3B5C] pointer-events-auto rounded-t-2xl sm:rounded-2xl shadow-[0_10px_40px_rgba(75,59,92,0.4)] p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto border border-white/10">
              
              <div className="flex w-full sm:w-auto justify-between sm:justify-start items-center gap-4">
                {/* Profesional Resumen */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  {selectedPro ? (
                    <>
                      <ProfessionalAvatar 
                        src={selectedPro.user?.profilePicture || selectedPro.user?.avatar} 
                        name={selectedPro.user?.firstName ? `${selectedPro.user.firstName} ${selectedPro.user.lastName || ''}` : selectedPro.user?.name || selectedPro.name} 
                        size="sm" 
                        className="border border-white/20" 
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white line-clamp-1">{selectedPro.user?.firstName || selectedPro.user?.name || selectedPro.name}</p>
                        <p className="text-[11px] text-white/70 line-clamp-1">{selectedPro.specialty || 'Especialista'}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white/50">Profesional</p>
                        <p className="text-[11px] text-white/40">Opcional</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

                {/* Sede Resumen */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  {selectedBranch ? (
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{selectedBranch.name}</p>
                      <p className="text-[11px] text-white/70 truncate max-w-[150px]">{selectedBranch.address}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white/50">Sede</p>
                        <p className="text-[11px] text-white/40">Requerido</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback y Botón */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
                
                {/* Mensaje dinámico si falta algo o es incompatible */}
                <div className="text-center sm:text-right">
                  {!selectedBranch && selectedPro && (
                    <span className="text-[11px] text-white/80 block sm:hidden mb-2">Selecciona una sede</span>
                  )}
                  {!selectedPro && selectedBranch && (
                    <span className="text-[11px] text-white/80 block sm:hidden mb-2">Selecciona un profesional (opcional)</span>
                  )}
                  {!isCompatible && (
                    <span className="text-xs text-error-400 font-medium block mb-2 sm:mb-0 sm:mr-3">Esta profesional no atiende en esta sede.</span>
                  )}
                </div>

                <button 
                  onClick={handleContinue}
                  disabled={!selectedBranch || !isCompatible}
                  className="w-full sm:w-auto px-6 py-3 bg-[#E5C99F] hover:bg-[#d8bc93] disabled:bg-neutral-600 disabled:text-neutral-400 text-primary-900 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Continuar reserva <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Professionals;
