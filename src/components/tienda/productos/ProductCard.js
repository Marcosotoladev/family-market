// src/components/tienda/productos/ProductCard.js
'use client';

import { useState, useEffect } from 'react';
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
  MapPin,
  Store,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Users
} from 'lucide-react';
import { 
  formatearPrecio, 
  TIPOS_PRECIO,
  renderEstrellas
} from '../../../types/product';
import { useAuth } from '@/contexts/AuthContext';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  updateDoc, 
  increment,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ProductCard({ 
  product, 
  storeData,
  variant = 'grid', // 'grid' | 'list' | 'featured'
  showContactInfo = true,
  showStoreInfo = true,
  onClick = null
}) {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  if (!product) return null;

  const images = product.imagenes || [];
  const hasMultipleImages = images.length > 1;

  // Verificar si está en favoritos al cargar
  useEffect(() => {
    if (user && product.id) {
      checkIfLiked();
    }
    setLikesCount(product.interacciones?.favoritos || 0);
  }, [user, product.id]);

  const checkIfLiked = async () => {
    if (!user) return;
    try {
      const favoritoRef = doc(db, 'favoritos', `${user.uid}_${product.id}`);
      const favoritoDoc = await getDoc(favoritoRef);
      setIsLiked(favoritoDoc.exists());
    } catch (error) {
      console.error('Error verificando favorito:', error);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return; // Ya están cargados
    
    try {
      setLoadingComments(true);
      const commentsRef = collection(db, 'comentarios');
      const q = query(
        commentsRef,
        where('productoId', '==', product.id),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const commentsData = await Promise.all(
        querySnapshot.docs.map(async (commentDoc) => {
          const commentData = { id: commentDoc.id, ...commentDoc.data() };
          
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.usuarioId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentData.usuario = {
                nombre: userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.firstName || userData.familyName || userData.businessName || 'Usuario',
                avatar: userData.profileImage || userData.storeLogo || null
              };
            } else {
              commentData.usuario = {
                nombre: 'Usuario',
                avatar: null
              };
            }
          } catch (error) {
            commentData.usuario = {
              nombre: 'Usuario',
              avatar: null
            };
          }
          
          return commentData;
        })
      );
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Debes iniciar sesión para marcar favoritos');
      return;
    }

    setLoading(true);
    try {
      const favoritoRef = doc(db, 'favoritos', `${user.uid}_${product.id}`);
      const productRef = doc(db, 'productos', product.id);

      if (isLiked) {
        // Quitar de favoritos
        await deleteDoc(favoritoRef);
        await updateDoc(productRef, {
          'interacciones.favoritos': increment(-1)
        });
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Agregar a favoritos
        await setDoc(favoritoRef, {
          usuarioId: user.uid,
          productoId: product.id,
          fechaCreacion: new Date()
        });
        await updateDoc(productRef, {
          'interacciones.favoritos': increment(1)
        });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = (e) => {
    e.stopPropagation();
    // Usar los datos de contacto específicos del producto, con fallback a storeData
    const phone = product.contacto?.whatsapp || 
                  storeData?.phone || '';
    
    const message = product.contacto?.mensaje || 
      `Hola! Me interesa tu producto: ${product.titulo || product.nombre}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    // Usar los datos de contacto específicos del producto, con fallback a storeData
    const phone = product.contacto?.telefono || 
                  storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = product.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${product.titulo || product.nombre}`;
    const body = `Hola! Me interesa tu producto: ${product.titulo || product.nombre}\n\nPodrías darme más información?`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/tienda/${product.tiendaInfo?.slug || storeData?.storeSlug}/producto/${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.titulo || product.nombre,
          text: product.descripcion,
          url: productUrl,
        });
        
        // Incrementar contador de compartidas
        const productRef = doc(db, 'productos', product.id);
        await updateDoc(productRef, {
          'interacciones.compartidas': increment(1)
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback para escritorio
      navigator.clipboard.writeText(productUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleViewStore = (e) => {
    e.stopPropagation();
    const storeUrl = `https://familymarket.vercel.app/tienda/${product.tiendaInfo?.slug || storeData?.storeSlug}`;
    window.open(storeUrl, '_blank');
  };

  const handleToggleComments = async (e) => {
    e.stopPropagation();
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
        />
      );
    }
    
    // Estrella media si es necesaria
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-4 h-4 text-yellow-400 fill-current opacity-50"
        />
      );
    }
    
    // Estrellas vacías para completar 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300 dark:text-gray-600"
        />
      );
    }
    
    return stars;
  };

  // Variante Grid (tarjeta principal)
  if (variant === 'grid') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 ${
          onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
        }`}
        onClick={onClick}
      >
        {/* Carousel de Imágenes */}
        <div className="relative h-64 overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex] || images[0]}
                alt={product.titulo || product.nombre}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {/* Indicadores de imagen */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Botones de acción en la esquina superior derecha */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                isLiked 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white bg-opacity-90 text-gray-700 hover:bg-opacity-100'
              } disabled:opacity-50`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-full hover:bg-opacity-100 transition-all backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Badge de estado del producto - Solo mostrar si NO está disponible */}
          {product.estado && product.estado !== 'disponible' && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 text-white text-xs font-medium rounded-full shadow-md ${
                product.estado === 'agotado' ? 'bg-red-500' :
                product.estado === 'pausado' ? 'bg-yellow-500' :
                product.estado === 'inactivo' ? 'bg-gray-500' : 'bg-gray-500'
              }`}>
                {product.estado.charAt(0).toUpperCase() + product.estado.slice(1)}
              </span>
            </div>
          )}

          {/* Badge de condición si no es "nuevo" */}
          {product.condicion && product.condicion !== 'nuevo' && (
            <div className="absolute top-3 left-3" style={{ marginTop: product.estado && product.estado !== 'disponible' ? '35px' : '0' }}>
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-md">
                {product.condicion.charAt(0).toUpperCase() + product.condicion.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-5">
          {/* Título */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
            {product.titulo || product.nombre}
          </h3>
          
          {/* Descripción */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {product.descripcion}
          </p>

          {/* Precio */}
          <div className="mb-4">
            {product.tipoPrecio === TIPOS_PRECIO.FIJO ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatearPrecio(product.precio, product.moneda)}
                </span>
                {product.precioAnterior && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatearPrecio(product.precioAnterior, product.moneda)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {product.tipoPrecio === 'negociable' && 'Precio negociable'}
                {product.tipoPrecio === 'consultar' && 'Consultar precio'}
                {product.tipoPrecio === 'gratis' && 'Gratis'}
              </span>
            )}
          </div>

          {/* Información de peso si está disponible */}
          {product.peso && (
            <div className="mb-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Peso: {product.peso} {product.unidadPeso || 'gramos'}
              </span>
            </div>
          )}

          {/* Palabras clave si están disponibles */}
          {product.palabrasClave && product.palabrasClave.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {product.palabrasClave.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                  >
                    #{keyword}
                  </span>
                ))}
                {product.palabrasClave.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                    +{product.palabrasClave.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Valoraciones - Mostrar siempre, incluso con 0 valoraciones */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((starNumber) => {
                  const rating = product.valoraciones?.promedio || 0;
                  const isFilled = starNumber <= Math.floor(rating);
                  const isHalf = starNumber === Math.floor(rating) + 1 && rating % 1 !== 0;
                  
                  return (
                    <Star
                      key={starNumber}
                      className={`w-4 h-4 ${
                        isFilled 
                          ? 'text-yellow-400 fill-current' 
                          : isHalf 
                          ? 'text-yellow-400 fill-current opacity-50' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {product.valoraciones?.total > 0 
                  ? `${(product.valoraciones.promedio || 0).toFixed(1)} (${product.valoraciones.total} ${product.valoraciones.total === 1 ? 'valoración' : 'valoraciones'})`
                  : 'Sin valoraciones aún'
                }
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const productIdentifier = product.id;
                const storeSlug = product.tiendaInfo?.slug || storeData?.storeSlug;
                
                if (!productIdentifier || !storeSlug) {
                  alert('Error: Faltan datos del producto o tienda');
                  return;
                }
                
                const url = `https://familymarket.vercel.app/tienda/${storeSlug}/producto/${productIdentifier}`;
                window.location.href = url;
              }}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Valorar
            </button>
          </div>

          {/* Información de la tienda */}
          {showStoreInfo && (
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {product.tiendaInfo?.nombre || storeData?.businessName || storeData?.familyName}
                </span>
              </div>
              <button
                onClick={handleViewStore}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                title="Ver tienda"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Estadísticas de interacción - Solo mostrar si hay datos relevantes */}
          {((product.interacciones?.vistas > 0 || product.totalVistas > 0) || 
            likesCount > 0 || 
            (product.interacciones?.comentarios > 0)) && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-4">
                {(product.interacciones?.vistas > 0 || product.totalVistas > 0) && (
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{product.interacciones?.vistas || product.totalVistas || 0}</span>
                  </span>
                )}
                {likesCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{likesCount}</span>
                  </span>
                )}
                {product.interacciones?.comentarios > 0 && (
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{product.interacciones?.comentarios}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sección de comentarios expandible */}
          {product.interacciones?.comentarios > 0 && (
            <div className="mb-4">
              <button
                onClick={handleToggleComments}
                className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ver comentarios ({product.interacciones.comentarios})
                  </span>
                </div>
                {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Lista de comentarios expandible */}
              {showComments && (
                <div className="mt-3 space-y-3">
                  {loadingComments ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex-shrink-0">
                          {comment.usuario?.avatar ? (
                            <img
                              src={comment.usuario.avatar}
                              alt={comment.usuario.nombre}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {comment.usuario?.nombre ? comment.usuario.nombre.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h6 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {comment.usuario?.nombre || 'Usuario'}
                            </h6>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.fechaCreacion?.toDate?.()?.toLocaleDateString('es-ES', {
                                month: 'short',
                                day: 'numeric'
                              }) || ''}
                            </span>
                          </div>
                          
                          {comment.valoracion > 0 && (
                            <div className="flex items-center mb-1">
                              {renderStars(comment.valoracion).slice(0, comment.valoracion)}
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {comment.contenido}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay comentarios disponibles
                    </p>
                  )}
                  
                  {comments.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const productIdentifier = product.id;
                        const storeSlug = product.tiendaInfo?.slug || storeData?.storeSlug;
                        const url = `https://familymarket.vercel.app/tienda/${storeSlug}/producto/${productIdentifier}`;
                        window.location.href = url;
                      }}
                      className="w-full text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-center py-2 cursor-pointer"
                    >
                      Ver todos los comentarios
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Opciones de entrega - Actualizadas según el formulario */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.entrega?.enLocal && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">
                <MapPin className="w-3 h-3 mr-1" />
                En local
              </span>
            )}
            {product.entrega?.delivery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium">
                <Truck className="w-3 h-3 mr-1" />
                Delivery
                {product.entrega?.costoDelivery > 0 && (
                  <span className="ml-1">
                    (${product.entrega.costoDelivery})
                  </span>
                )}
              </span>
            )}
            {product.entrega?.puntoEncuentro && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">
                <Users className="w-3 h-3 mr-1" />
                Punto encuentro
              </span>
            )}
            {product.entrega?.tiempoPreparacion && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-medium">
                <Clock className="w-3 h-3 mr-1" />
                {product.entrega.tiempoPreparacion}
              </span>
            )}
          </div>

          {/* Botones de contacto */}
          {showContactInfo && (
            <div className="space-y-2">
              {/* WhatsApp principal */}
              {(product.contacto?.whatsapp || storeData?.phone) && (
                <button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contactar por WhatsApp</span>
                </button>
              )}
              
              {/* Botones secundarios */}
              <div className="flex space-x-2">
                {(product.contacto?.telefono || storeData?.phone) && (
                  <button
                    onClick={handlePhoneContact}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Llamar</span>
                  </button>
                )}
                
                {(product.contacto?.email || storeData?.email) && (
                  <button
                    onClick={handleEmailContact}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otras variantes pueden mantenerse igual o simplificarse
  return null;
}