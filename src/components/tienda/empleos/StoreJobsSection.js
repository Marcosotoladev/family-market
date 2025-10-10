// src/components/tienda/StoreJobsSection.js
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
import JobCard from './empleos/JobCard';
import { CATEGORIAS_EMPLEOS } from '@/types/categories';
import { ESTADOS_EMPLEO } from '@/types/job';
import {
  Search,
  Briefcase,
  Loader2,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Clock,
  ChevronDown
} from 'lucide-react';

export default function StoreJobsSection({
  storeId,
  storeData,
  storeConfig,
  searchQuery = '',
  showFilters = true,
  maxJobs = null,
  variant = 'grid' // 'grid' | 'list'
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filtros
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTipoContrato, setSelectedTipoContrato] = useState('');
  const [selectedModalidad, setSelectedModalidad] = useState('');
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Configuración de paginación
  const JOBS_PER_PAGE = maxJobs || 12;

  useEffect(() => {
    if (storeId) {
      loadJobs(true);
    }
  }, [storeId, selectedCategory, selectedTipoContrato, selectedModalidad, sortBy, sortOrder]);

  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Buscar cuando cambie la query local con debounce
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        loadJobs(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const loadJobs = async (reset = false) => {
    console.log('🔍 loadJobs ejecutándose');
    console.log('🔍 storeId:', storeId);
    console.log('🔍 Consultando colección: empleos');
    console.log('🔍 Filtro usuarioId ==', storeId);
    console.log('🔍 Filtro estado ==', ESTADOS_EMPLEO.ACTIVO);

    try {
      if (reset) {
        setLoading(true);
        setJobs([]);
        setLastVisible(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const jobsRef = collection(db, 'empleos');
      let q = query(
        jobsRef,
        where('usuarioId', '==', storeId),
        where('estado', '==', ESTADOS_EMPLEO.ACTIVO)
      );

      // Filtro por categoría
      if (selectedCategory) {
        q = query(q, where('categoria', '==', selectedCategory));
      }

      // Filtro por tipo de contrato
      if (selectedTipoContrato) {
        q = query(q, where('tipoContrato', '==', selectedTipoContrato));
      }

      // Filtro por modalidad
      if (selectedModalidad) {
        q = query(q, where('modalidad', '==', selectedModalidad));
      }

      // Ordenamiento
      const orderField = sortBy === 'salario' ? 'salarioMaximo' :
        sortBy === 'titulo' ? 'titulo' : 'fechaCreacion';

      q = query(q, orderBy(orderField, sortOrder));

      // Paginación
      if (!reset && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      q = query(q, limit(JOBS_PER_PAGE));

      const querySnapshot = await getDocs(q);
      console.log('🔍 Documentos encontrados:', querySnapshot.docs.length);

      const newJobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('🔍 Empleos obtenidos:', newJobs);

      // Filtros adicionales que no se pueden hacer en Firestore
      let filteredJobs = newJobs;

      // Filtro por búsqueda de texto
      if (localSearchQuery) {
        const searchLower = localSearchQuery.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.titulo.toLowerCase().includes(searchLower) ||
          job.descripcion.toLowerCase().includes(searchLower) ||
          job.ubicacion?.toLowerCase().includes(searchLower) ||
          job.palabrasClave?.some(keyword =>
            keyword.toLowerCase().includes(searchLower)
          ) ||
          job.habilidades?.some(skill =>
            skill.toLowerCase().includes(searchLower)
          )
        );
      }

      // Filtro por rango de salario
      if (salaryRange.min || salaryRange.max) {
        filteredJobs = filteredJobs.filter(job => {
          const maxSalary = job.salarioMaximo || 0;
          const min = parseFloat(salaryRange.min) || 0;
          const max = parseFloat(salaryRange.max) || Infinity;
          return maxSalary >= min && maxSalary <= max;
        });
      }

      console.log('🔍 Empleos después de filtros locales:', filteredJobs);

      if (reset) {
        setJobs(filteredJobs);
      } else {
        setJobs(prev => [...prev, ...filteredJobs]);
      }

      // Actualizar paginación
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === JOBS_PER_PAGE);

    } catch (error) {
      console.error('🔥 Error cargando empleos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleJobClick = async (job) => {
    // Incrementar contador de vistas
    try {
      const jobRef = doc(db, 'empleos', job.id);
      await updateDoc(jobRef, {
        totalVistas: increment(1)
      });
    } catch (error) {
      console.error('Error actualizando vistas:', error);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedTipoContrato('');
    setSelectedModalidad('');
    setSalaryRange({ min: '', max: '' });
    setLocalSearchQuery('');
    setSortBy('fechaCreacion');
    setSortOrder('desc');
  };

  const categories = Object.values(CATEGORIAS_EMPLEOS);
  const hasActiveFilters = selectedCategory || selectedTipoContrato || selectedModalidad || 
                           salaryRange.min || salaryRange.max || localSearchQuery;

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando empleos...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="empleos" className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oportunidades Laborales
          </h2>
        </div>

        {/* Filtros y búsqueda */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-8">
            {/* Barra superior de filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar empleos..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Botón filtros */}
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Panel de filtros expandible */}
            {showFiltersPanel && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de Contrato */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Contrato
                    </label>
                    <select
                      value={selectedTipoContrato}
                      onChange={(e) => setSelectedTipoContrato(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todos</option>
                      <option value="tiempo_completo">Tiempo Completo</option>
                      <option value="medio_tiempo">Medio Tiempo</option>
                      <option value="freelance">Freelance</option>
                      <option value="temporal">Temporal</option>
                      <option value="pasantia">Pasantía</option>
                    </select>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Modalidad
                    </label>
                    <select
                      value={selectedModalidad}
                      onChange={(e) => setSelectedModalidad(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas</option>
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>

                  {/* Salario mínimo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salario mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={salaryRange.min}
                      onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$0"
                    />
                  </div>

                  {/* Salario máximo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salario máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={salaryRange.max}
                      onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Sin límite"
                    />
                  </div>
                </div>

                {/* Ordenar */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ordenar por:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="fechaCreacion">Más recientes</option>
                      <option value="titulo">Nombre</option>
                      <option value="salario">Salario</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>

                  {/* Botón limpiar filtros */}
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {jobs.length > 0
              ? `Mostrando ${jobs.length} empleo${jobs.length !== 1 ? 's' : ''}${hasActiveFilters ? ' (filtrado)' : ''}`
              : 'No se encontraron empleos'
            }
          </p>
        </div>

        {/* Grid de empleos */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron empleos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Esta tienda aún no ha publicado empleos'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  storeData={storeData}
                  variant="compact"
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>

            {/* Botón Ver todos o Cargar más */}
            {maxJobs ? (
              // Si hay límite (vista previa), mostrar botón "Ver todos"
              jobs.length >= maxJobs && (
                <div className="text-center mt-8">
                  <a
                    href={`/tienda/${storeData.storeSlug}/empleos`}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    Ver todos los empleos
                  </a>
                </div>
              )
            ) : (
              // Si no hay límite, mostrar botón "Cargar más"
              hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => loadJobs(false)}
                    disabled={loadingMore}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Cargar más empleos
                      </>
                    )}
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </section>
  );
}