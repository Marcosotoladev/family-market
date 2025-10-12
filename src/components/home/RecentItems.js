// src/components/home/RecentItems.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '@/components/tienda/productos/ProductCard';
import ServiceCard from '@/components/tienda/servicios/ServiceCard';
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard';

export default function RecentItems() {
  const [recentItems, setRecentItems] = useState([]);
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
    loadRecentItems();
  }, []);

  const loadRecentItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular fecha de hace 36 horas
      const hace36Horas = new Date();
      hace36Horas.setHours(hace36Horas.getHours() - 36);

      console.log('🕐 Buscando items desde:', hace36Horas.toISOString());

      // Consultar productos
      const productosRef = collection(db, 'productos');
      const qProductos = query(
        productosRef,
        where('fechaCreacion', '>', hace36Horas),
        where('estado', '==', 'disponible'),
        orderBy('fechaCreacion', 'desc'),
        limit(5)
      );

      // Consultar servicios
      const serviciosRef = collection(db, 'servicios');
      const qServicios = query(
        serviciosRef,
        where('fechaCreacion', '>', hace36Horas),
        where('estado', '==', 'activo'),
        orderBy('fechaCreacion', 'desc'),
        limit(5)
      );

      // Consultar empleos
      const empleosRef = collection(db, 'empleos');
      const qEmpleos = query(
        empleosRef,
        where('fechaCreacion', '>', hace36Horas),
        where('estado', '==', 'activo'),
        orderBy('fechaCreacion', 'desc'),
        limit(5)
      );

      // Ejecutar las 3 consultas en paralelo
      const [productosSnap, serviciosSnap, empleosSnap] = await Promise.all([
        getDocs(qProductos),
        getDocs(qServicios),
        getDocs(qEmpleos)
      ]);

      // Mapear productos
      const productos = productosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tipo: 'producto'
      }));

      // Mapear servicios
      const servicios = serviciosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tipo: 'servicio'
      }));

      // Mapear empleos
      const empleos = empleosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tipo: 'empleo'
      }));

      // Combinar y ordenar todos los items por fecha
      const todosLosItems = [...productos, ...servicios, ...empleos];
      todosLosItems.sort((a, b) => {
        const fechaA = a.fechaCreacion?.toDate?.() || new Date(a.fechaCreacion);
        const fechaB = b.fechaCreacion?.toDate?.() || new Date(b.fechaCreacion);
        return fechaB - fechaA; // Más reciente primero
      });

      // Tomar solo los primeros 15
      const items = todosLosItems.slice(0, 15);

      console.log(`✅ ${items.length} items recientes cargados:`);
      console.log(`📦 ${productos.length} productos`);
      console.log(`🔧 ${servicios.length} servicios`);
      console.log(`💼 ${empleos.length} empleos`);

      setRecentItems(items);
    } catch (error) {
      console.error('❌ Error cargando items recientes:', error);
      setError('Error cargando contenido reciente');
      setRecentItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    const storeSlug = item.tiendaInfo?.slug || item.storeSlug;
    if (!storeSlug || !item.id) return;

    let url = '';
    if (item.tipo === 'producto') {
      url = `https://familymarket.vercel.app/tienda/${storeSlug}/producto/${item.id}`;
    } else if (item.tipo === 'servicio') {
      url = `https://familymarket.vercel.app/tienda/${storeSlug}/servicio/${item.id}`;
    } else if (item.tipo === 'empleo') {
      url = `https://familymarket.vercel.app/tienda/${storeSlug}/empleos/${item.id}`;
    }

    if (url) window.open(url, '_blank');
  };

  // Verificar si un item tiene menos de 24 horas
  const isVeryNew = (item) => {
    const fechaCreacion = item.fechaCreacion?.toDate?.() || new Date(item.fechaCreacion);
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);
    return fechaCreacion > hace24Horas;
  };

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

  const maxIndex = Math.max(0, recentItems.length - itemsPerView);

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
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando novedades...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || recentItems.length === 0) {
    return null; // No mostrar nada si no hay items o hay error
  }

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando novedades...</div>
      </section>
    );
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  const gapClass = isMobile ? 'gap-2' : isTablet ? 'gap-4' : 'gap-6';

  return (
    <section className="py-0 w-full">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg relative">
            <Sparkles className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Recién Publicado
          </h2>
          <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
            Últimas 36h
          </div>
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
              {recentItems.map((item) => {
                const gapPx = isMobile ? 8 : isTablet ? 16 : 24;
                const totalGapPx = gapPx * (itemsPerView - 1);
                
                return (
                  <div
                    key={`${item.tipo}-${item.id}`}
                    className={`flex-shrink-0 transition-all duration-200 ${isDragging ? 'scale-[0.98]' : ''} relative`}
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${totalGapPx / itemsPerView}px)`,
                    }}
                  >
                    {/* Badge NUEVO si tiene menos de 24h */}
                    {isVeryNew(item) && (
                      <div className="absolute top-2 right-2 z-30 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                        <Zap className="w-3 h-3" />
                        <span>NUEVO</span>
                      </div>
                    )}

                    {/* Renderizar card según tipo */}
                    {item.tipo === 'producto' && (
                      <ProductCard
                        product={item}
                        storeData={item.tiendaInfo}
                        variant="featured-compact"
                        showContactInfo={true}
                        showStoreInfo={true}
                        onClick={() => handleItemClick(item)}
                      />
                    )}

                    {item.tipo === 'servicio' && (
                      <ServiceCard
                        service={item}
                        storeData={item.tiendaInfo}
                        variant="featured-compact"
                        showContactInfo={true}
                        showStoreInfo={true}
                        onClick={() => handleItemClick(item)}
                      />
                    )}

                    {item.tipo === 'empleo' && (
                      <OfertaEmpleoCard
                        oferta={item}
                        storeData={item.tiendaInfo}
                        variant="featured-compact"
                        showContactInfo={true}
                        showStoreInfo={true}
                        onClick={() => handleItemClick(item)}
                      />
                    )}
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
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 scale-125 shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-emerald-300 dark:hover:bg-emerald-600'
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