// src/components/home/FeaturedProducts.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, limit} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Star, Package, Zap, Shield } from 'lucide-react';
import { formatearPrecio } from '@/types/product';

// Componente simple para producto destacado con estilo carousel
function FeaturedProductCard({ product, storeData, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  return (
    <div 
      className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden">
        {product.imagenes && product.imagenes.length > 0 ? (
          <img
            src={product.imagenes[0]}
            alt={product.titulo || product.nombre}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span className="hidden sm:inline">Producto</span>
        </div>

        {/* Badge DESTACADO dentro de la imagen */}
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 animate-bounce">
            <Star className="w-3 h-3 fill-current" />
            <span>DESTACADO</span>
          </div>
        </div>

        {/* Badge de verificación */}
        {storeData && (
          <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
            <Shield className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
          {product.titulo || product.nombre}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {storeData?.nombre || 'Tienda'}
          </span>
          {storeData?.phone && (
            <a
              href={`https://wa.me/${storeData.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              WhatsApp
            </a>
          )}
        </div>

        <div className="mt-2 font-bold text-orange-600 dark:text-orange-400">
          {formatearPrecio(product.precio)}
        </div>
      </div>
    </div>
  );
}

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
    // Por ahora solo console.log, luego puedes agregar navegación
    console.log('Ver producto:', product.id, product.titulo || product.nombre);
    
    // Aquí puedes agregar navegación, por ejemplo:
    // router.push(`/productos/${product.id}`);
    // o window.open para abrir en nueva pestaña
    // window.open(`/productos/${product.id}`, '_blank');
  };

  const isMobile = windowWidth < 1024;
  const itemsPerView = isMobile ? 2 : 5;
  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView);

  // Función para animar suavemente hacia un índice específico
  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex));
    setIsTransitioning(true);
    setCurrentIndex(clampedIndex);
    setDragOffset(0);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [maxIndex]);

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
      <section className="pb-2 lg:pb-4">
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
      <section className="pb-2 lg:pb-4">
        <div className="text-center">Cargando novedades...</div>
      </section>
    );
  }

  const currentOffset = currentIndex + dragOffset;
  const translateX = -(currentOffset * (100 / itemsPerView));

  return (
    <section className="pb-2 lg:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg relative">
            <Star className="w-6 h-6 text-white fill-current" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Productos Destacados
          </h2>
          <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
            Premium
          </div>
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
              className="flex gap-4 will-change-transform"
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
                    width: `calc(${100 / itemsPerView}% - ${16 * (itemsPerView - 1) / itemsPerView}px)`,
                  }}
                >
                  <FeaturedProductCard
                    product={product}
                    storeData={product.tiendaInfo}
                    onClick={handleProductClick}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicadores de posición (solo en mobile) */}
          {isMobile && maxIndex > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => animateToIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${Math.round(currentIndex) === i
                      ? 'bg-yellow-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-yellow-300'
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



