// src/components/dashboard/CommentsSection.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  Eye,
  Edit3,
  Flag,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function CommentsSection() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'made'
  const [commentsReceived, setCommentsReceived] = useState([]);
  const [commentsMade, setCommentsMade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all' | '5' | '4' | '3' | '2' | '1'

  // Mock data - reemplazar con llamadas a Firebase
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCommentsReceived([
        {
          id: '1',
          fromUserId: 'user2',
          rating: 5,
          comment: 'Excelente servicio, muy recomendable. Los productos llegaron en perfecto estado.',
          createdAt: new Date('2025-09-10'),
          fromUserData: {
            name: 'María González',
            profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
            familyName: 'Familia González'
          }
        },
        {
          id: '2', 
          fromUserId: 'user3',
          rating: 4,
          comment: 'Buen servicio, aunque la entrega se demoró un poco más de lo esperado.',
          createdAt: new Date('2025-09-08'),
          fromUserData: {
            name: 'Carlos Méndez',
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            familyName: 'Familia Méndez'
          }
        },
        {
          id: '3',
          fromUserId: 'user4',
          rating: 3,
          comment: 'Regular, podría mejorar en algunos aspectos.',
          createdAt: new Date('2025-09-05'),
          fromUserData: {
            name: 'Ana López',
            profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            familyName: 'Familia López'
          }
        },
        {
          id: '4',
          fromUserId: 'user5',
          rating: 5,
          comment: 'Perfecto, exactamente lo que necesitaba.',
          createdAt: new Date('2025-09-03'),
          fromUserData: {
            name: 'Luis Fernández',
            profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            familyName: 'Familia Fernández'
          }
        }
      ]);

      setCommentsMade([
        {
          id: '5',
          toUserId: 'user6',
          rating: 5,
          comment: 'Muy buena atención y productos frescos. Volveré a comprar.',
          createdAt: new Date('2025-09-12'),
          toUserData: {
            name: 'Elena Morales',
            profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            familyName: 'Familia Morales'
          }
        },
        {
          id: '6',
          toUserId: 'user7',
          rating: 4,
          comment: 'Buen trabajo, aunque puede mejorar los tiempos.',
          createdAt: new Date('2025-09-09'),
          toUserData: {
            name: 'Roberto Silva',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            familyName: 'Familia Silva'
          }
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const getAverageRating = (comments) => {
    if (comments.length === 0) return 0;
    const sum = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return (sum / comments.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredComments = (comments) => {
    if (filter === 'all') return comments;
    return comments.filter(comment => comment.rating === parseInt(filter));
  };

  const currentComments = activeTab === 'received' ? commentsReceived : commentsMade;
  const displayComments = filteredComments(currentComments);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header con estadísticas */}
      <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gestión de Comentarios
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administra tus reseñas y feedback
              </p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-4 sm:flex sm:space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {getAverageRating(commentsReceived)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                Promedio
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {commentsReceived.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                Recibidos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y filtros */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'received'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4" />
                <span>Recibidos</span>
                <span className="bg-gray-200 dark:bg-gray-500 text-xs px-2 py-0.5 rounded-full">
                  {commentsReceived.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('made')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'made'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Realizados</span>
                <span className="bg-gray-200 dark:bg-gray-500 text-xs px-2 py-0.5 rounded-full">
                  {commentsMade.length}
                </span>
              </div>
            </button>
          </div>

          {/* Filtro por rating */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas las calificaciones</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="p-6">
        {displayComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay comentarios
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'received' 
                ? 'Aún no has recibido comentarios de otros usuarios.' 
                : 'Aún no has realizado comentarios a otros usuarios.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Grid de comentarios */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {displayComments.map((comment) => {
                const userData = activeTab === 'received' ? comment.fromUserData : comment.toUserData;
                return (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:shadow-md overflow-hidden"
                  >
                    {/* Header con avatar y estrellas */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={userData.profileImage}
                            alt={userData.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {userData.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {userData.familyName}
                          </p>
                        </div>
                      </div>
                      
                      {/* Estrellas */}
                      <div className="flex items-center justify-center space-x-1">
                        {renderStars(comment.rating)}
                      </div>
                    </div>
                    
                    {/* Comentario */}
                    <div className="p-3">
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-4 mb-3">
                        {comment.comment}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                            <Eye className="w-3 h-3" />
                          </button>
                          {activeTab === 'made' && (
                            <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1">
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                          {activeTab === 'received' && (
                            <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1">
                              <Flag className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}