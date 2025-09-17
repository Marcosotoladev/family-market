// src/hooks/useAdminMessaging.js
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import notificationService from '@/lib/services/notificationService';

export function useAdminMessaging() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithNotifications: 0,
    totalNotificationsSent: 0,
    deliveryRate: 0
  });
  
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar estadísticas generales
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Total de usuarios
      const allUsersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = allUsersSnapshot.size;

      // Usuarios con tokens de notificación válidos
      const usersWithTokensQuery = query(
        collection(db, 'users'),
        where('notificationToken', '!=', null)
      );
      const usersWithTokensSnapshot = await getDocs(usersWithTokensQuery);
      
      let usersWithNotifications = 0;
      usersWithTokensSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.acceptNotifications && userData.notificationToken) {
          usersWithNotifications++;
        }
      });

      // Total de notificaciones enviadas
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      const totalNotificationsSent = notificationsSnapshot.size;

      // Calcular tasa de entrega promedio
      let totalDelivered = 0;
      let totalSent = 0;
      notificationsSnapshot.forEach((doc) => {
        const notification = doc.data();
        if (notification.status === 'sent') {
          totalDelivered += notification.deliveredCount || 0;
          totalSent += notification.targetCount || 0;
        }
      });

      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

      setStats({
        totalUsers,
        usersWithNotifications,
        totalNotificationsSent,
        deliveryRate
      });

    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios activos (con tokens válidos)
  const loadActiveUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersQuery = query(
        collection(db, 'users'),
        where('notificationToken', '!=', null),
        orderBy('notificationToken')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.acceptNotifications && userData.notificationToken) {
          users.push({
            id: doc.id,
            ...userData
          });
        }
      });
      
      setActiveUsers(users);
      
    } catch (err) {
      console.error('Error cargando usuarios activos:', err);
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Enviar notificación a usuarios específicos
  const sendNotificationToUsers = async (userIds, notificationData) => {
    try {
      const targetUsers = activeUsers.filter(user => userIds.includes(user.id));
      const tokens = targetUsers.map(user => user.notificationToken).filter(Boolean);

      if (tokens.length === 0) {
        throw new Error('No hay tokens válidos para enviar');
      }

      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          payload: {
            notification: {
              title: notificationData.title,
              body: notificationData.body,
              icon: '/icon-192.png'
            },
            data: {
              url: notificationData.url || '/dashboard',
              priority: notificationData.priority || 'normal'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const result = await response.json();
      return result;

    } catch (err) {
      console.error('Error enviando notificación:', err);
      throw err;
    }
  };

  // Probar notificación (enviar solo al admin actual)
  const testNotification = async (notificationData) => {
    try {
      // Verificar que el servicio de notificaciones esté inicializado
      if (!notificationService.isInitialized) {
        await notificationService.initialize();
      }

      // Mostrar notificación local para prueba
      await notificationService.showLocalNotification(
        notificationData.title,
        notificationData.body,
        {
          data: { url: notificationData.url || '/dashboard' },
          requireInteraction: true
        }
      );

      return { success: true, message: 'Notificación de prueba enviada' };
    } catch (err) {
      console.error('Error en notificación de prueba:', err);
      throw err;
    }
  };

  // Validar configuración de notificaciones
  const validateNotificationSetup = async () => {
    const issues = [];

    // Verificar VAPID key
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      issues.push('VAPID key no configurada');
    }

    // Verificar soporte del navegador
    const supported = await notificationService.isSupported();
    if (!supported) {
      issues.push('Navegador no compatible con notificaciones');
    }

    // Verificar permisos
    const permission = notificationService.getPermissionState();
    if (permission === 'denied') {
      issues.push('Permisos de notificación denegados');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  // Obtener usuarios por filtros
  const getFilteredUsers = (filters = {}) => {
    let filtered = activeUsers;

    if (filters.accountStatus) {
      filtered = filtered.filter(user => user.accountStatus === filters.accountStatus);
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.businessName) {
      filtered = filtered.filter(user => 
        user.businessName?.toLowerCase().includes(filters.businessName.toLowerCase())
      );
    }

    return filtered;
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadStats();
    loadActiveUsers();
  }, []);

  return {
    // Estados
    stats,
    activeUsers,
    loading,
    error,

    // Funciones
    loadStats,
    loadActiveUsers,
    sendNotificationToUsers,
    testNotification,
    validateNotificationSetup,
    getFilteredUsers,

    // Utilidades
    refreshData: () => {
      loadStats();
      loadActiveUsers();
    }
  };
}