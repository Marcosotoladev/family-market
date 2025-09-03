// src/components/ui/ProductCard.js
'use client'
import { useState } from 'react'
import { Heart, Star, MapPin, Clock, ShoppingCart, Eye } from 'lucide-react'
import { formatearPrecio } from '@/lib/helpers'

export default function ProductCard({ 
  product,
  variant = 'default', // 'default', 'featured', 'compact'
  onFavoriteClick,
  onAddToCart,
  onViewProduct
}) {
  const [isFavorite, setIsFavorite] = useState(product?.isFavorite || false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Mock data si no se pasa producto
  const mockProduct = {
    id: '1',
    nombre: 'Torta de Chocolate Artesanal',
    precio: 15000,
    imagenes: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop'
    ],
    tienda: {
      nombre: 'Dulces de María',
      ubicacion: 'Córdoba Centro',
      rating: 4.8,
      verificada: true
    },
    categoria: 'Repostería',
    destacado: false,
    disponible: true,
    fechaCreacion: new Date(),
    isFavorite: false,
    stats: {
      views: 245,
      favorites: 18
    }
  }

  const productData = product || mockProduct

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    onFavoriteClick?.(productData.id, !isFavorite)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    onAddToCart?.(productData)
  }

  const handleCardClick = () => {
    onViewProduct?.(productData.id)
  }

  const handleImageHover = (index) => {
    if (productData.imagenes.length > 1) {
      setCurrentImageIndex(index)
    }
  }

  const isNew = () => {
    const daysDiff = (new Date() - new Date(productData.fechaCreacion)) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }

  return (
    <div 
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-700
        ${variant === 'featured' ? 'lg:col-span-2 lg:row-span-2' : ''}
        ${variant === 'compact' ? 'flex flex-row' : 'flex flex-col'}
        hover:scale-105 hover:-translate-y-1
      `}
      onClick={handleCardClick}
    >
      {/* Imagen del producto */}
      <div className={`
        relative overflow-hidden bg-gray-100 dark:bg-gray-700
        ${variant === 'compact' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square w-full'}
        ${variant === 'featured' ? 'lg:aspect-[4/3]' : ''}
      `}>
        {/* Imagen principal */}
        <img
          src={productData.imagenes[currentImageIndex]}
          alt={productData.nombre}
          className={`
            w-full h-full object-cover transition-all duration-500
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            group-hover:scale-110
          `}
          onLoad={() => setImageLoaded(true)}
          onMouseEnter={() => handleImageHover(1)}
          onMouseLeave={() => handleImageHover(0)}
        />

        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {productData.destacado && (
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-2 py-1 rounded-full font-medium">
              ⭐ Destacado
            </span>
          )}
          {isNew() && (
            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
              🆕 Nuevo
            </span>
          )}
          {!productData.disponible && (
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-1 rounded-full font-medium">
              Agotado
            </span>
          )}
        </div>

        {/* Botón de favorito */}
        {variant !== 'compact' && (
          <button
            onClick={handleFavoriteClick}
            className={`
              absolute top-2 right-2 p-2 rounded-full transition-all duration-200 backdrop-blur-sm
              ${isFavorite 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white'
              }
            `}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Overlay con acciones rápidas */}
        {variant !== 'compact' && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-primary-500 hover:text-white transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
                disabled={!productData.disponible}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-600 dark:hover:bg-gray-600 hover:text-white transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 delay-75">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Indicador de múltiples imágenes */}
        {productData.imagenes.length > 1 && variant !== 'compact' && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {productData.imagenes.slice(0, 3).map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido del producto */}
      <div className={`
        p-4 flex-1
        ${variant === 'compact' ? 'py-2' : ''}
      `}>
        {/* Header con título y precio */}
        <div className="mb-2">
          <h3 className={`
            font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary-600 transition-colors
            ${variant === 'compact' ? 'text-sm' : 'text-base'}
          `}>
            {productData.nombre}
          </h3>
          <p className={`
            font-bold text-primary-600 mt-1
            ${variant === 'compact' ? 'text-sm' : 'text-lg'}
          `}>
            {formatearPrecio(productData.precio)}
          </p>
        </div>

        {/* Información de la tienda */}
        {variant !== 'compact' && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {productData.tienda.nombre}
              </span>
              {productData.tienda.verificada && (
                <span className="text-primary-500">✓</span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{productData.tienda.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{productData.tienda.ubicacion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats y acciones */}
        <div className="flex items-center justify-between">
          {variant !== 'compact' ? (
            <>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{productData.stats?.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{productData.stats?.favorites || 0}</span>
                </div>
              </div>
              
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {productData.categoria}
              </span>
            </>
          ) : (
            <button
              onClick={handleFavoriteClick}
              className={`
                text-sm transition-colors
                ${isFavorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'}
              `}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}