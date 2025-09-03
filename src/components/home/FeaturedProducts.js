// src/components/home/FeaturedProducts.js
'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, Flame } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'

export default function FeaturedProducts() {
  const [currentPage, setCurrentPage] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const scrollContainerRef = useRef(null)

  // Hook para manejar el tamaño de pantalla
  useEffect(() => {
    setIsClient(true)
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Establecer el tamaño inicial
    handleResize()
    
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mock data - más adelante vendrá de Firestore
  const featuredProducts = [
    {
      id: 1,
      nombre: 'Torta de Chocolate Premium',
      precio: 25000,
      imagenes: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Dulces de María',
        ubicacion: 'Córdoba Centro',
        rating: 4.9,
        verificada: true
      },
      categoria: 'Repostería',
      destacado: true,
      disponible: true,
      fechaCreacion: new Date('2024-11-01'),
      stats: { views: 1250, favorites: 89 }
    },
    {
      id: 2,
      nombre: 'Set de Organizadores Tejidos',
      precio: 18500,
      imagenes: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Tejidos Ana',
        ubicacion: 'Nueva Córdoba',
        rating: 4.7,
        verificada: true
      },
      categoria: 'Artesanías',
      destacado: true,
      disponible: true,
      fechaCreacion: new Date('2024-10-28'),
      stats: { views: 890, favorites: 45 }
    },
    {
      id: 3,
      nombre: 'Servicio de Diseño Web Profesional',
      precio: 150000,
      imagenes: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'DevCristiano',
        ubicacion: 'Remoto',
        rating: 5.0,
        verificada: true
      },
      categoria: 'Servicios Profesionales',
      destacado: true,
      disponible: true,
      fechaCreacion: new Date('2024-11-02'),
      stats: { views: 567, favorites: 23 }
    },
    {
      id: 4,
      nombre: 'Macetas de Cerámica Artesanal',
      precio: 8500,
      imagenes: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Cerámica Esperanza',
        ubicacion: 'Villa Allende',
        rating: 4.6,
        verificada: false
      },
      categoria: 'Decoración',
      destacado: true,
      disponible: true,
      fechaCreacion: new Date('2024-10-30'),
      stats: { views: 423, favorites: 31 }
    },
    {
      id: 5,
      nombre: 'Clases de Piano Online',
      precio: 12000,
      imagenes: [
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Música & Fe',
        ubicacion: 'Córdoba',
        rating: 4.8,
        verificada: true
      },
      categoria: 'Educación',
      destacado: true,
      disponible: true,
      fechaCreacion: new Date('2024-10-25'),
      stats: { views: 756, favorites: 67 }
    },
    {
      id: 6,
      nombre: 'Pan Casero Integral',
      precio: 3500,
      imagenes: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Panadería Bendición',
        ubicacion: 'Barrio Jardín',
        rating: 4.5,
        verificada: true
      },
      categoria: 'Alimentos',
      destacado: true,
      disponible: true,
      fechaCreacion: new Date('2024-11-03'),
      stats: { views: 234, favorites: 12 }
    }
  ]

  // Calcular itemsPerPage de forma segura
  const getItemsPerPage = () => {
    if (!isClient) return 4 // Valor por defecto para SSR
    return windowWidth >= 1024 ? 4 : windowWidth >= 768 ? 3 : 2
  }

  const itemsPerPage = getItemsPerPage()
  const totalPages = Math.ceil(featuredProducts.length / itemsPerPage)

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })

    // Actualizar página actual
    const newPage = direction === 'left' 
      ? Math.max(0, currentPage - 1)
      : Math.min(totalPages - 1, currentPage + 1)
    
    setCurrentPage(newPage)
  }

  const handleProductView = (productId) => {
    console.log('Ver producto:', productId)
    // Aquí irá la navegación al producto
  }

  const handleFavorite = (productId, isFavorite) => {
    console.log('Favorito:', productId, isFavorite)
    // Aquí irá la lógica de favoritos
  }

  const handleAddToCart = (product) => {
    console.log('Agregar al carrito:', product)
    // Aquí irá la lógica del carrito
  }

  // Mostrar loading mientras se inicializa el cliente
  if (!isClient) {
    return (
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-gray-600 dark:text-gray-400">Cargando productos destacados...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">Productos Destacados</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Los más populares de nuestra comunidad
              </p>
            </div>
          </div>

          {/* Controles de navegación - Solo desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              disabled={currentPage === 0}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={currentPage === totalPages - 1}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Ver todos - Mobile */}
          <button className="lg:hidden text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors">
            Ver todos
          </button>
        </div>

        {/* Grid de productos destacados */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
        >
          {featuredProducts.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0 w-64 lg:w-auto"
            >
              <ProductCard
                product={product}
                variant="featured"
                onViewProduct={handleProductView}
                onFavoriteClick={handleFavorite}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>

        {/* Indicadores para mobile */}
        <div className="flex lg:hidden justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(featuredProducts.length / 2) }, (_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === Math.floor(currentPage / 2) 
                  ? 'bg-primary-500 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              onClick={() => setCurrentPage(index * 2)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 lg:mt-12">
          <button className="border-2 border-primary-500 text-primary-500 hover:text-white bg-transparent hover:bg-primary-500 font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 hover:scale-105 transform">
            Ver todos los destacados
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-primary-900/20 dark:to-orange-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-primary-600">
                {featuredProducts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Destacados</div>
            </div>
            <div className="w-px h-12 bg-primary-200 dark:bg-primary-700"></div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-primary-600">4.8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rating promedio</div>
            </div>
            <div className="w-px h-12 bg-primary-200 dark:bg-primary-700"></div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-primary-600">89%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}