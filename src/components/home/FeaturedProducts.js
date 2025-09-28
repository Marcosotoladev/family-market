// src/components/home/FeaturedProducts.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, limit} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/tienda/productos/ProductCard'; // Importar ProductCard

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
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
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
  try {
    setLoading(true);
    setError(null);

    const now = new Date();
    const productsRef = collection(db, 'productos');
    const q = query(
      productsRef,
      where('featured', '==', true),
      where('featuredUntil', '>', now),
      where('estado', '==', 'disponible'),
      orderBy('featuredUntil', 'desc'),
      orderBy('fechaDestacado', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const products = [];
    const userIds = new Set();

      for (const docSnapshot of querySnapshot.docs) {
        const productData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        try {
          const userDoc = await getDoc(doc(db, 'users', productData.usuarioId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            productData.tiendaInfo = {
              nombre: userData.businessName || userData.familyName || `${userData.firstName} ${userData.lastName}`.trim(),
              slug: userData.storeSlug,
              email: userData.email,
              phone: userData.phone,
            };
          }
        } catch (error) {
          console.error('Error loading store data for product:', productData.id, error);
          productData.tiendaInfo = {
            nombre: 'Tienda Family Market',
            slug: '',
            email: '',
            phone: ''
          };
        }
        
        products.push(productData);
      }

    setFeaturedProducts(products);
  } catch (error) {
    console.error('Error loading featured products:', error);
    setError('Error cargando productos destacados');
    setFeaturedProducts([]);
  } finally {
    setLoading(false);
  }
};

  // Función para manejar click en producto
  const handleProductClick = (product) => {
    // Navegar a la página del producto
    const storeSlug = product.tiendaInfo?.slug || product.storeData?.storeSlug;
    if (storeSlug && product.id) {
      const url = `https://familymarket.vercel.app/tienda/${storeSlug}/producto/${product.id}`;
      window.open(url, '_blank');
    } else {
      console.error('Faltan datos para la navegación:', { storeSlug, productId: product.id });
    }
  };

  // Ajustar items por vista
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;
  
  let itemsPerView;
  if (isMobile) {
    itemsPerView = 2; // 2 productos en móvil
  } else if (isTablet) {
    itemsPerView = 3; // 3 productos en tablet
  } else {
    itemsPerView = 5; // 5 productos en desktop
  }

  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView);

  // Función para animar suavemente hacia un índice específico
  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex));
    setIsTransitioning(true);
    setCurrentIndex(clampedIndex);
    setDragOffset(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [maxIndex]);

  // Navegación con botones
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

  // Manejo del arrastre
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

  // Eventos táctiles
  const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => handleDragEnd();

  // Eventos del mouse
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredProducts.length === 0) {
    return null;
  }

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando productos destacados...</div>
      </section>
    );
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  return (
    <section className="py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header simplificado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Star className="w-6 h-6 text-white fill-current" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Productos Destacados
          </h2>
        </div>

        {/* Carrusel */}
        <div className="relative">
          {/* Botones de navegación */}
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
              className="flex gap-6 will-change-transform"
              style={{
                transform: `translateX(${translateX}%)`,
                transition: (isTransitioning && !isDragging) ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              }}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`transition-all duration-200 ${isDragging ? 'scale-[0.98]' : ''}`}
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${24 * (itemsPerView - 1) / itemsPerView}px)`,
                    minWidth: isMobile ? '180px' : isTablet ? '280px' : '220px', // Tamaños ajustados para el nuevo grid
                  }}
                >
                  <ProductCard
                    product={product}
                    storeData={product.storeData}
                    variant="featured-compact" // Usar la variante compacta optimizada para grid
                    showContactInfo={true}
                    showStoreInfo={true}
                    onClick={() => handleProductClick(product)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicadores de posición */}
          {maxIndex > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => animateToIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${Math.round(currentIndex) === i
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 scale-125 shadow-md'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-300 dark:hover:bg-yellow-600'
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



