// src/components/home/FeaturedServices.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Crown, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ServiceCard from '../tienda/servicios/ServiceCard';

export default function FeaturedServices() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const loadFeaturedServices = async () => {
      try {
        setLoading(true);
        const now = new Date();

        const servicesRef = collection(db, 'servicios');
        const q = query(
          servicesRef,
          where('featured', '==', true),
          where('featuredUntil', '>', now),
          where('estado', '==', 'disponible'),
          orderBy('featuredUntil', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const services = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setFeaturedServices(services);
      } catch (error) {
        console.error('Error loading featured services:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      loadFeaturedServices();
    }
  }, [isClient]);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  let itemsPerView;
  if (isMobile) {
    itemsPerView = 2;
  } else if (isTablet) {
    itemsPerView = 3;
  } else {
    itemsPerView = 5;
  }

  const maxIndex = Math.max(0, featuredServices.length - itemsPerView);

  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex));
    setIsTransitioning(true);
    setCurrentIndex(clampedIndex);
    setDragOffset(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [maxIndex]);

  const handleDragStart = useCallback((clientX) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(currentIndex);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
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

  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseDown = (e) => {
    if (isMobile) return;
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      animateToIndex(currentIndex + 1);
    }
  };

  if (!isClient || loading) {
    return (
      <section className="pb-2 lg:pb-4">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando servicios destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredServices.length === 0) {
    return null;
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  // Gap ajustado: muy pequeño en móvil, más grande en desktop
  const gapClass = isMobile ? 'gap-2' : isTablet ? 'gap-4' : 'gap-6';

  return (
    <section className="pb-2 lg:pb-4 w-full">
      {/* Contenedor sin max-width para ancho completo */}
      <div className="w-full px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg relative">
              <Crown className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Servicios Destacados
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Los mejores servicios seleccionados para ti
              </p>
            </div>
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full flex items-center gap-1 hidden md:flex">
              <TrendingUp className="w-3 h-3" />
              <span>Premium</span>
            </div>
          </div>

          {/* Botones de navegación (solo desktop) */}
          {!isMobile && maxIndex > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0 || isDragging || isTransitioning}
                className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === maxIndex || isDragging || isTransitioning}
                className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}
        </div>

        {/* Carrusel */}
        <div className="relative">
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
              {featuredServices.map((service) => {
                // Calcular el ancho considerando el gap
                const gapPx = isMobile ? 8 : isTablet ? 16 : 24; // gap-2=8px, gap-4=16px, gap-6=24px
                const totalGapPx = gapPx * (itemsPerView - 1);
                
                return (
                  <div
                    key={service.id}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isDragging ? 'scale-[0.98]' : ''
                    }`}
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                    }}
                  >
                    <ServiceCard
                      service={service}
                      storeData={service.tiendaInfo}
                      variant="featured-compact"
                      showContactInfo={true}
                      showStoreInfo={true}
                      onClick={() => {
                        if (!isDragging) {
                          window.location.href = `/tienda/${service.tiendaInfo?.slug}/servicio/${service.id}`;
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicadores de posición */}
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

        {/* Ver todos */}
        <div className="mt-6 text-center">
          <a
            href="/#servicios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Star className="w-4 h-4" />
            <span>Ver todos los servicios</span>
          </a>
        </div>
      </div>
    </section>
  );
}