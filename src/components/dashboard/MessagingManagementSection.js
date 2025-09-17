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
  Trash2
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sent: 'bg-green-100 text-green-800 border-green-200',
      sending: 'bg-blue-100 text-blue-800 border-blue-200',
      error: 'bg-red-100 text-red-800 border-red-200'
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
      <div className="text-center py-8">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Acceso Denegado</h3>
        <p className="mt-2 text-sm text-gray-600">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Centro de Mensajería Masiva
        </h2>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Con Notificaciones</p>
                <p className="text-2xl font-bold text-green-900">{stats.usersWithNotifications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Enviadas</p>
                <p className="text-2xl font-bold text-purple-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Alcance</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.totalUsers > 0 ? Math.round((stats.usersWithNotifications / stats.totalUsers) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de envío */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Enviar Nueva Notificación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Notificación
              </label>
              <input
                type="text"
                value={messageData.title}
                onChange={(e) => setMessageData({...messageData, title: e.target.value})}
                placeholder="Ej: Nueva promoción disponible"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{messageData.title.length}/50 caracteres</p>
            </div>

            {/* Mensaje */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <textarea
                value={messageData.body}
                onChange={(e) => setMessageData({...messageData, body: e.target.value})}
                placeholder="Escribe el contenido de tu mensaje aquí..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={120}
              />
              <p className="text-xs text-gray-500 mt-1">{messageData.body.length}/120 caracteres</p>
            </div>

            {/* URL de destino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Destino (opcional)
              </label>
              <input
                type="text"
                value={messageData.url}
                onChange={(e) => setMessageData({...messageData, url: e.target.value})}
                placeholder="/dashboard, /tienda/promociones, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Audiencia objetivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audiencia Objetivo
              </label>
              <select
                value={messageData.targetAudience}
                onChange={(e) => setMessageData({...messageData, targetAudience: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los usuarios activos</option>
                <option value="approved">Solo usuarios aprobados</option>
                <option value="specific">Usuarios específicos</option>
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={messageData.priority}
                onChange={(e) => setMessageData({...messageData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      </div>

      {/* Historial de notificaciones */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Historial de Notificaciones
          </h3>
          <div className="flex gap-3">
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                disabled={deletingNotification}
                className="text-red-600 hover:text-red-800 flex items-center gap-2 px-3 py-1 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deletingNotification ? 'Eliminando...' : 'Limpiar todo'}
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showHistory ? 'Ocultar' : 'Ver Historial'}
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensaje
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audiencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultados
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {notification.body}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.targetAudience === 'all' ? 'Todos' : 
                       notification.targetAudience === 'approved' ? 'Aprobados' : 'Específicos'}
                      <br />
                      <span className="text-gray-500">({notification.targetCount} usuarios)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(notification.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-green-600">✓ {notification.deliveredCount || 0}</div>
                      <div className="text-red-600">✗ {notification.failedCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setNotificationToDelete(notification);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
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
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No hay notificaciones enviadas
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Las notificaciones que envíes aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la notificación <strong>"{notificationToDelete?.title}"</strong> del historial? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setNotificationToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={deleteNotification}
                disabled={deletingNotification}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
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