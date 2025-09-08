// src/components/ui/NotificationManager.js - Versión final
'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '../../lib/hooks/useNotifications';

export default function NotificationManager() {
  const { 
    token, 
    permission, 
    isSupported, 
    isLoading, 
    requestPermission, 
    showNotification 
  } = useNotifications();
  
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Verificar si ya fue dismissed en esta sesión
    const dismissed = sessionStorage.getItem('notification-prompt-dismissed');
    if (dismissed) return;

    // Mostrar prompt para habilitar notificaciones después de un tiempo
    if (isSupported && permission === 'default' && !isLoading) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 8000); // 8 segundos para que el usuario explore un poco

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, isLoading]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPrompt(false);
      sessionStorage.setItem('notification-prompt-dismissed', 'true');
      
      // Mostrar notificación de bienvenida
      setTimeout(() => {
        showNotification(
          '¡Notificaciones habilitadas! 🎉',
          'Ahora recibirás ofertas y novedades de Family Market',
          {
            tag: 'welcome-notification'
          }
        );
      }, 1000);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // No mostrar si no cumple las condiciones
  if (!isSupported || permission !== 'default' || !showPrompt || isLoading) {
    return null;
  }

  return (
    <div 
      className="notification-prompt"
      style={{ 
        transform: showPrompt ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s ease-out',
        opacity: showPrompt ? 1 : 0
      }}
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg">
              🔔
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              ¿Recibir notificaciones de Family Market?
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Ofertas exclusivas, nuevos productos y promociones especiales
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </span>
              ) : (
                '✓ Permitir'
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs font-medium rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors duration-200"
            >
              Ahora no
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}