// src/components/home/FeaturedJobs.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Briefcase, ChevronLeft, ChevronRight, MapPin, Clock, DollarSign, Users, Award, Star } from 'lucide-react';
import { TIPOS_PUBLICACION } from '@/types/employment';

export default function FeaturedJobs() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef(null);
  const rafRef = useRef();

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadFeaturedJobs();
  }, []);

  const loadFeaturedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const empleosRef = collection(db, 'empleos');
      const q = query(
        empleosRef,
        where('featured', '==', true),
        where('featuredUntil', '>', now),
        where('estado', '==', 'activo'),
        orderBy('featuredUntil', 'desc'),
        orderBy('fechaDestacado', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);

      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${jobs.length} empleos destacados cargados`);
      setFeaturedJobs(jobs);
    } catch (error) {
      console.error('Error cargando empleos destacados:', error);
      setError('Error cargando empleos destacados');
      setFeaturedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    const storeSlug = job.tiendaInfo?.slug || job.storeSlug;
    if (storeSlug && job.id) {
      const url = `https://familymarket.vercel.app/tienda/${storeSlug}/empleos/${job.id}`;
      window.open(url, '_blank');
    }
  };

  const getJobTypeLabel = (job) => {
    if (job.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'Oferta de Empleo';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'Busca Empleo';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'Servicio Profesional';
    return 'Empleo';
  };

  const getJobTypeColor = (job) => {
    if (job.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'from-blue-500 to-blue-600';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'from-green-500 to-green-600';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'from-purple-500 to-purple-600';
    return 'from-gray-500 to-gray-600';
  };

  const getJobTypeBadgeColor = (job) => {
    if (job.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  let itemsPerView;
  if (isMobile) {
    itemsPerView = 1;
  } else if (isTablet) {
    itemsPerView = 2;
  } else {
    itemsPerView = 3;
  }

  const maxIndex = Math.max(0, featuredJobs.length - itemsPerView);

  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex));
    setIsTransitioning(true);
    setCurrentIndex(clampedIndex);
    setDragOffset(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [maxIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      animateToIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < maxIndex) {
      animateToIndex(currentIndex + 1);
    }
  };

  const handleDragStart = useCallback((clientX) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(currentIndex);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [currentIndex, isTransitioning]);

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging || isTransitioning) return;
    rafRef.current = requestAnimationFrame(() => {
      const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
      const itemWidth = containerWidth / itemsPerView;
      const deltaX = startX - clientX;
      const dragDistance = deltaX / itemWidth;

      let newOffset = dragDistance;
      const futureIndex = scrollLeft + dragDistance;

      if (futureIndex < 0) {
        newOffset = dragDistance * (1 - Math.abs(futureIndex) * 0.3);
      } else if (futureIndex > maxIndex) {
        const overflow = futureIndex - maxIndex;
        newOffset = dragDistance - (overflow * 0.7);
      }

      setDragOffset(newOffset);
    });
  }, [isDragging, startX, scrollLeft, itemsPerView, maxIndex, isTransitioning]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || isTransitioning) return;
    setIsDragging(false);
    const threshold = 0.3;
    let targetIndex = scrollLeft + dragOffset;

    if (Math.abs(dragOffset) > threshold) {
      targetIndex = dragOffset > 0 ? Math.ceil(scrollLeft + dragOffset) : Math.floor(scrollLeft + dragOffset);
    } else {
      targetIndex = Math.round(scrollLeft);
    }

    animateToIndex(targetIndex);
  }, [isDragging, scrollLeft, dragOffset, animateToIndex, isTransitioning]);

  const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e) => {
    if (isMobile) return;
    e.preventDefault();
    handleDragStart(e.clientX);
  };
  const handleMouseMove = (e) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-8 lg:py-12">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando empleos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredJobs.length === 0) {
    return null;
  }

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando empleos destacados...</div>
      </section>
    );
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  const gapClass = isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-6';

  return (
    <section className="py-0 w-full">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Empleos Destacados
          </h2>
        </div>

        <div className="relative">
          {!isMobile && maxIndex > 0 && (
            <>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0 || isDragging || isTransitioning}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === maxIndex || isDragging || isTransitioning}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            ref={scrollContainerRef}
            className={`overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ touchAction: 'pan-y' }}
          >
            <div
              className={`flex ${gapClass} will-change-transform`}
              style={{
                transform: `translateX(${translateX}%)`,
                transition: (isTransitioning && !isDragging) ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              }}
            >
              {featuredJobs.map((job) => {
                const gapPx = isMobile ? 12 : isTablet ? 16 : 24;
                const totalGapPx = gapPx * (itemsPerView - 1);
                
                return (
                  <div
                    key={job.id}
                    className={`flex-shrink-0 transition-all duration-200 ${isDragging ? 'scale-[0.98]' : ''}`}
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                    }}
                  >
                    <JobCard job={job} onClick={() => handleJobClick(job)} />
                  </div>
                );
              })}
            </div>
          </div>

          {maxIndex > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => animateToIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    Math.round(currentIndex) === i
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-125 shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-300 dark:hover:bg-blue-600'
                  }`}
                  disabled={isDragging || isTransitioning}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Componente de tarjeta de empleo
function JobCard({ job, onClick }) {
  const getJobTypeLabel = (job) => {
    if (job.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'Oferta';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'Busco';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'Servicio';
    return 'Empleo';
  };

  const getJobTypeColor = (job) => {
    if (job.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'from-blue-500 to-blue-600';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'from-green-500 to-green-600';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'from-purple-500 to-purple-600';
    return 'from-gray-500 to-gray-600';
  };

  const getJobTypeBadgeColor = (job) => {
    if (job.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200';
    if (job.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200';
  };

  return (
    <div
      onClick={onClick}
      className="group h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Badge destacado */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
          <Star className="w-3 h-3 fill-current" />
          <span>DESTACADO</span>
        </div>
      </div>

      {/* Header con gradiente según tipo */}
      <div className={`relative bg-gradient-to-r ${getJobTypeColor(job)} p-6`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold mb-2 ${getJobTypeBadgeColor(job)}`}>
              {getJobTypeLabel(job)}
            </span>
            <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight">
              {job.titulo}
            </h3>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-3">
        {/* Tienda */}
        {job.tiendaInfo?.nombre && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium truncate">{job.tiendaInfo.nombre}</span>
          </div>
        )}

        {/* Descripción */}
        {job.descripcion && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {job.descripcion}
          </p>
        )}

        {/* Info adicional */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {job.modalidad && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.modalidad}</span>
            </div>
          )}

          {job.tipoEmpleo && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{job.tipoEmpleo}</span>
            </div>
          )}

          {job.experienciaRequerida && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Award className="w-3.5 h-3.5" />
              <span>{job.experienciaRequerida}</span>
            </div>
          )}

          {job.salario && job.salario.tipo !== 'a_convenir' && (job.salario.minimo || job.salario.maximo) && (
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
              <span>
                ${job.salario.minimo ? job.salario.minimo.toLocaleString('es-AR') : ''}
                {job.salario.maximo && job.salario.minimo ? ' - ' : ''}
                {job.salario.maximo ? `$${job.salario.maximo.toLocaleString('es-AR')}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Call to action */}
        <button className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
          Ver Detalles
        </button>
      </div>
    </div>
  );
}