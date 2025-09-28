// src/components/tienda/servicios/ServiceRatingsAndComments.js
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  getDoc,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Star, 
  MessageSquare, 
  Send, 
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';

export default function ServiceRatingsAndComments({ service, onRatingUpdate }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    loadComments();
    if (user) {
      checkUserRating();
    }
  }, [service.id, user]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsRef = collection(db, 'comentarios_servicios');
      const q = query(
        commentsRef,
        where('servicioId', '==', service.id),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Obtener comentarios con información de usuario
      const commentsData = await Promise.all(
        querySnapshot.docs.map(async (commentDoc) => {
          const commentData = { id: commentDoc.id, ...commentDoc.data() };
          
          // Buscar información del usuario que comentó
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.usuarioId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              commentData.usuario = {
                nombre: userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.firstName || userData.familyName || userData.businessName || 'Usuario',
                email: userData.email,
                avatar: userData.profileImage || userData.storeLogo || null
              };
            } else {
              commentData.usuario = {
                nombre: 'Usuario no encontrado',
                email: '',
                avatar: null
              };
            }
          } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            commentData.usuario = {
              nombre: 'Error al cargar usuario',
              email: '',
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

  const checkUserRating = async () => {
    try {
      const ratingsRef = collection(db, 'valoraciones_servicios');
      const q = query(
        ratingsRef,
        where('servicioId', '==', service.id),
        where('usuarioId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userRatingDoc = querySnapshot.docs[0];
        setUserRating(userRatingDoc.data().puntuacion);
      }
    } catch (error) {
      console.error('Error verificando valoración del usuario:', error);
    }
  };

  const submitRating = async (rating) => {
    if (!user) {
      alert('Debes iniciar sesión para valorar servicios');
      return;
    }

    try {
      setLoading(true);
      
      // Verificar si el usuario ya valoró este servicio
      const ratingsRef = collection(db, 'valoraciones_servicios');
      const existingRatingQuery = query(
        ratingsRef,
        where('servicioId', '==', service.id),
        where('usuarioId', '==', user.uid)
      );
      
      const existingRatingSnapshot = await getDocs(existingRatingQuery);
      
      if (!existingRatingSnapshot.empty) {
        // Actualizar valoración existente
        const existingRatingDoc = existingRatingSnapshot.docs[0];
        await updateDoc(doc(db, 'valoraciones_servicios', existingRatingDoc.id), {
          puntuacion: rating,
          fechaActualizacion: serverTimestamp()
        });
      } else {
        // Agregar nueva valoración
        await addDoc(collection(db, 'valoraciones_servicios'), {
          servicioId: service.id,
          usuarioId: user.uid,
          puntuacion: rating,
          fechaCreacion: serverTimestamp()
        });
      }

      // Recalcular promedio y total de valoraciones
      await recalculateServiceRatings(service.id);

      setUserRating(rating);
      setNewRating(rating);
      
      // Notificar al componente padre para actualizar
      if (onRatingUpdate) {
        onRatingUpdate();
      }
      
    } catch (error) {
      console.error('Error enviando valoración:', error);
      alert('Error al enviar la valoración');
    } finally {
      setLoading(false);
    }
  };

  // Función para recalcular las valoraciones del servicio
  const recalculateServiceRatings = async (serviceId) => {
    try {
      // Obtener todas las valoraciones del servicio
      const ratingsRef = collection(db, 'valoraciones_servicios');
      const ratingsQuery = query(ratingsRef, where('servicioId', '==', serviceId));
      const ratingsSnapshot = await getDocs(ratingsQuery);
      
      const ratings = ratingsSnapshot.docs.map(doc => doc.data().puntuacion);
      
      if (ratings.length === 0) {
        // Si no hay valoraciones, resetear a 0
        const serviceRef = doc(db, 'servicios', serviceId);
        await updateDoc(serviceRef, {
          'valoraciones.promedio': 0,
          'valoraciones.total': 0,
          'valoraciones.distribucion': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
        return;
      }
      
      // Calcular promedio
      const promedio = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      // Calcular distribución
      const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratings.forEach(rating => {
        if (distribucion.hasOwnProperty(rating)) {
          distribucion[rating]++;
        }
      });
      
      // Actualizar el servicio
      const serviceRef = doc(db, 'servicios', serviceId);
      await updateDoc(serviceRef, {
        'valoraciones.promedio': promedio,
        'valoraciones.total': ratings.length,
        'valoraciones.distribucion': distribucion
      });
      
      console.log('Valoraciones actualizadas:', {
        promedio,
        total: ratings.length,
        distribucion
      });
      
    } catch (error) {
      console.error('Error recalculando valoraciones:', error);
    }
  };

  const submitComment = async () => {
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      alert('Escribe un comentario');
      return;
    }

    try {
      setLoading(true);
      
      const commentData = {
        servicioId: service.id,
        usuarioId: user.uid,
        contenido: newComment.trim(),
        valoracion: newRating,
        fechaCreacion: serverTimestamp(),
        usuario: {
          nombre: user.displayName || user.email.split('@')[0],
          email: user.email
        }
      };

      await addDoc(collection(db, 'comentarios_servicios'), commentData);

      // Si incluye valoración, también agregar a valoraciones
      if (newRating > 0) {
        await submitRating(newRating);
      }

      // Actualizar contador de comentarios en el servicio
      const serviceRef = doc(db, 'servicios', service.id);
      await updateDoc(serviceRef, {
        'interacciones.comentarios': increment(1)
      });

      // Limpiar formulario
      setNewComment('');
      setNewRating(0);
      
      // Recargar comentarios
      loadComments();
      
    } catch (error) {
      console.error('Error enviando comentario:', error);
      alert('Error al enviar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onStarClick && onStarClick(index + 1)}
      />
    ));
  };

  const averageRating = service.valoraciones?.promedio || 0;
  const totalRatings = service.valoraciones?.total || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header con resumen de valoraciones */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
          Valoraciones y Comentarios del Servicio
        </h3>
        {totalRatings > 0 ? (
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({totalRatings} {totalRatings === 1 ? 'valoración' : 'valoraciones'})
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sé el primero en valorar este servicio
          </p>
        )}
      </div>

      {/* Formulario de nueva valoración/comentario */}
      {user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            {userRating > 0 ? 'Actualiza tu valoración' : 'Deja tu valoración del servicio'}
          </h4>
          
          {/* Estrellas interactivas */}
          <div className="flex items-center space-x-1 mb-4">
            {renderStars(newRating || userRating, true, setNewRating)}
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              {newRating > 0 ? `${newRating} estrellas` : 'Haz clic en las estrellas'}
            </span>
          </div>

          {/* Campo de comentario */}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu experiencia con este servicio..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={submitComment}
              disabled={loading || (!newComment.trim() && newRating === 0)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Enviando...' : 'Enviar'}</span>
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-300 text-center">
            <a href="/login" className="font-medium hover:underline">
              Inicia sesión
            </a> para valorar y comentar este servicio
          </p>
        </div>
      )}

      {/* Sección de comentarios */}
      {comments.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Comentarios ({comments.length})
            </h4>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>{expanded ? 'Ocultar' : 'Ver'} comentarios</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Lista de comentarios */}
          {expanded && (
            <div className="space-y-4">
              {loadingComments ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 dark:text-gray-400">Cargando comentarios...</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {comment.usuario?.avatar ? (
                          <img
                            src={comment.usuario.avatar}
                            alt={comment.usuario.nombre}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {comment.usuario?.nombre ? comment.usuario.nombre.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {comment.usuario?.nombre || 'Usuario'}
                          </h5>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {comment.fechaCreacion?.toDate?.()?.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) || 'Fecha no disponible'}
                          </div>
                        </div>
                        
                        {comment.valoracion > 0 && (
                          <div className="flex items-center mb-2">
                            {renderStars(comment.valoracion)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {comment.valoracion} {comment.valoracion === 1 ? 'estrella' : 'estrellas'}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.contenido}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay comentarios */}
      {comments.length === 0 && !loadingComments && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay comentarios aún. ¡Sé el primero en comentar sobre este servicio!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}