// src/components/tienda/productos/ProductCard.js
'use client';

import { useState } from 'react';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Package,
  Truck,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  formatearPrecio, 
  obtenerEstadoBadge,
  TIPOS_PRECIO,
  ESTADOS_PRODUCTO
} from '@/types/product';

export default function ProductCard({ 
  product, 
  storeData,
  variant = 'grid', // 'grid' | 'list' | 'featured'
  showContactInfo = true,
  onClick = null
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!product) return null;

  const images = product.imagenes || [];
  const hasMultipleImages = images.length > 1;
  const estadoBadge = obtenerEstadoBadge(product.estado);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsAppContact = () => {
    const phone = product.contacto?.whatsapp || storeData?.phone || '';
    const message = product.contacto?.mensaje || 
      `Hola! Me interesa tu producto: ${product.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = () => {
    const phone = product.contacto?.telefono || storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = () => {
    const email = product.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${product.titulo}`;
    const body = `Hola! Me interesa tu producto: ${product.titulo}\n\nPodrías darme más información?`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.titulo,
          text: product.descripcion,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback para escritorio
      navigator.clipboard.writeText(window.location.href);
      // Aquí podrías mostrar un toast de confirmación
    }
  };

  // Variante Grid (tarjeta compacta)
  if (variant === 'grid') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 ${
          onClick ? 'cursor-pointer hover:scale-105' : ''
        }`}
        onClick={onClick}
      >
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex] || images[0]}
                alt={product.titulo}
                className="w-full h-full object-cover"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {/* Indicadores de imagen */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Badge de estado */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              estadoBadge.color === 'green' ? 'bg-green-500 text-white' :
              estadoBadge.color === 'red' ? 'bg-red-500 text-white' :
              estadoBadge.color === 'yellow' ? 'bg-yellow-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {estadoBadge.texto}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
              className={`p-2 rounded-full ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white bg-opacity-80 text-gray-700'
              } hover:bg-opacity-100 transition-all`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="p-2 bg-white bg-opacity-80 text-gray-700 rounded-full hover:bg-opacity-100 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Etiquetas especiales */}
          {product.etiquetas && product.etiquetas.length > 0 && (
            <div className="absolute bottom-2 right-2">
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                {product.etiquetas[0].replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {product.titulo}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.descripcion}
          </p>

          {/* Precio */}
          <div className="mb-3">
            {product.tipoPrecio === TIPOS_PRECIO.FIJO ? (
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatearPrecio(product.precio, product.moneda)}
              </span>
            ) : (
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {product.tipoPrecio.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Opciones de entrega */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.entrega?.retiroLocal && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                <MapPin className="w-3 h-3 mr-1" />
                Retiro
              </span>
            )}
            {product.entrega?.delivery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                <Truck className="w-3 h-3 mr-1" />
                Delivery
              </span>
            )}
            {product.entrega?.envioCorreo && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                <Package className="w-3 h-3 mr-1" />
                Envío
              </span>
            )}
          </div>

          {/* Contacto */}
          {showContactInfo && (
            <div className="flex space-x-2">
              {(product.contacto?.whatsapp || storeData?.phone) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleWhatsAppContact(); }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              )}
              
              {(product.contacto?.telefono || storeData?.phone) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePhoneContact(); }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variante Lista (horizontal)
  if (variant === 'list') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 ${
          onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex">
          {/* Imagen */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={product.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {/* Badge de estado */}
            <div className="absolute top-1 left-1">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                estadoBadge.color === 'green' ? 'bg-green-500 text-white' :
                estadoBadge.color === 'red' ? 'bg-red-500 text-white' :
                estadoBadge.color === 'yellow' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {estadoBadge.texto}
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {product.titulo}
              </h3>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {product.descripcion}
            </p>

            <div className="flex items-center justify-between">
              <div>
                {product.tipoPrecio === TIPOS_PRECIO.FIJO ? (
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatearPrecio(product.precio, product.moneda)}
                  </span>
                ) : (
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {product.tipoPrecio.replace('_', ' ')}
                  </span>
                )}
              </div>

              {showContactInfo && (product.contacto?.whatsapp || storeData?.phone) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleWhatsAppContact(); }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variante Featured (destacado)
  if (variant === 'featured') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 ${
          onClick ? 'cursor-pointer hover:scale-105' : ''
        }`}
        onClick={onClick}
      >
        {/* Imagen principal */}
        <div className="relative h-64 overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex] || images[0]}
                alt={product.titulo}
                className="w-full h-full object-cover"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Indicadores de imagen */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Badge de estado */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              estadoBadge.color === 'green' ? 'bg-green-500 text-white' :
              estadoBadge.color === 'red' ? 'bg-red-500 text-white' :
              estadoBadge.color === 'yellow' ? 'bg-yellow-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {estadoBadge.texto}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
              className={`p-2 rounded-full ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white bg-opacity-90 text-gray-700'
              } hover:bg-opacity-100 transition-all shadow-md`}
            >
              <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all shadow-md"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Etiquetas especiales */}
          {product.etiquetas && product.etiquetas.length > 0 && (
            <div className="absolute bottom-3 right-3 flex flex-wrap gap-1">
              {product.etiquetas.slice(0, 2).map((etiqueta, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium"
                >
                  {etiqueta.replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {product.titulo}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {product.descripcion}
          </p>

          {/* Precio destacado */}
          <div className="mb-4">
            {product.tipoPrecio === TIPOS_PRECIO.FIJO ? (
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatearPrecio(product.precio, product.moneda)}
              </span>
            ) : (
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300 capitalize">
                {product.tipoPrecio.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Información adicional */}
          <div className="space-y-3 mb-6">
            {/* Opciones de entrega */}
            <div className="flex flex-wrap gap-2">
              {product.entrega?.retiroLocal && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <MapPin className="w-4 h-4 mr-1" />
                  Retiro en local
                </span>
              )}
              {product.entrega?.delivery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  <Truck className="w-4 h-4 mr-1" />
                  Delivery {product.entrega.costoDelivery && `(${product.entrega.costoDelivery})`}
                </span>
              )}
              {product.entrega?.envioCorreo && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  <Package className="w-4 h-4 mr-1" />
                  Envío nacional
                </span>
              )}
            </div>

            {/* Tiempo de preparación */}
            {product.entrega?.tiempoPreparacion && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>Tiempo de preparación: {product.entrega.tiempoPreparacion}</span>
              </div>
            )}

            {/* Stock */}
            {product.gestionStock === 'limitado' && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Package className="w-4 h-4 mr-2" />
                <span>Stock disponible: {product.stock || 0} unidades</span>
              </div>
            )}
          </div>

          {/* Botones de contacto */}
          {showContactInfo && (
            <div className="grid grid-cols-1 gap-3">
              {(product.contacto?.whatsapp || storeData?.phone) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleWhatsAppContact(); }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contactar por WhatsApp</span>
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {(product.contacto?.telefono || storeData?.phone) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePhoneContact(); }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Llamar</span>
                  </button>
                )}
                
                {(product.contacto?.email || storeData?.email) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEmailContact(); }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Estadísticas del producto */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.totalVistas || 0} vistas</span>
                </span>
                {product.totalVentas > 0 && (
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{product.totalVentas} vendidos</span>
                  </span>
                )}
              </div>
              
              <span className="text-xs">
                Publicado: {new Date(product.fechaCreacion).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}