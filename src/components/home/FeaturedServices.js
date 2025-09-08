// src/components/home/FeaturedServices.js
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, Wrench, MapPin, Shield, Clock, Users } from 'lucide-react'

export default function FeaturedServices() {
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

  // Servicios de prueba (8)
  const featuredServices = [
    {
      id: 1,
      nombre: 'Plomería y Gasista Matriculado',
      precioDesde: 8000,
      imagen: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=300&fit=crop',
      categoria: 'Hogar y Mantenimiento',
      proveedor: { nombre: 'Servicios López', ubicacion: 'Córdoba Centro', rating: 4.9, verificado: true },
      destacado: true,
      tiempoRespuesta: '2 hrs',
      disponibilidad: '24/7'
    },
    {
      id: 2,
      nombre: 'Clases Particulares de Matemática',
      precioDesde: 5000,
      imagen: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
      categoria: 'Educación',
      proveedor: { nombre: 'Prof. Ana García', ubicacion: 'Nueva Córdoba', rating: 4.8, verificado: true },
      destacado: true,
      tiempoRespuesta: '30 min',
      disponibilidad: 'Lun-Vie'
    },
    {
      id: 3,
      nombre: 'Limpieza Profunda de Hogar',
      precioDesde: 15000,
      imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      categoria: 'Limpieza',
      proveedor: { nombre: 'Limpieza Express', ubicacion: 'Córdoba', rating: 4.7, verificado: true },
      destacado: true,
      tiempoRespuesta: '1 hr',
      disponibilidad: 'Todos los días'
    },
    {
      id: 4,
      nombre: 'Reparación de Electrodomésticos',
      precioDesde: 6000,
      imagen: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
      categoria: 'Reparaciones',
      proveedor: { nombre: 'TecnoFix', ubicacion: 'Villa Allende', rating: 4.6, verificado: false },
      destacado: true,
      tiempoRespuesta: '4 hrs',
      disponibilidad: 'Lun-Sab'
    },
    {
      id: 5,
      nombre: 'Sesión de Fotografía Profesional',
      precioDesde: 25000,
      imagen: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      categoria: 'Fotografía',
      proveedor: { nombre: 'Estudio Luz', ubicacion: 'Córdoba', rating: 4.9, verificado: true },
      destacado: true,
      tiempoRespuesta: '1 día',
      disponibilidad: 'Cita previa'
    },
    {
      id: 6,
      nombre: 'Servicio de Jardinería y Paisajismo',
      precioDesde: 12000,
      imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      categoria: 'Jardinería',
      proveedor: { nombre: 'Verde Natural', ubicacion: 'Barrio Jardín', rating: 4.5, verificado: true },
      destacado: true,
      tiempoRespuesta: '2 hrs',
      disponibilidad: 'Lun-Vie'
    },
    {
      id: 7,
      nombre: 'Masajes Terapéuticos a Domicilio',
      precioDesde: 8500,
      imagen: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
      categoria: 'Bienestar',
      proveedor: { nombre: 'Terapias Relax', ubicacion: 'Córdoba Centro', rating: 4.8, verificado: true },
      destacado: true,
      tiempoRespuesta: '3 hrs',
      disponibilidad: 'Todos los días'
    },
    {
      id: 8,
      nombre: 'Servicio de Catering para Eventos',
      precioDesde: 35000,
      imagen: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop',
      categoria: 'Eventos',
      proveedor: { nombre: 'Sabores Unidos', ubicacion: 'Nueva Córdoba', rating: 4.7, verificado: true },
      destacado: true,
      tiempoRespuesta: '2 días',
      disponibilidad: 'Fin de semana'
    },
  ]

  const isMobile = windowWidth < 1024
  const itemsPerView = isMobile ? 2 : 5
  const maxIndex = Math.max(0, featuredServices.length - itemsPerView)

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
        <div className="text-center">Cargando servicios destacados...</div>
      </section>
    )
  }

  const currentOffset = currentIndex + dragOffset
  const translateX = -(currentOffset * (100 / itemsPerView))

  return (
    <section className="pb-2 lg:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Servicios Destacados
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
              {featuredServices.map((service, index) => (
                <div
                  key={service.id}
                  className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${isDragging ? 'scale-[0.98]' : 'hover:shadow-md'
                    }`}
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${16 * (itemsPerView - 1) / itemsPerView}px)`,
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={service.imagen}
                      alt={service.nombre}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {service.destacado && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Destacado
                      </div>
                    )}
                    {service.proveedor.verificado && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <Shield className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-blue-600 font-medium uppercase mb-1">
                      {service.categoria}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                      {service.nombre}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {service.proveedor.nombre}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {service.proveedor.rating}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información adicional de servicio */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.tiempoRespuesta}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{service.disponibilidad}</span>
                      </div>
                    </div>

                    <div className="mt-2 font-bold text-gray-900 dark:text-white">
                      Desde {formatPrice(service.precioDesde)}
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
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${Math.round(currentIndex) === i
                      ? 'bg-blue-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-300'
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