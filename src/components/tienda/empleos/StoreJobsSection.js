// src/components/tienda/StoreJobsSection.js
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TIPOS_PUBLICACION } from '@/types/employment';
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard';
import BusquedaEmpleoCard from '@/components/tienda/empleos/BusquedaEmpleoCard';
import ServicioProfesionalCard from '@/components/tienda/empleos/ServicioProfesionalCard';
import { Briefcase, User, Wrench, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StoreJobsSection({ 
  storeId, 
  storeData,
  searchQuery = '',
  showFilters = false,
  maxJobs = null,
  variant = 'grid'
}) {
  const router = useRouter();
  const [empleos, setEmpleos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadEmpleos();
  }, [storeId]);

  const loadEmpleos = async () => {
    try {
      setLoading(true);
      const empleosRef = collection(db, 'empleos');
      
      let q = query(
        empleosRef,
        where('usuarioId', '==', storeId),
        where('estado', '==', 'activo'),
        orderBy('fechaCreacion', 'desc')
      );

      if (maxJobs) {
        q = query(q, limit(maxJobs));
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

  const handleEmpleoClick = (empleo) => {
    router.push(`/tienda/${storeData.storeSlug}/empleo/${empleo.id}`);
  };

  // Filtrar empleos
  const empleosFiltrados = empleos.filter(empleo => {
    const matchType = filterType === 'all' || empleo.tipoPublicacion === filterType;
    const matchSearch = !searchQuery || 
      empleo.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleo.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleo.empresa?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // Agrupar por tipo
  const ofertas = empleosFiltrados.filter(e => e.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO);
  const busquedas = empleosFiltrados.filter(e => e.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO);
  const servicios = empleosFiltrados.filter(e => e.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL);

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (empleos.length === 0) {
    return null;
  }

  return (
    <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Oportunidades de Empleo
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Ofertas de trabajo, búsquedas y servicios profesionales
            </p>
          </div>

          {!maxJobs && (
            <Link
              href={`/tienda/${storeData.storeSlug}/empleos`}
              className="inline-flex items-center px-4 py-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Todas ({empleos.length})
            </button>
            <button
              onClick={() => setFilterType(TIPOS_PUBLICACION.OFERTA_EMPLEO)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filterType === TIPOS_PUBLICACION.OFERTA_EMPLEO
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Ofertas ({ofertas.length})
            </button>
            <button
              onClick={() => setFilterType(TIPOS_PUBLICACION.BUSQUEDA_EMPLEO)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filterType === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              Búsquedas ({busquedas.length})
            </button>
            <button
              onClick={() => setFilterType(TIPOS_PUBLICACION.SERVICIO_PROFESIONAL)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filterType === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Servicios ({servicios.length})
            </button>
          </div>
        )}

        {/* Grid de empleos */}
        <div className="space-y-8">
          {/* Ofertas de Empleo */}
          {ofertas.length > 0 && (filterType === 'all' || filterType === TIPOS_PUBLICACION.OFERTA_EMPLEO) && (
            <div>
              {showFilters && (
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                  Ofertas de Empleo
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ofertas.map(oferta => (
                  <OfertaEmpleoCard
                    key={oferta.id}
                    oferta={oferta}
                    storeData={storeData}
                    variant={variant}
                    showContactInfo={true}
                    showStoreInfo={false}
                    onClick={() => handleEmpleoClick(oferta)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Búsquedas de Empleo */}
          {busquedas.length > 0 && (filterType === 'all' || filterType === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) && (
            <div>
              {showFilters && (
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-6 h-6 mr-2 text-green-600" />
                  Búsquedas de Empleo
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {busquedas.map(busqueda => (
                  <BusquedaEmpleoCard
                    key={busqueda.id}
                    busqueda={busqueda}
                    variant={variant}
                    showContactInfo={true}
                    onClick={() => handleEmpleoClick(busqueda)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Servicios Profesionales */}
          {servicios.length > 0 && (filterType === 'all' || filterType === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) && (
            <div>
              {showFilters && (
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Wrench className="w-6 h-6 mr-2 text-purple-600" />
                  Servicios Profesionales
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicios.map(servicio => (
                  <ServicioProfesionalCard
                    key={servicio.id}
                    servicio={servicio}
                    storeData={storeData}
                    variant={variant}
                    showContactInfo={true}
                    showStoreInfo={false}
                    onClick={() => handleEmpleoClick(servicio)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ver más */}
        {maxJobs && empleos.length >= maxJobs && (
          <div className="text-center mt-8">
            <Link
              href={`/tienda/${storeData.storeSlug}/empleos`}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Ver todas las oportunidades
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}