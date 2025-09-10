// src/lib/hooks/useNotifications.js
'use client';

import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

export function useNotifications() {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeNotifications = async () => {
      setIsLoading(true);
      
      // Verificar soporte
      const supported = notificationService.isSupported();
      setIsSupported(supported);
      
      if (!supported) {
        setIsLoading(false);
        return;
      }

      // Verificar permisos actuales
      if ('Notification' in window) {
        const currentPermission = Notification.permission;
        setPermission(currentPermission);
      }

      // Inicializar Firebase Messaging solo si hay permisos
      if (Notification.permission === 'granted') {
        const initialized = await notificationService.initialize();
        
        if (!initialized) {
          console.warn('No se pudo inicializar Firebase Messaging');
          setIsLoading(false);
          return;
        }

        // Obtener token existente
        try {
          const currentToken = await notificationService.getToken();
          setToken(currentToken);
        } catch (error) {
          console.warn('Error obteniendo token existente:', error);
        }

        // Escuchar mensajes en primer plano
        try {
          notificationService.onMessageListener().then((payload) => {
            console.log('Mensaje recibido:', payload);
            // Mostrar notificación local si la app está en primer plano
            notificationService.showLocalNotification(
              payload.notification?.title || 'Nueva notificación',
              payload.notification?.body || '',
              {
                data: payload.data
              }
            );
          });
        } catch (error) {
          console.warn('Error configurando listener de mensajes:', error);
        }
      }

      setIsLoading(false);
    };

    initializeNotifications();
  }, []);

  // Solicitar permisos
  const requestPermission = async () => {
    if (!isSupported) {
      alert('Tu navegador no soporta notificaciones push');
      return false;
    }

    setIsLoading(true);
    const newToken = await notificationService.requestPermission();
    
    if (newToken) {
      setToken(newToken);
      setPermission('granted');
      setIsLoading(false);
      return true;
    } else {
      setPermission('denied');
      setIsLoading(false);
      return false;
    }
  };

  // Mostrar notificación local
  const showNotification = async (title, body, options = {}) => {
    if (permission !== 'granted') {
      console.warn('Permisos de notificación no concedidos');
      return null;
    }

    return await notificationService.showLocalNotification(title, body, options);
  };

  return {
    token,
    permission,
    isSupported,
    isLoading,
    requestPermission,
    showNotification
  };
}