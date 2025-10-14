// src/app/admin/comentarios/page.js
'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, Filter, Trash2, ExternalLink,
  List, Grid, Calendar, User, Star, Package, Wrench, 
  Briefcase, Eye
} from 'lucide-react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  doc,
  getDoc,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const ITEMS_PER_PAGE = 50;

export default function AdminComentarios() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'product', 'service', 'job'
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    loadAllComments();
  }, []);

  const loadAllComments = async () => {
    setLoading(true);
    try {
      const allComments = [];

      // Cargar comentarios de productos
      const productComments = await loadCommentsByType('comentarios', 'product', 'productoId');
      allComments.push(...productComments);

      // Cargar comentarios de servicios
      const serviceComments = await loadCommentsByType('comentarios_servicios', 'service', 'servicioId');
      allComments.push(...serviceComments);

      // Cargar comentarios de empleos
      const jobComments = await loadCommentsByType('comentarios_empleos', 'job', 'empleoId');
      allComments.push(...jobComments);

      // Ordenar por fecha más reciente
      allComments.sort((a, b) => b.fechaCreacion - a.fechaCreacion);
      
      setComments(allComments);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentsByType = async (collectionName, type, itemIdField) => {
    const commentsData = [];
    
    try {
      const commentsRef = collection(db, collectionName);
      const q = query(
        commentsRef,
        orderBy('fechaCreacion', 'desc'),
        limit(ITEMS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);

      for (const commentDoc of snapshot.docs) {
        const commentData = commentDoc.data();
        const itemId = commentData[itemIdField];
        
        // Obtener datos del item y usuario
        const itemData = await getItemData(type, itemId);
        const userData = await getUserData(commentData.usuarioId);

        // Solo agregar si el item existe
        if (itemData) {
          commentsData.push({
            id: commentDoc.id,
            type,
            collectionName,
            ...commentData,
            fechaCreacion: commentData.fechaCreacion?.toDate() || new Date(),
            itemData,
            userData
          });
        }
      }
    } catch (error) {
      console.error(`Error cargando comentarios de ${collectionName}:`, error);
    }

    return commentsData;
  };

  const getItemData = async (type, itemId) => {
    try {
      let collectionName;
      switch (type) {
        case 'product': collectionName = 'productos'; break;
        case 'service': collectionName = 'servicios'; break;
        case 'job': collectionName = 'empleos'; break;
        default: return null;
      }

      const itemRef = doc(db, collectionName, itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (itemSnap.exists()) {
        const data = itemSnap.data();
        return {
          id: itemId,
          title: data.titulo || data.nombre || 'Sin título',
          image: data.imagen || data.imagenes?.[0] || data.foto || null,
          ownerName: data.tiendaInfo?.nombre || 'N/A'
        };
      }
    } catch (error) {
      console.error('Error obteniendo item:', error);
    }
    
    return null;
  };

  const getUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userId,
          name: data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`
            : data.firstName || data.businessName || 'Usuario',
          avatar: data.profileImage || data.storeLogo || null,
          email: data.email || ''
        };
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
    }
    
    return {
      id: userId,
      name: 'Usuario desconocido',
      avatar: null,
      email: ''
    };
  };

  const handleDeleteComment = async (comment) => {
    if (!confirm('¿Estás seguro de eliminar este comentario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, comment.collectionName, comment.id));
      setComments(prev => prev.filter(c => c.id !== comment.id));
      alert('Comentario eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      alert('Error al eliminar el comentario');
    }
  };

  const filteredComments = comments.filter(comment => {
    // Filtro por tipo
    if (filterType !== 'all' && comment.type !== filterType) {
      return false;
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        comment.contenido?.toLowerCase().includes(searchLower) ||
        comment.itemData?.title?.toLowerCase().includes(searchLower) ||
        comment.userData?.name?.toLowerCase().includes(searchLower) ||
        comment.userData?.email?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'product': return Package;
      case 'service': return Wrench;
      case 'job': return Briefcase;
      default: return MessageSquare;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'product': return 'Producto';
      case 'service': return 'Servicio';
      case 'job': return 'Empleo';
      default: return 'Item';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'product': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'service': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'job': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Comentarios
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Administra todos los comentarios de la plataforma
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por contenido, usuario o publicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de publicación
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="product">Productos</option>
                <option value="service">Servicios</option>
                <option value="job">Empleos</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredComments.length} de {comments.length} comentarios
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando comentarios...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No se encontraron comentarios</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredComments.map((comment) => (
                <CommentCard 
                  key={comment.id}
                  comment={comment}
                  onDelete={handleDeleteComment}
                  formatDate={formatDate}
                  getTypeIcon={getTypeIcon}
                  getTypeLabel={getTypeLabel}
                  getTypeColor={getTypeColor}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Comentario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Publicación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Propietario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Rating
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredComments.map((comment) => (
                      <CommentRow 
                        key={comment.id}
                        comment={comment}
                        onDelete={handleDeleteComment}
                        formatDate={formatDate}
                        getTypeIcon={getTypeIcon}
                        getTypeLabel={getTypeLabel}
                        getTypeColor={getTypeColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CommentCard({ comment, onDelete, formatDate, getTypeIcon, getTypeLabel, getTypeColor }) {
  const TypeIcon = getTypeIcon(comment.type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {comment.itemData?.image && (
        <div className="relative h-40">
          <img
            src={comment.itemData.image}
            alt={comment.itemData.title}
            className="w-full h-full object-cover"
          />
          <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(comment.type)}`}>
            <TypeIcon className="w-3 h-3" />
            {getTypeLabel(comment.type)}
          </span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {comment.itemData?.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
          <User className="w-3 h-3" />
          <span className="truncate">{comment.userData?.name}</span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
          {comment.contenido}
        </p>

        {comment.puntuacion && (
          <div className="flex items-center mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= comment.puntuacion
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(comment.fechaCreacion)}</span>
          </div>
          
          <button
            onClick={() => onDelete(comment)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
            title="Eliminar comentario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ comment, onDelete, formatDate, getTypeIcon, getTypeLabel, getTypeColor }) {
  const TypeIcon = getTypeIcon(comment.type);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            {comment.userData?.avatar ? (
              <img 
                src={comment.userData.avatar} 
                alt={comment.userData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {comment.userData?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {comment.userData?.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md line-clamp-2">
          {comment.contenido}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
          {comment.itemData?.title}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(comment.type)}`}>
          <TypeIcon className="w-3 h-3" />
          {getTypeLabel(comment.type)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {comment.itemData?.ownerName}
      </td>
      <td className="px-4 py-3">
        {comment.puntuacion ? (
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= comment.puntuacion
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin rating</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(comment.fechaCreacion)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(comment)}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </td>
    </tr>
  );
}