// src/components/tienda/StoreServicesSection.js
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  doc,
  updateDoc,
  increment 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ServiceCard from './servicios/ServiceCard';
import { CATEGORIAS_SERVICIOS } from '@/types/services';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Briefcase,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';

export default function StoreServicesSection({ 
  storeId, 
  storeData, 
  storeConfig,
  searchQuery = '',
  showFilters = true,
  maxServices = null,
  variant = 'grid'
}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState(variant);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const SERVICES_PER_PAGE = maxServices || 12;

  useEffect(() => {
    if (storeId) {
      loadServices(true);
    }
  }, [storeId, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        loadServices(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const loadServices = async (reset = false) => {
    console.log('🔍 loadServices ejecutándose');
    console.log('🔍 storeId:', storeId);
    
    try {
      if (reset) {
        setLoading(true);
        setServices([]);
        setLastVisible(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const servicesRef = collection(db, 'servicios');
      let q = query(
        servicesRef,
        where('usuarioId', '==', storeId),
        where('estado', '==', 'disponible')
      );

      if (selectedCategory) {
        q = query(q, where('categoria', '==', selectedCategory));
      }

      const orderField = sortBy === 'precio' ? 'precio' : 
                        sortBy === 'titulo' ? 'titulo' : 'fechaCreacion';
      
      q = query(q, orderBy(orderField, sortOrder));

      if (!reset && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      q = query(q, limit(SERVICES_PER_PAGE));

      const querySnapshot = await getDocs(q);
      console.log('🔍 Servicios encontrados:', querySnapshot.docs.length);

      const newServices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      let filteredServices = newServices;

      if (localSearchQuery) {
        const searchLower = localSearchQuery.toLowerCase();
        filteredServices = filteredServices.filter(service =>
          service.titulo.toLowerCase().includes(searchLower) ||
          service.descripcion.toLowerCase().includes(searchLower) ||
          service.palabrasClave?.some(keyword => 
            keyword.toLowerCase().includes(searchLower)
          )
        );
      }

      if (priceRange.min || priceRange.max) {
        filteredServices = filteredServices.filter(service => {
          if (service.tipoPrecio !== 'fijo') return true;
          const price = service.precio || 0;
          const min = parseFloat(priceRange.min) || 0;
          const max = parseFloat(priceRange.max) || Infinity;
          return price >= min && price <= max;
        });
      }

      if (reset) {
        setServices(filteredServices);
      } else {
        setServices(prev => [...prev, ...filteredServices]);
      }

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === SERVICES_PER_PAGE);

    } catch (error) {
      console.error('🔥 Error cargando servicios:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleServiceClick = async (service) => {
    try {
      const serviceRef = doc(db, 'servicios', service.id);
      await updateDoc(serviceRef, {
        'interacciones.vistas': increment(1)
      });
    } catch (error) {
      console.error('Error actualizando vistas:', error);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setLocalSearchQuery('');
    setSortBy('fechaCreacion');
    setSortOrder('desc');
  };

  const categories = Object.values(CATEGORIAS_SERVICIOS);
  const hasActiveFilters = selectedCategory || priceRange.min || priceRange.max || localSearchQuery;

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando servicios...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="py-8 lg:py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestros Servicios
          </h2>
        </div>

        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } transition-colors`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {showFiltersPanel && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="$0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Sin límite"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordenar por
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="fechaCreacion">Más recientes</option>
                        <option value="titulo">Nombre</option>
                        <option value="precio">Precio</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {services.length > 0 
              ? `Mostrando ${services.length} servicio${services.length !== 1 ? 's' : ''}${hasActiveFilters ? ' (filtrado)' : ''}`
              : 'No se encontraron servicios'
            }
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Esta tienda aún no ha publicado servicios'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'
                : 'space-y-4'
            }>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  storeData={storeData}
                  variant={viewMode === 'grid' ? 'featured-compact' : viewMode}
                  onClick={() => handleServiceClick(service)}
                />
              ))}
            </div>

            {maxServices && services.length >= maxServices && (
              <div className="text-center mt-8">
                <a
                  href={`/tienda/${storeData.storeSlug}/servicios`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Ver todos los servicios
                </a>
              </div>
            )}

            {!maxServices && hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => loadServices(false)}
                  disabled={loadingMore}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Cargar más servicios
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}