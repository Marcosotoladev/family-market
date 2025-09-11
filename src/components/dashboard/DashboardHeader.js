// src/components/dashboard/DashboardHeader.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import notificationService from '@/lib/services/notificationService';
import { Bell, BellOff, Store, ExternalLink } from 'lucide-react';

export default function DashboardHeader() {
  const { userData, user, refreshUserData } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Listener para mensajes en primer plano
  useEffect(() => {
    const notificationsEnabled = userData?.notifications?.acceptNotifications && notificationPermission === 'granted';
    
    if (notificationsEnabled && typeof window !== 'undefined') {
      const setupListener = async () => {
        try {
          const payload = await notificationService.onMessageListener();
          
          if (payload && typeof payload === 'object') {
            notificationService.showLocalNotification(
              payload.notification?.title || 'Nueva notificación',
              payload.notification?.body || 'Tienes una nueva notificación',
              {
                tag: 'foreground-notification',
                data: payload.data || {}
              }
            );
          }
        } catch (error) {
          console.error('Error en listener de mensajes:', error);
        }
      };
      
      setupListener();
    }
  }, [userData?.notifications?.acceptNotifications, notificationPermission]);

  // Listener para clics en notificaciones desde service worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleMessage = (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          router.push(event.data.url);
        }
      };

      navigator.serviceWorker?.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker?.removeEventListener('message', handleMessage);
      };
    }
  }, [router]);

  // FUNCIÓN PRINCIPAL DE NOTIFICACIONES
  const toggleNotifications = async () => {
    if (!notificationService.isSupported()) {
      alert('Este navegador no soporta notificaciones push');
      return;
    }

    setUpdatingNotifications(true);
    
    try {
      const currentEnabled = userData?.notifications?.acceptNotifications;

      if (notificationPermission !== 'granted' || !currentEnabled) {
        // Habilitar notificaciones
        const token = await notificationService.requestPermission();
        
        if (token && user?.uid) {
          await updateDoc(doc(db, 'users', user.uid), {
            'notifications.acceptNotifications': true,
            notificationToken: token,
            notificationPermissionGrantedAt: new Date(),
            lastTokenUpdate: new Date()
          });
          
          setNotificationPermission('granted');
          await refreshUserData();
          
          // Notificación de confirmación
          await notificationService.showLocalNotification(
            'Notificaciones habilitadas',
            'Ahora recibirás notificaciones de tu tienda en Family Market',
            {
              tag: 'welcome-notification',
              requireInteraction: false
            }
          );
          
          // Configurar listener después de habilitar
          const setupListener = async () => {
            try {
              const payload = await notificationService.onMessageListener();
              if (payload && typeof payload === 'object') {
                notificationService.showLocalNotification(
                  payload.notification?.title || 'Nueva notificación',
                  payload.notification?.body || 'Tienes una nueva notificación'
                );
              }
            } catch (error) {
              console.error('Error configurando listener:', error);
            }
          };
          setupListener();
          
        } else {
          throw new Error('No se pudo obtener el token de notificación');
        }
        
      } else {
        // Deshabilitar notificaciones
        if (user?.uid) {
          await updateDoc(doc(db, 'users', user.uid), {
            'notifications.acceptNotifications': false,
            notificationToken: null,
            notificationDisabledAt: new Date()
          });
          
          setNotificationPermission('default');
          await refreshUserData();
        } else {
          throw new Error('Usuario no disponible para deshabilitar notificaciones');
        }
      }
      
    } catch (error) {
      console.error('Error con notificaciones:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const storeUrl = userData?.storeSlug ? userData.storeSlug : null;
  const notificationsEnabled = userData?.notifications?.acceptNotifications && notificationPermission === 'granted';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              Panel de Control
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              Bienvenido, {userData.firstName} {userData.lastName}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-row items-center space-x-3">
            {/* Botón de Notificaciones */}
            <button
              onClick={toggleNotifications}
              disabled={updatingNotifications}
              className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                notificationsEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              } ${updatingNotifications ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">
                    {updatingNotifications ? 'Deshabilitando...' : 'Deshabilitar notificaciones'}
                  </span>
                  <span className="sm:hidden">
                    {updatingNotifications ? 'Deshabilitando...' : 'Deshabilitar'}
                  </span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">
                    {updatingNotifications ? 'Habilitando...' : 'Habilitar notificaciones'}
                  </span>
                  <span className="sm:hidden">
                    {updatingNotifications ? 'Habilitando...' : 'Habilitar'}
                  </span>
                </>
              )}
            </button>

            {/* Enlace a la tienda */}
            {storeUrl && (
              <a
                href={`https://familymarket.vercel.app/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                <Store className="w-4 h-4 mr-1" />
                <span>Ver tienda</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}