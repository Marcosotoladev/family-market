// src/components/ui/NotificationManager.js - Versión limpia sin prompt automático
'use client';

import { useEffect } from 'react';
import { useNotifications } from '../../lib/hooks/useNotifications';

export default function NotificationManager() {
  const { 
    permission, 
    isSupported,
    showNotification 
  } = useNotifications();

  useEffect(() => {
    // Solo inicializar el servicio de notificaciones
    // Ya no se muestran prompts automáticos
    // Los permisos se manejan explícitamente desde la página de usuario
    
    if (permission === 'granted') {
      console.log('Notificaciones ya están habilitadas');
    }
  }, [permission]);

  // Este componente ahora solo maneja la inicialización del servicio
  // Ya no renderiza ningún UI de prompt automático
  // Todo el manejo de permisos se hace desde la página de usuario
  return null;
}