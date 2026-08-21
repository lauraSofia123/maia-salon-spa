import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, MapPin, ChevronRight, Search } from 'lucide-react';
import { Container } from '../components/layout/Section';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { servicesAPI } from '../services/api';

const Services = () => {
  const [categoriesData, setCategoriesData] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Fetch categories and their services
        const res = await servicesAPI.getCategories();
        if (res.data?.success) {
          setCategoriesData(res.data.data);
          
          // Establecer la primera categoría como activa por defecto
          const cats = Object.keys(res.data.data);
          if (cats.length > 0 && activeCategory === 'all') {
            setActiveCategory(cats[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categoriesList = Object.keys(categoriesData);
  
  // Filtrar servicios de la categoría activa por búsqueda
  const currentServices = categoriesData[activeCategory] || [];
  const filteredServices = currentServices.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const translateCategory = (cat) => {
    const map = {
      'hair': 'Cabello',
      'nails': 'Uñas',
      'eyelashes': 'Pestañas',
      'makeup': 'Maquillaje',
      'spa': 'Spa',
      'other': 'Otros'
    };
    return map[cat.toLowerCase()] || cat;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] pt-24">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen pt-24 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <Container>
          <div className="py-12 md:py-16 max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary-900 mb-4">
              Nuestros Servicios
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mb-8">
              Descubre nuestra amplia gama de tratamientos diseñados para realzar tu belleza natural y brindarte momentos de relajación inolvidables. <Sparkles className="inline-block w-5 h-5 text-accent-500" />
            </p>

            {/* Búsqueda */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Buscar servicio (ej. Balayage)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar / Categories */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div className="sticky top-28 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
              <h3 className="font-display text-xl font-semibold text-primary-900 mb-4">Categorías</h3>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left ${
                      activeCategory === cat
                        ? 'bg-primary-700 text-white font-medium shadow-md'
                        : 'bg-neutral-50 text-neutral-600 hover:bg-primary-50 hover:text-primary-800'
                    }`}
                  >
                    <span>{translateCategory(cat)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === cat ? 'bg-white/20' : 'bg-white'
                    }`}>
                      {categoriesData[cat]?.length || 0}
                    </span>
                  </button>
                ))}
                {categoriesList.length === 0 && (
                  <p className="text-neutral-500 text-sm">No hay categorías disponibles.</p>
                )}
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="font-display text-2xl text-primary-900 font-medium">
                  {translateCategory(activeCategory)}
                </h2>
                <p className="text-neutral-500 text-sm mt-1">Mostrando {filteredServices.length} servicios</p>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-100">
                <p className="text-neutral-500">No encontramos servicios que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={service.id}
                    className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative bg-neutral-100">
                      {service.image ? (
                        <img 
                          src={service.image} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-300 font-display text-2xl bg-primary-50">
                          {translateCategory(activeCategory)}
                        </div>
                      )}
                      
                      {service.isPopular && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                          <span className="text-xs font-semibold text-primary-900">Popular</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg text-primary-900 mb-2">{service.name}</h3>
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-4 flex-1">
                        {service.description || 'Tratamiento profesional realizado por nuestros especialistas en belleza.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div className="flex flex-col">
                          <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Precio desde</span>
                          <span className="font-display font-semibold text-lg text-primary-900">
                            ${parseFloat(service.price).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Duración</span>
                          <span className="flex items-center gap-1 text-sm font-medium text-neutral-700">
                            <Clock className="w-4 h-4 text-primary-500" />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Services;
