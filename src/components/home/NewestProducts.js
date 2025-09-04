// src/components/home/NewestProducts.js
'use client'
import { useState } from 'react'
import { Sparkles, Filter, Calendar } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'

export default function NewestProducts() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list'

  // Mock data - productos más recientes
  const newestProducts = [
    {
      id: 7,
      nombre: 'Collar de Plata con Cruz',
      precio: 35000,
      imagenes: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Joyería Cristiana',
        ubicacion: 'Centro',
        rating: 4.9,
        verificada: true
      },
      categoria: 'Joyería',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-05'),
      stats: { views: 45, favorites: 8 },
      isNew: true
    },
    {
      id: 8,
      nombre: 'Curso de Excel Avanzado',
      precio: 45000,
      imagenes: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Capacitación Digital',
        ubicacion: 'Online',
        rating: 4.7,
        verificada: true
      },
      categoria: 'Educación',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-05'),
      stats: { views: 123, favorites: 15 },
      isNew: true
    },
    {
      id: 9,
      nombre: 'Empanadas Caseras (Docena)',
      precio: 8500,
      imagenes: [
        'https://images.unsplash.com/photo-1599599810694-57a2ca8276a8?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Sabores de Casa',
        ubicacion: 'Barrio Güemes',
        rating: 4.6,
        verificada: false
      },
      categoria: 'Alimentos',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-04'),
      stats: { views: 67, favorites: 12 },
      isNew: true
    },
    {
      id: 10,
      nombre: 'Reparación de Celulares',
      precio: 15000,
      imagenes: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'TecnoFix',
        ubicacion: 'Nueva Córdoba',
        rating: 4.8,
        verificada: true
      },
      categoria: 'Servicios Técnicos',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-04'),
      stats: { views: 89, favorites: 6 },
      isNew: true
    },
    {
      id: 11,
      nombre: 'Cuadros Personalizados',
      precio: 22000,
      imagenes: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Arte & Diseño',
        ubicacion: 'Cerro de las Rosas',
        rating: 4.5,
        verificada: true
      },
      categoria: 'Arte',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-03'),
      stats: { views: 156, favorites: 23 },
      isNew: true
    },
    {
      id: 12,
      nombre: 'Alfajores de Maicena (x12)',
      precio: 6500,
      imagenes: [
        'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Dulces Tradicionales',
        ubicacion: 'Villa Carlos Paz',
        rating: 4.4,
        verificada: false
      },
      categoria: 'Repostería',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-03'),
      stats: { views: 78, favorites: 9 },
      isNew: true
    },
    {
      id: 13,
      nombre: 'Clases de Guitarra a Domicilio',
      precio: 18000,
      imagenes: [
        'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Música en Casa',
        ubicacion: 'Córdoba',
        rating: 4.9,
        verificada: true
      },
      categoria: 'Música',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-02'),
      stats: { views: 234, favorites: 34 },
      isNew: true
    },
    {
      id: 14,
      nombre: 'Plantas Suculentas Variadas',
      precio: 4500,
      imagenes: [
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop'
      ],
      tienda: {
        nombre: 'Verde Esperanza',
        ubicacion: 'Maipú',
        rating: 4.3,
        verificada: false
      },
      categoria: 'Plantas',
      destacado: false,
      disponible: true,
      fechaCreacion: new Date('2024-11-02'),
      stats: { views: 92, favorites: 18 },
      isNew: true
    }
  ]

  const filters = [
    { id: 'all', label: 'Todos', count: newestProducts.length },
    { id: 'productos', label: 'Productos', count: newestProducts.filter(p => !p.categoria.includes('Servicio')).length },
    { id: 'servicios', label: 'Servicios', count: newestProducts.filter(p => p.categoria.includes('Servicio') || p.categoria === 'Educación' || p.categoria === 'Música').length },
    { id: 'today', label: 'Hoy', count: newestProducts.filter(p => {
      const today = new Date().toDateString()
      return new Date(p.fechaCreacion).toDateString() === today
    }).length }
  ]

  const filteredProducts = newestProducts.filter(product => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'productos') return !product.categoria.includes('Servicio') && product.categoria !== 'Educación' && product.categoria !== 'Música'
    if (activeFilter === 'servicios') return product.categoria.includes('Servicio') || product.categoria === 'Educación' || product.categoria === 'Música'
    if (activeFilter === 'today') {
      const today = new Date().toDateString()
      return new Date(product.fechaCreacion).toDateString() === today
    }
    return true
  })

  const handleProductView = (productId) => {
    console.log('Ver producto:', productId)
  }

  const handleFavorite = (productId, isFavorite) => {
    console.log('Favorito:', productId, isFavorite)
  }

  const handleAddToCart = (product) => {
    console.log('Agregar al carrito:', product)
  }

  return (
    <section className=" bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">Recién Llegados</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Los últimos productos y servicios de la comunidad
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeFilter === filter.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {filter.label}
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${activeFilter === filter.id
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{filteredProducts.length} productos encontrados</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span>Ordenar por:</span>
            <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white">
              <option>Más reciente</option>
              <option>Precio menor</option>
              <option>Precio mayor</option>
              <option>Más populares</option>
            </select>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
              onViewProduct={handleProductView}
              onFavoriteClick={handleFavorite}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {/* Estado vacío */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No hay productos nuevos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No se encontraron productos para el filtro seleccionado
            </p>
            <button 
              onClick={() => setActiveFilter('all')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Ver todos los productos
            </button>
          </div>
        )}

        {/* CTA */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-8 lg:mt-12">
            <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 mr-4 hover:scale-105 transform">
              Ver más productos nuevos
            </button>
            <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transform">
              ¡Publica tu producto!
            </button>
          </div>
        )}

        {/* Estadísticas de productos nuevos */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              📈 Actividad de la semana
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {newestProducts.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Nuevos productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {newestProducts.filter(p => p.tienda.verificada).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tiendas verificadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {newestProducts.reduce((acc, p) => acc + p.stats.views, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Vistas totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {newestProducts.reduce((acc, p) => acc + p.stats.favorites, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Favoritos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}