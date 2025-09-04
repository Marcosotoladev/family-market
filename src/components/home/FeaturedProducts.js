// src/components/home/FeaturedProducts.js
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, Flame, MapPin, Shield } from 'lucide-react'

export default function FeaturedProducts() {
  const [windowWidth, setWindowWidth] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const scrollContainerRef = useRef(null)
  const rafRef = useRef()

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Productos de prueba (8)
  const featuredProducts = [
    {
      id: 1,
      nombre: 'Torta de Chocolate Premium',
      precio: 25000,
      imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      categoria: 'Repostería',
      tienda: { nombre: 'Dulces de María', ubicacion: 'Córdoba Centro', rating: 4.9, verificada: true },
      destacado: true,
    },
    {
      id: 2,
      nombre: 'Set de Organizadores Tejidos',
      precio: 18500,
      imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      categoria: 'Artesanías',
      tienda: { nombre: 'Tejidos Ana', ubicacion: 'Nueva Córdoba', rating: 4.7, verificada: true },
      destacado: true,
    },
    {
      id: 3,
      nombre: 'Servicio de Diseño Web Profesional',
      precio: 150000,
      imagen: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      categoria: 'Servicios',
      tienda: { nombre: 'DevCristiano', ubicacion: 'Remoto', rating: 5.0, verificada: true },
      destacado: true,
    },
    {
      id: 4,
      nombre: 'Macetas de Cerámica Artesanal',
      precio: 8500,
      imagen: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      categoria: 'Decoración',
      tienda: { nombre: 'Cerámica Esperanza', ubicacion: 'Villa Allende', rating: 4.6, verificada: false },
      destacado: true,
    },
    {
      id: 5,
      nombre: 'Clases de Piano Online',
      precio: 12000,
      imagen: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop',
      categoria: 'Educación',
      tienda: { nombre: 'Música & Fe', ubicacion: 'Córdoba', rating: 4.8, verificada: true },
      destacado: true,
    },
    {
      id: 6,
      nombre: 'Pan Casero Integral',
      precio: 3500,
      imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      categoria: 'Alimentos',
      tienda: { nombre: 'Panadería Bendición', ubicacion: 'Barrio Jardín', rating: 4.5, verificada: true },
      destacado: true,
    },
    {
      id: 7,
      nombre: 'Collar Artesanal de Plata',
      precio: 45000,
      imagen: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
      categoria: 'Joyería',
      tienda: { nombre: 'Joyas Luna', ubicacion: 'Córdoba Centro', rating: 4.9, verificada: true },
      destacado: true,
    },
    {
      id: 8,
      nombre: 'Curso de Fotografía Digital',
      precio: 28000,
      imagen: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      categoria: 'Educación',
      tienda: { nombre: 'Foto Académica', ubicacion: 'Nueva Córdoba', rating: 4.7, verificada: true },
      destacado: true,
    },
  ]

  const isMobile = windowWidth < 1024
  const itemsPerView = isMobile ? 2 : 5
  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView)

  // Función para animar suavemente hacia un índice específico
  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex))
    setIsTransitioning(true)
    setCurrentIndex(clampedIndex)
    setDragOffset(0)
    
    // Resetear la transición después de que termine
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [maxIndex])

  // Manejo del inicio del arrastre (touch y mouse)
  const handleDragStart = useCallback((clientX) => {
    if (isTransitioning) return
    
    setIsDragging(true)
    setStartX(clientX)
    setScrollLeft(currentIndex)
    
    // Cancelar cualquier animación en curso
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
  }, [currentIndex, isTransitioning])

  // Manejo del movimiento durante el arrastre
  const handleDragMove = useCallback((clientX) => {
    if (!isDragging || isTransitioning) return
    
    rafRef.current = requestAnimationFrame(() => {
      const containerWidth = scrollContainerRef.current?.offsetWidth || 0
      const itemWidth = containerWidth / itemsPerView
      const deltaX = startX - clientX
      const dragDistance = deltaX / itemWidth
      
      // Limitar el arrastre en los extremos con efecto de resistencia
      let newOffset = dragDistance
      const futureIndex = scrollLeft + dragDistance
      
      if (futureIndex < 0) {
        // Resistencia al inicio
        newOffset = dragDistance * (1 - Math.abs(futureIndex) * 0.3)
      } else if (futureIndex > maxIndex) {
        // Resistencia al final
        const overflow = futureIndex - maxIndex
        newOffset = dragDistance - (overflow * 0.7)
      }
      
      setDragOffset(newOffset)
    })
  }, [isDragging, startX, scrollLeft, itemsPerView, maxIndex, isTransitioning])

  // Manejo del final del arrastre
  const handleDragEnd = useCallback(() => {
    if (!isDragging || isTransitioning) return
    
    setIsDragging(false)
    
    const threshold = 0.3 // 30% del ancho de un item para cambiar
    let targetIndex = scrollLeft + dragOffset
    
    // Snap al índice más cercano
    if (Math.abs(dragOffset) > threshold) {
      targetIndex = dragOffset > 0 ? Math.ceil(scrollLeft + dragOffset) : Math.floor(scrollLeft + dragOffset)
    } else {
      targetIndex = Math.round(scrollLeft)
    }
    
    animateToIndex(targetIndex)
  }, [isDragging, scrollLeft, dragOffset, animateToIndex, isTransitioning])

  // Eventos táctiles
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    e.preventDefault() // Prevenir scroll de la página
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // Eventos del mouse
  const handleMouseDown = (e) => {
    if (isMobile) return
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd()
    }
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando productos destacados...</div>
      </section>
    )
  }

  const currentOffset = currentIndex + dragOffset
  const translateX = -(currentOffset * (100 / itemsPerView))

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Productos Destacados
          </h2>
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
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                    isDragging ? 'scale-[0.98]' : 'hover:shadow-md hover:scale-[1.02]'
                  }`}
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${16 * (itemsPerView - 1) / itemsPerView}px)`,
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      draggable={false}
                    />
                    {product.destacado && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Destacado
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-primary-600 font-medium uppercase mb-1">
                      {product.categoria}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                      {product.nombre}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {product.tienda.nombre}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {product.tienda.rating}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.precio)}
                    </div>
                  </div>
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
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    Math.round(currentIndex) === i
                      ? 'bg-primary-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary-300'
                  }`}
                  disabled={isDragging || isTransitioning}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}



