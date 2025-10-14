// src/app/admin/mensajeria/page.js
'use client';

import { useState, useEffect } from 'react';
import { 
  Send, Users, MessageSquare, Bell, Target, Calendar,
  CheckCircle, XCircle, Clock, Filter, Eye, Trash2,
  AlertCircle, Search
} from 'lucide-react';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminMensajeria() {
  const { userData } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [messageData, setMessageData] = useState({
    title: '',
    body: '',
    url: '',
    targetAudience: 'all',
    specificUsers: [],
    priority: 'normal'
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithNotifications: 0,
    totalNotificationsSent: 0
  });

  useEffect(() => {
    loadActiveUsers();
    loadNotificationHistory();
  }, []);

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
      
      setStats({
        totalUsers: allUsersQuery.size,
        usersWithNotifications: usersData.length,
        totalNotificationsSent: 0
      });
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      const notificationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('¿Eliminar esta notificación del historial?')) return;
    
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      alert('Notificación eliminada');
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error al eliminar');
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('¿Eliminar TODO el historial? Esta acción no se puede deshacer.')) return;
    
    try {
      await Promise.all(
        notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)))
      );
      setNotifications([]);
      alert('Historial eliminado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar historial');
    }
  };

  const sendMassNotification = async () => {
    if (!messageData.title || !messageData.body) {
      alert('Completa el título y mensaje');
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
          targetUsers = users.filter(u => u.accountStatus === 'approved');
          break;
        case 'specific':
          targetUsers = users.filter(u => messageData.specificUsers.includes(u.id));
          break;
        default:
          targetUsers = users;
      }

      if (targetUsers.length === 0) {
        alert('No hay usuarios para enviar');
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

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: targetUsers.map(u => u.notificationToken),
          payload: {
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
          },
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

        alert(`Notificación enviada a ${result.successCount} usuarios`);
        
        setMessageData({
          title: '',
          body: '',
          url: '',
          targetAudience: 'all',
          specificUsers: [],
          priority: 'normal'
        });
        
        loadNotificationHistory();
      } else {
        throw new Error('Error enviando notificación');
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'yellow', icon: Clock, label: 'Pendiente' },
      sent: { color: 'green', icon: CheckCircle, label: 'Enviado' },
      sending: { color: 'blue', icon: Clock, label: 'Enviando' },
      error: { color: 'red', icon: XCircle, label: 'Error' }
    };

    const { color, icon: Icon, label } = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-200 border border-${color}-200 dark:border-${color}-800`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        n.title?.toLowerCase().includes(search) ||
        n.body?.toLowerCase().includes(search) ||
        n.createdBy?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Centro de Mensajería
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Envía notificaciones masivas a tus usuarios
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Con Notif.</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.usersWithNotifications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enviadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alcance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers > 0 ? Math.round((stats.usersWithNotifications / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          Nueva Notificación
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={messageData.title}
              onChange={(e) => setMessageData({...messageData, title: e.target.value})}
              placeholder="Título de la notificación"
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{messageData.title.length}/50</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje *
            </label>
            <textarea
              value={messageData.body}
              onChange={(e) => setMessageData({...messageData, body: e.target.value})}
              placeholder="Contenido del mensaje"
              rows={3}
              maxLength={120}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{messageData.body.length}/120</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL (opcional)
              </label>
              <input
                type="text"
                value={messageData.url}
                onChange={(e) => setMessageData({...messageData, url: e.target.value})}
                placeholder="/dashboard"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audiencia ({
                  messageData.targetAudience === 'all' ? users.length :
                  messageData.targetAudience === 'approved' ? users.filter(u => u.accountStatus === 'approved').length :
                  messageData.specificUsers.length
                })
              </label>
              <select
                value={messageData.targetAudience}
                onChange={(e) => setMessageData({...messageData, targetAudience: e.target.value, specificUsers: []})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="approved">Solo aprobados</option>
                <option value="specific">Específicos</option>
              </select>
            </div>
          </div>

          {messageData.targetAudience === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuarios ({messageData.specificUsers.length})
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <input
                      type="checkbox"
                      checked={messageData.specificUsers.includes(user.id)}
                      onChange={(e) => {
                        setMessageData({
                          ...messageData,
                          specificUsers: e.target.checked
                            ? [...messageData.specificUsers, user.id]
                            : messageData.specificUsers.filter(id => id !== user.id)
                        });
                      }}
                      className="h-4 w-4 text-cyan-600 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={sendMassNotification}
            disabled={sendingMessage || !messageData.title || !messageData.body}
            className="w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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

      {/* Historial */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Historial
          </h3>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="flex-1 sm:flex-none text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 transition-colors text-sm flex items-center gap-2 justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2 justify-center ${
                showFilters
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex-1 sm:flex-none text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-3 py-2 rounded-lg border border-cyan-300 dark:border-cyan-700 transition-colors text-sm flex items-center gap-2 justify-center"
            >
              <Eye className="w-4 h-4" />
              {showHistory ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Todos los estados</option>
              <option value="sent">Enviados</option>
              <option value="sending">Enviando</option>
              <option value="error">Con error</option>
            </select>
          </div>
        )}

        {showHistory && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Mensaje</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Audiencia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Resultados</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{notification.body}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {notification.targetCount} usuarios
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(notification.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(notification.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-green-600 dark:text-green-400">✓ {notification.deliveredCount || 0}</div>
                      <div className="text-red-600 dark:text-red-400">✗ {notification.failedCount || 0}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No hay notificaciones</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}