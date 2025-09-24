// src/components/tienda/servicios/ServiceCard.js
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
  Briefcase,
  Clock,
  MapPin,
  Users,
  Calendar,
  Store,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Monitor,
  Home,
  Globe
} from 'lucide-react';
import { 
  formatearPrecioServicio, 
  TIPOS_PRECIO_SERVICIO,
  MODALIDAD_SERVICIO,
  formatearModalidad,
  formatearDuracion,
  formatearDiasDisponibles,
  formatearHorarios
} from '../../../types/services';
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

export default function ServiceCard({ 
  service, 
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

  if (!service) return null;

  const images = service.imagenes || [];
  const hasMultipleImages = images.length > 1;

  // Verificar si está en favoritos al cargar
  useEffect(() => {
    if (user && service.id) {
      checkIfLiked();
    }
    setLikesCount(service.interacciones?.favoritos || 0);
  }, [user, service.id]);

  const checkIfLiked = async () => {
    if (!user) return;
    try {
      const favoritoRef = doc(db, 'favoritos_servicios', `${user.uid}_${service.id}`);
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
      const commentsRef = collection(db, 'comentarios_servicios');
      const q = query(
        commentsRef,
        where('servicioId', '==', service.id),
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
      const favoritoRef = doc(db, 'favoritos_servicios', `${user.uid}_${service.id}`);
      const serviceRef = doc(db, 'servicios', service.id);

      if (isLiked) {
        // Quitar de favoritos
        await deleteDoc(favoritoRef);
        await updateDoc(serviceRef, {
          'interacciones.favoritos': increment(-1)
        });
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Agregar a favoritos
        await setDoc(favoritoRef, {
          usuarioId: user.uid,
          servicioId: service.id,
          fechaCreacion: new Date()
        });
        await updateDoc(serviceRef, {
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
    const phone = service.contacto?.whatsapp || storeData?.phone || '';
    const message = service.contacto?.mensaje || 
      `Hola! Me interesa tu servicio: ${service.titulo}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePhoneContact = (e) => {
    e.stopPropagation();
    const phone = service.contacto?.telefono || storeData?.phone || '';
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailContact = (e) => {
    e.stopPropagation();
    const email = service.contacto?.email || storeData?.email || '';
    const subject = `Consulta sobre: ${service.titulo}`;
    const body = `Hola! Me interesa tu servicio: ${service.titulo}\n\n¿Podrías darme más información?`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const serviceUrl = `${window.location.origin}/tienda/${service.tiendaInfo?.slug || storeData?.storeSlug}/servicio/${service.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.titulo,
          text: service.descripcion,
          url: serviceUrl,
        });
        
        // Incrementar contador de compartidas
        const serviceRef = doc(db, 'servicios', service.id);
        await updateDoc(serviceRef, {
          'interacciones.compartidas': increment(1)
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback para escritorio
      navigator.clipboard.writeText(serviceUrl);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleViewStore = (e) => {
    e.stopPropagation();
    const storeUrl = `https://familymarket.vercel.app/tienda/${service.tiendaInfo?.slug || storeData?.storeSlug}`;
    window.open(storeUrl, '_blank');
  };

  const handleToggleComments = async (e) => {
    e.stopPropagation();
    if (!showComments) {
      await loadComments();
    }
    setShowComments(!showComments);
  };

  const getModalidadIcon = (modalidad) => {
    switch (modalidad) {
      case MODALIDAD_SERVICIO.PRESENCIAL:
        return <MapPin className="w-4 h-4" />;
      case MODALIDAD_SERVICIO.DOMICILIO:
        return <Home className="w-4 h-4" />;
      case MODALIDAD_SERVICIO.VIRTUAL:
        return <Monitor className="w-4 h-4" />;
      case MODALIDAD_SERVICIO.HIBRIDO:
        return <Globe className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
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
                alt={service.titulo}
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
              <Briefcase className="w-16 h-16 text-gray-400" />
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

          {/* Badge de modalidad */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white shadow-md">
              {getModalidadIcon(service.modalidad)}
              <span className="ml-1">{formatearModalidad(service.modalidad)}</span>
            </span>
          </div>

          {/* Badge de estado si NO está disponible */}
          {service.estado && service.estado !== 'disponible' && (
            <div className="absolute top-12 left-3">
              <span className={`px-3 py-1 text-white text-xs font-medium rounded-full shadow-md ${
                service.estado === 'agotado' ? 'bg-red-500' :
                service.estado === 'pausado' ? 'bg-yellow-500' :
                service.estado === 'inactivo' ? 'bg-gray-500' : 'bg-gray-500'
              }`}>
                {service.estado === 'agotado' ? 'Sin cupos' : 
                 service.estado.charAt(0).toUpperCase() + service.estado.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-5">
          {/* Título */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
            {service.titulo}
          </h3>
          
          {/* Descripción */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {service.descripcion}
          </p>

          {/* Precio */}
          <div className="mb-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatearPrecioServicio(service.precio, service.tipoPrecio, service.moneda)}
              </span>
            </div>
          </div>

          {/* Información del servicio */}
          <div className="space-y-2 mb-4">
            {/* Duración */}
            {service.duracion && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatearDuracion(service.duracion, service.duracionPersonalizada)}</span>
              </div>
            )}
            
            {/* Cupos disponibles */}
            {service.gestionCupos === 'limitado' && service.cuposDisponibles !== null && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 mr-2" />
                <span>{service.cuposDisponibles} cupos disponibles</span>
              </div>
            )}
            
            {/* Ubicación */}
            {service.ubicacion && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{service.ubicacion}</span>
              </div>
            )}
          </div>

          {/* Disponibilidad */}
          {(service.diasDisponibles?.length > 0 || service.horarios?.length > 0) && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Disponibilidad:</h4>
              
              {service.diasDisponibles?.length > 0 && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatearDiasDisponibles(service.diasDisponibles)}</span>
                </div>
              )}
              
              {service.horarios?.length > 0 && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatearHorarios(service.horarios, service.horarioPersonalizado)}</span>
                </div>
              )}
            </div>
          )}

          {/* Palabras clave */}
          {service.palabrasClave && service.palabrasClave.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {service.palabrasClave.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                  >
                    #{keyword}
                  </span>
                ))}
                {service.palabrasClave.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                    +{service.palabrasClave.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Valoraciones */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((starNumber) => {
                  const rating = service.valoraciones?.promedio || 0;
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
                {service.valoraciones?.total > 0 
                  ? `${(service.valoraciones.promedio || 0).toFixed(1)} (${service.valoraciones.total})`
                  : 'Sin valoraciones'
                }
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const serviceIdentifier = service.id;
                const storeSlug = service.tiendaInfo?.slug || storeData?.storeSlug;
                
                if (!serviceIdentifier || !storeSlug) {
                  alert('Error: Faltan datos del servicio o tienda');
                  return;
                }
                
                const url = `https://familymarket.vercel.app/tienda/${storeSlug}/servicio/${serviceIdentifier}`;
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
                  {service.tiendaInfo?.nombre || storeData?.businessName || storeData?.familyName}
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

          {/* Estadísticas de interacción */}
          {((service.interacciones?.vistas > 0 || service.totalVistas > 0) || 
            likesCount > 0 || 
            (service.interacciones?.comentarios > 0)) && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-4">
                {(service.interacciones?.vistas > 0 || service.totalVistas > 0) && (
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{service.interacciones?.vistas || service.totalVistas || 0}</span>
                  </span>
                )}
                {likesCount > 0 && (
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{likesCount}</span>
                  </span>
                )}
                {service.interacciones?.comentarios > 0 && (
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{service.interacciones?.comentarios}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sección de comentarios expandible */}
          {service.interacciones?.comentarios > 0 && (
            <div className="mb-4">
              <button
                onClick={handleToggleComments}
                className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ver comentarios ({service.interacciones.comentarios})
                  </span>
                </div>
                {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

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
                        const serviceIdentifier = service.id;
                        const storeSlug = service.tiendaInfo?.slug || storeData?.storeSlug;
                        const url = `https://familymarket.vercel.app/tienda/${storeSlug}/servicio/${serviceIdentifier}`;
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

          {/* Botones de contacto */}
          {showContactInfo && (
            <div className="space-y-2">
              {/* WhatsApp principal */}
              {(service.contacto?.whatsapp || storeData?.phone) && (
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
                {(service.contacto?.telefono || storeData?.phone) && (
                  <button
                    onClick={handlePhoneContact}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Llamar</span>
                  </button>
                )}
                
                {(service.contacto?.email || storeData?.email) && (
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