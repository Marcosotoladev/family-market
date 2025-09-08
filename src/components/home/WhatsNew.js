// src/components/home/WhatsNew.js
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, Sparkles, Clock, MapPin, Package, Wrench, Briefcase, Zap, Shield, Calendar, Eye, Heart } from 'lucide-react'

export default function WhatsNew() {
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

  // Mezcla de productos, servicios y empleos recién publicados
  const newItems = [
    {
      id: 1,
      tipo: 'producto',
      titulo: 'Auriculares Bluetooth Premium',
      precio: 35000,
      imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      categoria: 'Tecnología',
      publicadoPor: { nombre: 'TechStore CBA', ubicacion: 'Córdoba Centro', rating: 4.8, verificado: true },
      publicadoHace: '2 horas',
      vistas: 24,
      meGusta: 8,
      nuevo: true
    },

    {
      id: 3,
      tipo: 'empleo',
      titulo: 'Marketing Digital - Tiempo Completo',
      salario: 140000,
      imagen: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      categoria: 'Marketing',
      publicadoPor: { nombre: 'Digital Agency', ubicacion: 'Córdoba', rating: 4.7, verificado: true },
      publicadoHace: '6 horas',
      modalidad: 'Híbrido',
      nuevo: true
    },
    {
      id: 4,
      tipo: 'producto',
      titulo: 'Plantas de Interior Decorativas',
      precio: 4500,
      imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      categoria: 'Jardín',
      publicadoPor: { nombre: 'Verde Vida', ubicacion: 'Villa Allende', rating: 4.6, verificado: false },
      publicadoHace: '8 horas',
      vistas: 67,
      meGusta: 15,
      nuevo: true
    },

    {
      id: 6,
      tipo: 'empleo',
      titulo: 'Chofer de Reparto - Part Time',
      salario: 80000,
      imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      categoria: 'Logística',
      publicadoPor: { nombre: 'Express Delivery', ubicacion: 'Córdoba', rating: 4.5, verificado: true },
      publicadoHace: '12 horas',
      modalidad: 'Presencial',
      nuevo: true
    },
    {
      id: 7,
      tipo: 'producto',
      titulo: 'Muebles de Madera Artesanal',
      precio: 89000,
      imagen: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      categoria: 'Muebles',
      publicadoPor: { nombre: 'Carpintería Rossi', ubicacion: 'Córdoba Centro', rating: 4.9, verificado: true },
      publicadoHace: '1 día',
      vistas: 142,
      meGusta: 34,
      nuevo: true
    },
    {
      id: 8,
      tipo: 'servicio',
      titulo: 'Reparación de Celulares Express',
      precioDesde: 5000,
      imagen: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      categoria: 'Tecnología',
      publicadoPor: { nombre: 'Fix Mobile', ubicacion: 'Nueva Córdoba', rating: 4.7, verificado: true },
      publicadoHace: '1 día',
      disponibilidad: '1 hora',
      nuevo: true
    }
  ]

  const isMobile = windowWidth < 1024
  const itemsPerView = isMobile ? 2 : 5
  const maxIndex = Math.max(0, newItems.length - itemsPerView)

  // Función para animar suavemente hacia un índice específico
  const animateToIndex = useCallback((targetIndex) => {
    const clampedIndex = Math.max(0, Math.min(maxIndex, targetIndex))
    setIsTransitioning(true)
    setCurrentIndex(clampedIndex)
    setDragOffset(0)

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

      let newOffset = dragDistance
      const futureIndex = scrollLeft + dragDistance

      if (futureIndex < 0) {
        newOffset = dragDistance * (1 - Math.abs(futureIndex) * 0.3)
      } else if (futureIndex > maxIndex) {
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

    const threshold = 0.3
    let targetIndex = scrollLeft + dragOffset

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
    e.preventDefault()
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

  // Función para obtener icono según tipo
  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'producto': return Package
      case 'servicio': return Wrench
      case 'empleo': return Briefcase
      default: return Package
    }
  }

  // Función para obtener color según tipo
  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'producto': return 'from-blue-500 to-indigo-600'
      case 'servicio': return 'from-green-500 to-emerald-600'
      case 'empleo': return 'from-purple-500 to-violet-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Función para obtener color de texto según tipo
  const getTypeTextColor = (tipo) => {
    switch (tipo) {
      case 'producto': return 'text-blue-600'
      case 'servicio': return 'text-green-600'
      case 'empleo': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando novedades...</div>
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
          <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-lg relative">
            <Sparkles className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Lo Nuevo
          </h2>
          <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
            Recién publicado
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
              {newItems.map((item, index) => {
                const TypeIcon = getTypeIcon(item.tipo)
                
                return (
                  <div
                    key={item.id}
                    className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${isDragging ? 'scale-[0.98]' : 'hover:shadow-md'
                      }`}
                    style={{
                      width: `calc(${100 / itemsPerView}% - ${16 * (itemsPerView - 1) / itemsPerView}px)`,
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={item.imagen}
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      
                      {/* Badge de tipo */}
                      <div className={`absolute top-2 left-2 bg-gradient-to-r ${getTypeColor(item.tipo)} text-white px-2 py-1 rounded text-xs flex items-center gap-1`}>
                        <TypeIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{item.tipo === 'producto' ? 'Producto' : item.tipo === 'servicio' ? 'Servicio' : 'Empleo'}</span>
                      </div>

                      {/* Badge NUEVO */}
                      {item.nuevo && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-1 sm:px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3" />
                          <span className="hidden sm:inline">NUEVO</span>
                        </div>
                      )}

                      {/* Badge de verificación */}
                      {item.publicadoPor.verificado && (
                        <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <div className={`text-xs font-medium uppercase mb-1 ${getTypeTextColor(item.tipo)}`}>
                        {item.categoria}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                        {item.titulo}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {item.publicadoPor.nombre}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {item.publicadoPor.rating}
                          </span>
                        </div>
                      </div>

                      {/* Información específica por tipo */}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.publicadoHace}</span>
                        </div>
                        {item.tipo === 'producto' && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{item.vistas}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{item.meGusta}</span>
                            </div>
                          </div>
                        )}
                        {item.tipo === 'servicio' && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.disponibilidad}</span>
                          </div>
                        )}
                        {item.tipo === 'empleo' && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{item.modalidad}</span>
                          </div>
                        )}
                      </div>

                      {/* Precio */}
                      <div className="mt-2 font-bold text-gray-900 dark:text-white">
                        {item.tipo === 'producto' && formatPrice(item.precio)}
                        {item.tipo === 'servicio' && `Desde ${formatPrice(item.precioDesde)}`}
                        {item.tipo === 'empleo' && formatPrice(item.salario)}
                      </div>
                    </div>
                  </div>
                )
              })}
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
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-emerald-300'
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