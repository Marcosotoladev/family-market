// src/components/tienda/PublicStoreEmploymentSection.js
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TIPOS_PUBLICACION, ESTADOS_PUBLICACION } from '@/types/employment';
import OfertaEmpleoCard from './empleos/OfertaEmpleoCard';
import BusquedaEmpleoCard from './empleos/BusquedaEmpleoCard';
import ServicioProfesionalCard from './empleos/ServicioProfesionalCard';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Loader2,
  Package,
  ChevronDown
} from 'lucide-react';

export default function PublicStoreEmploymentSection({ 
  storeId, 
  storeData,
  showAll = false, // Si es true, muestra todos. Si es false, solo destacados/recientes
  maxItems = 6,
  searchQuery: externalSearchQuery = '' // Búsqueda externa desde el layout
}) {
  const [empleos, setEmpleos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Usar búsqueda externa si está disponible
  const activeSearchQuery = externalSearchQuery || searchQuery;

  useEffect(() => {
    if (storeId) {
      loadEmpleos();
    }
  }, [storeId, showAll]);

  const loadEmpleos = async () => {
    try {
      setLoading(true);
      const empleosRef = collection(db, 'empleos');
      
      let q;
      if (showAll) {
        // Mostrar todos los empleos activos de la tienda
        q = query(
          empleosRef,
          where('usuarioId', '==', storeId),
          where('estado', '==', ESTADOS_PUBLICACION.ACTIVO),
          orderBy('fechaCreacion', 'desc')
        );
      } else {
        // Mostrar solo destacados o los más recientes (para página principal)
        q = query(
          empleosRef,
          where('usuarioId', '==', storeId),
          where('estado', '==', ESTADOS_PUBLICACION.ACTIVO),
          orderBy('fechaCreacion', 'desc'),
          limit(maxItems)
        );
      }

      const querySnapshot = await getDocs(q);
      const empleosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEmpleos(empleosData);
    } catch (error) {
      console.error('Error cargando empleos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empleos según búsqueda y filtros
  const filteredEmpleos = empleos
    .filter(empleo => {
      const matchesSearch = empleo.titulo?.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
        empleo.descripcion?.toLowerCase().includes(activeSearchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || empleo.tipoPublicacion === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'fechaCreacion') {
        return new Date(b.fechaCreacion?.seconds * 1000) - new Date(a.fechaCreacion?.seconds * 1000);
      }
      if (sortBy === 'titulo') {
        return (a.titulo || '').localeCompare(b.titulo || '');
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando empleos...</p>
        </div>
      </div>
    );
  }

  if (!showAll && empleos.length === 0) {
    return null; // No mostrar nada si no hay empleos y estamos en vista resumida
  }

  if (showAll && empleos.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay empleos publicados
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Esta tienda aún no ha publicado ofertas de empleo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      {showAll && (
        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Botón filtros para móvil */}
            <div className="sm:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filtro por tipo */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value={TIPOS_PUBLICACION.OFERTA_EMPLEO}>Ofertas de Empleo</option>
                <option value={TIPOS_PUBLICACION.BUSQUEDA_EMPLEO}>Búsquedas de Empleo</option>
                <option value={TIPOS_PUBLICACION.SERVICIO_PROFESIONAL}>Servicios Profesionales</option>
              </select>

              {/* Ordenar */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="fechaCreacion">Más recientes</option>
                <option value="titulo">Alfabético</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid de empleos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmpleos.map((empleo) => {
          switch (empleo.tipoPublicacion) {
            case TIPOS_PUBLICACION.OFERTA_EMPLEO:
              return (
                <OfertaEmpleoCard
                  key={empleo.id}
                  oferta={empleo}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={true}
                  showStoreInfo={false}
                  onClick={() => window.location.href = `/tienda/${storeData.storeSlug}/empleos/${empleo.id}`}
                />
              );
            case TIPOS_PUBLICACION.BUSQUEDA_EMPLEO:
              return (
                <BusquedaEmpleoCard
                  key={empleo.id}
                  busqueda={empleo}
                  variant="grid"
                  showContactInfo={true}
                  onClick={() => window.location.href = `/tienda/${storeData.storeSlug}/empleos/${empleo.id}`}
                />
              );
            case TIPOS_PUBLICACION.SERVICIO_PROFESIONAL:
              return (
                <ServicioProfesionalCard
                  key={empleo.id}
                  servicio={empleo}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={true}
                  showStoreInfo={false}
                  onClick={() => window.location.href = `/tienda/${storeData.storeSlug}/empleos/${empleo.id}`}
                />
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Ver todos (solo si no estamos en vista completa) */}
      {!showAll && empleos.length >= maxItems && (
        <div className="text-center pt-4">
          <a
            href={`/tienda/${storeData?.storeSlug}/empleos`}
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Ver todos los empleos
            <ChevronDown className="w-4 h-4 ml-2 rotate-[-90deg]" />
          </a>
        </div>
      )}
    </div>
  );
}