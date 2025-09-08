// src/components/home/FeaturedJobs.js
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, Briefcase, MapPin, Clock, Building2, User, Search, Calendar, DollarSign, GraduationCap } from 'lucide-react'

export default function FeaturedJobs() {
  const [windowWidth, setWindowWidth] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeTab, setActiveTab] = useState('ofertas') // 'ofertas' o 'demandas'
  const scrollContainerRef = useRef(null)
  const rafRef = useRef()

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Ofertas laborales (empresas buscando empleados)
  const jobOffers = [
    {
      id: 1,
      tipo: 'oferta',
      titulo: 'Desarrollador Frontend React',
      salario: 180000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      categoria: 'Tecnología',
      empresa: { nombre: 'TechCorp SA', ubicacion: 'Córdoba Centro', rating: 4.8, verificada: true },
      modalidad: 'Híbrido',
      experiencia: '2-3 años',
      publicado: '2 días',
      destacado: true
    },
    {
      id: 2,
      tipo: 'oferta',
      titulo: 'Chef de Cocina',
      salario: 120000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      categoria: 'Gastronomía',
      empresa: { nombre: 'Restaurante Sabores', ubicacion: 'Nueva Córdoba', rating: 4.6, verificada: true },
      modalidad: 'Presencial',
      experiencia: '3+ años',
      publicado: '1 día',
      destacado: true
    },
    {
      id: 3,
      tipo: 'oferta',
      titulo: 'Diseñador Gráfico',
      salario: 90000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400&h=300&fit=crop',
      categoria: 'Diseño',
      empresa: { nombre: 'Agencia Creativa', ubicacion: 'Villa Allende', rating: 4.7, verificada: false },
      modalidad: 'Remoto',
      experiencia: '1-2 años',
      publicado: '3 días',
      destacado: true
    },
    {
      id: 4,
      tipo: 'oferta',
      titulo: 'Vendedor Senior',
      salario: 80000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      categoria: 'Ventas',
      empresa: { nombre: 'ComercialPlus', ubicacion: 'Córdoba', rating: 4.5, verificada: true },
      modalidad: 'Presencial',
      experiencia: '2+ años',
      publicado: '5 días',
      destacado: true
    }
  ]

  // Demandas laborales (personas buscando trabajo)
  const jobDemands = [
    {
      id: 5,
      tipo: 'demanda',
      titulo: 'Busco trabajo como Contador',
      salarioPretendido: 150000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      categoria: 'Administración',
      candidato: { nombre: 'María González', ubicacion: 'Córdoba Centro', rating: 4.9, verificado: true },
      disponibilidad: 'Inmediata',
      experiencia: '5 años',
      publicado: '1 día',
      modalidadBuscada: 'Presencial/Híbrido'
    },
    {
      id: 6,
      tipo: 'demanda',
      titulo: 'Programador Python disponible',
      salarioPretendido: 200000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
      categoria: 'Tecnología',
      candidato: { nombre: 'Carlos López', ubicacion: 'Nueva Córdoba', rating: 4.8, verificado: true },
      disponibilidad: '2 semanas',
      experiencia: '3 años',
      publicado: '2 días',
      modalidadBuscada: 'Remoto'
    },
    {
      id: 7,
      tipo: 'demanda',
      titulo: 'Enfermera con experiencia',
      salarioPretendido: 110000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
      categoria: 'Salud',
      candidato: { nombre: 'Ana Martínez', ubicacion: 'Barrio Jardín', rating: 4.9, verificado: true },
      disponibilidad: 'Inmediata',
      experiencia: '4 años',
      publicado: '3 días',
      modalidadBuscada: 'Presencial'
    },
    {
      id: 8,
      tipo: 'demanda',
      titulo: 'Profesor de Inglés bilingüe',
      salarioPretendido: 60000,
      tipoSalario: 'mensual',
      imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      categoria: 'Educación',
      candidato: { nombre: 'Roberto Silva', ubicacion: 'Córdoba', rating: 4.7, verificado: false },
      disponibilidad: '1 mes',
      experiencia: '6 años',
      publicado: '4 días',
      modalidadBuscada: 'Presencial/Online'
    }
  ]

  const isMobile = windowWidth < 1024
  const itemsPerView = isMobile ? 2 : 5
  const currentData = activeTab === 'ofertas' ? jobOffers : jobDemands
  const maxIndex = Math.max(0, currentData.length - itemsPerView)

  // Resetear índice cuando cambia el tab
  useEffect(() => {
    setCurrentIndex(0)
    setDragOffset(0)
  }, [activeTab])

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

  const formatSalary = (salary) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)

  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="text-center">Cargando empleos destacados...</div>
      </section>
    )
  }

  const currentOffset = currentIndex + dragOffset
  const translateX = -(currentOffset * (100 / itemsPerView))

  return (
    <section className="pb-2 lg:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Empleos Destacados
            </h2>
          </div>

          {/* Tabs para alternar entre ofertas y demandas */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ofertas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'ofertas'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Ofertas
            </button>
            <button
              onClick={() => setActiveTab('demandas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'demandas'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Demandas
            </button>
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
              {currentData.map((job, index) => (
                <div
                  key={job.id}
                  className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${isDragging ? 'scale-[0.98]' : 'hover:shadow-md'
                    }`}
                  style={{
                    width: `calc(${100 / itemsPerView}% - ${16 * (itemsPerView - 1) / itemsPerView}px)`,
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={job.imagen}
                      alt={job.titulo}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {job.destacado && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Destacado
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                      job.tipo === 'oferta' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {job.tipo === 'oferta' ? 'Buscan' : 'Busco'}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-purple-600 font-medium uppercase mb-1">
                      {job.categoria}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                      {job.titulo}
                    </h3>
                    
                    {/* Información específica según el tipo */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {job.tipo === 'oferta' ? job.empresa.nombre : job.candidato.nombre}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {job.tipo === 'oferta' ? job.empresa.rating : job.candidato.rating}
                        </span>
                      </div>
                    </div>

                    {/* Detalles adicionales */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        {job.tipo === 'oferta' ? <MapPin className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        <span>{job.tipo === 'oferta' ? job.modalidad : job.disponibilidad}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>{job.experiencia}</span>
                      </div>
                    </div>

                    <div className="mt-2 font-bold text-gray-900 dark:text-white">
                      {job.tipo === 'oferta' 
                        ? formatSalary(job.salario)
                        : `Pretende ${formatSalary(job.salarioPretendido)}`
                      }
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
                      ? 'bg-purple-500 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-purple-300'
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