// src/components/dashboard/MessagingManagementSection.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Bell, 
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Eye,
  Trash2,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

const MessagingManagementSection = () => {
  const { userData } = useAuth();
  
  // Estados principales
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Estados de UI
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [deletingNotification, setDeletingNotification] = useState(false);
  
  // Estado del formulario
  const [messageData, setMessageData] = useState({
    title: '',
    body: '',
    url: '',
    targetAudience: 'all',
    specificUsers: [],
    scheduleDate: '',
    priority: 'normal'
  });

  // Estado de estadísticas
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithNotifications: 0,
    totalNotificationsSent: 0,
    deliveryRate: 0
  });

  // Verificar si el usuario actual es admin
  const isAdmin = userData?.role === 'admin';

  // Cargar usuarios activos con tokens de notificación
  const loadActiveUsers = async () => {
    try {
      setLoading(true);
      
      const usersQuery = query(
        collection(db, 'users'),
        where('notificationToken', '!=', null),
        orderBy('notificationToken')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const usersData = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.acceptNotifications && userData.notificationToken) {
          usersData.push({
            id: doc.id,
            ...userData
          });
        }
      });
      
      setUsers(usersData);
      
      const allUsersQuery = await getDocs(collection(db, 'users'));
      const totalUsers = allUsersQuery.size;
      
      setStats(prev => ({
        ...prev,
        totalUsers,
        usersWithNotifications: usersData.length
      }));
      
    } catch (error) {
      console.error('Error cargando usuarios activos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial de notificaciones
  const loadNotificationHistory = async () => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      const notificationsList = [];
      
      querySnapshot.forEach((doc) => {
        notificationsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  // Eliminar notificación del historial
  const deleteNotification = async () => {
    if (!notificationToDelete) return;
    
    setDeletingNotification(true);
    
    try {
      await deleteDoc(doc(db, 'notifications', notificationToDelete.id));
      
      setNotifications(notifications.filter(n => n.id !== notificationToDelete.id));
      
      setShowDeleteModal(false);
      setNotificationToDelete(null);
      alert('Notificación eliminada del historial');
      
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      alert('Error eliminando la notificación');
    } finally {
      setDeletingNotification(false);
    }
  };

  // Eliminar múltiples notificaciones
  const deleteAllNotifications = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar TODO el historial de notificaciones? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setDeletingNotification(true);
    
    try {
      const deletePromises = notifications.map(notification => 
        deleteDoc(doc(db, 'notifications', notification.id))
      );
      
      await Promise.all(deletePromises);
      
      setNotifications([]);
      alert('Todo el historial ha sido eliminado');
      
    } catch (error) {
      console.error('Error eliminando historial:', error);
      alert('Error eliminando el historial');
    } finally {
      setDeletingNotification(false);
    }
  };

  // Enviar notificación masiva
  const sendMassNotification = async () => {
    if (!messageData.title || !messageData.body) {
      alert('Por favor completa el título y el mensaje');
      return;
    }

    setSendingMessage(true);
    
    try {
      let targetUsers = [];
      
      switch (messageData.targetAudience) {
        case 'all':
          targetUsers = users;
          break;
        case 'approved':
          targetUsers = users.filter(user => user.accountStatus === 'approved');
          break;
        case 'specific':
          targetUsers = users.filter(user => 
            messageData.specificUsers.includes(user.id)
          );
          break;
        default:
          targetUsers = users;
      }

      if (targetUsers.length === 0) {
        alert('No hay usuarios para enviar la notificación');
        setSendingMessage(false);
        return;
      }

      const notificationRecord = {
        title: messageData.title,
        body: messageData.body,
        url: messageData.url || '/dashboard',
        targetAudience: messageData.targetAudience,
        targetCount: targetUsers.length,
        priority: messageData.priority,
        status: 'sending',
        createdBy: userData.email,
        createdAt: serverTimestamp(),
        deliveredCount: 0,
        failedCount: 0
      };

      const notificationDoc = await addDoc(collection(db, 'notifications'), notificationRecord);

      const fcmPayload = {
        notification: {
          title: messageData.title,
          body: messageData.body,
          icon: '/icon-192.png'
        },
        data: {
          url: messageData.url || '/dashboard',
          notificationId: notificationDoc.id,
          priority: messageData.priority
        }
      };

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens: targetUsers.map(user => user.notificationToken),
          payload: fcmPayload,
          notificationId: notificationDoc.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        await updateDoc(doc(db, 'notifications', notificationDoc.id), {
          status: 'sent',
          deliveredCount: result.successCount || 0,
          failedCount: result.failureCount || 0,
          sentAt: serverTimestamp()
        });

        alert(`Notificación enviada exitosamente a ${result.successCount} usuarios`);
        
        setMessageData({
          title: '',
          body: '',
          url: '',
          targetAudience: 'all',
          specificUsers: [],
          scheduleDate: '',
          priority: 'normal'
        });
        
        loadNotificationHistory();
        
      } else {
        throw new Error('Error enviando notificación');
      }

    } catch (error) {
      console.error('Error enviando notificación masiva:', error);
      alert('Error enviando la notificación: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (isAdmin) {
      loadActiveUsers();
      loadNotificationHistory();
    }
  }, [isAdmin]);

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      sent: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      sending: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      sent: <CheckCircle className="w-3 h-3" />,
      sending: <Clock className="w-3 h-3" />,
      error: <XCircle className="w-3 h-3" />
    };

    const labels = {
      pending: 'Pendiente',
      sent: 'Enviado',
      sending: 'Enviando',
      error: 'Error'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {labels[status] || 'Desconocido'}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <XCircle className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Acceso Denegado</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header con gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Centro de Mensajería</h1>
              <p className="text-white/90 mt-1">
                Envía notificaciones masivas a tus usuarios
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-400">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Activos</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-400">{stats.usersWithNotifications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Enviadas</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-400">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Alcance</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-400">
                  {stats.totalUsers > 0 ? Math.round((stats.usersWithNotifications / stats.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de envío */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Nueva Notificación
          </h3>
          
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={messageData.title}
                onChange={(e) => setMessageData({...messageData, title: e.target.value})}
                placeholder="Ej: Nueva promoción disponible"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{messageData.title.length}/50 caracteres</p>
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensaje
              </label>
              <textarea
                value={messageData.body}
                onChange={(e) => setMessageData({...messageData, body: e.target.value})}
                placeholder="Escribe el contenido de tu mensaje aquí..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                maxLength={120}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{messageData.body.length}/120 caracteres</p>
            </div>

            {/* URL y Audiencia en dos columnas en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* URL de destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de Destino (opcional)
                </label>
                <input
                  type="text"
                  value={messageData.url}
                  onChange={(e) => setMessageData({...messageData, url: e.target.value})}
                  placeholder="/dashboard, /tienda/promociones, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Audiencia objetivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Audiencia
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    ({
                      messageData.targetAudience === 'all' ? users.length :
                      messageData.targetAudience === 'approved' ? users.filter(u => u.accountStatus === 'approved').length :
                      messageData.specificUsers.length
                    } usuarios)
                  </span>
                </label>
                <select
                  value={messageData.targetAudience}
                  onChange={(e) => setMessageData({...messageData, targetAudience: e.target.value, specificUsers: []})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">Todos los usuarios activos</option>
                  <option value="approved">Solo usuarios aprobados</option>
                  <option value="specific">Usuarios específicos</option>
                </select>
              </div>
            </div>

            {/* Selector de usuarios específicos */}
            {messageData.targetAudience === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar Usuarios ({messageData.specificUsers.length} seleccionados)
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {users.length === 0 ? (
                    <div className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No hay usuarios disponibles
                    </div>
                  ) : (
                    users.map((user) => (
                      <label key={user.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors">
                        <input
                          type="checkbox"
                          checked={messageData.specificUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMessageData({
                                ...messageData,
                                specificUsers: [...messageData.specificUsers, user.id]
                              });
                            } else {
                              setMessageData({
                                ...messageData,
                                specificUsers: messageData.specificUsers.filter(id => id !== user.id)
                              });
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {user.businessName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.businessName}
                              </span>
                            )}
                            <span className={`text-xs ${user.accountStatus === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                              {user.accountStatus === 'approved' ? '✓ Aprobado' : '⏳ Pendiente'}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                
                {/* Botones de selección rápida */}
                {users.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setMessageData({
                        ...messageData,
                        specificUsers: users.map(u => u.id)
                      })}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageData({
                        ...messageData,
                        specificUsers: []
                      })}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Ninguno
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageData({
                        ...messageData,
                        specificUsers: users.filter(u => u.accountStatus === 'approved').map(u => u.id)
                      })}
                      className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 px-2 py-1 border border-green-300 dark:border-green-700 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Solo aprobados
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Prioridad */}
            <div className="md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <select
                value={messageData.priority}
                onChange={(e) => setMessageData({...messageData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={sendMassNotification}
              disabled={sendingMessage || !messageData.title || !messageData.body}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              {sendingMessage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Notificación
                </>
              )}
            </button>
          </div>
        </div>

        {/* Historial de notificaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Historial
            </h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  disabled={deletingNotification}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-2 px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{deletingNotification ? 'Eliminando...' : 'Limpiar'}</span>
                </button>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showHistory ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {showHistory && (
            <>
              {/* Indicador de scroll en móvil */}
              {notifications.length > 0 && (
                <div className="md:hidden bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2 border border-blue-100 dark:border-blue-800 rounded-lg mb-4">
                  <span>← Desliza para ver más →</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Mensaje
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Audiencia
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Enviado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Resultados
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {notification.body}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {notification.targetAudience === 'all' ? 'Todos' : 
                           notification.targetAudience === 'approved' ? 'Aprobados' : 'Específicos'}
                          <br />
                          <span className="text-gray-500 dark:text-gray-400">({notification.targetCount} usuarios)</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(notification.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(notification.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="text-green-600 dark:text-green-400">✓ {notification.deliveredCount || 0}</div>
                          <div className="text-red-600 dark:text-red-400">✗ {notification.failedCount || 0}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              setNotificationToDelete(notification);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded transition-colors"
                            title="Eliminar notificación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Sin notificaciones
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Las notificaciones que envíes aparecerán aquí
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar la notificación <strong className="text-gray-900 dark:text-white">"{notificationToDelete?.title}"</strong> del historial? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setNotificationToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={deleteNotification}
                disabled={deletingNotification}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deletingNotification ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingManagementSection;