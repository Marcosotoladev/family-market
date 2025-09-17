// src/components/dashboard/DashboardHeader.js - Versión integrada con pestañas admin
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import notificationService from '@/lib/services/notificationService';
import { Bell, BellOff, Store, ExternalLink, Shield, Home } from 'lucide-react';

export default function DashboardHeader() {
  const { userData, user, refreshUserData } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const router = useRouter();

  // Verificar si es admin
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Listener para mensajes en primer plano
  useEffect(() => {
    const notificationsEnabled = userData?.notifications?.acceptNotifications && notificationPermission === 'granted';
    
    if (notificationsEnabled && typeof window !== 'undefined') {
      let unsubscribe = null;
      
      const setupListener = async () => {
        try {
          // Verificar e inicializar el servicio si es necesario
          if (!notificationService.isInitialized) {
            const initialized = await notificationService.initialize();
            if (!initialized) {
              console.warn('No se pudo inicializar el servicio de notificaciones');
              return;
            }
          }

          // Configurar el listener y guardar la función de limpieza
          unsubscribe = notificationService.setupMessageListener((payload) => {
            console.log('Mensaje recibido en primer plano desde DashboardHeader:', payload);
          });
          
        } catch (error) {
          console.error('Error configurando listener de mensajes:', error);
        }
      };
      
      setupListener();

      // Cleanup function
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
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
    if (!(await notificationService.isSupported())) {
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
          notificationService.setupMessageListener((payload) => {
            console.log('Nuevo mensaje recibido:', payload);
          });
          
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

  // Obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Configuración del header según el rol
  const getHeaderConfig = () => {
    if (isAdmin) {
      return {
        title: 'Panel de Control',
        subtitle: 'Administración de Family Market',
        icon: Shield,
        gradient: 'from-purple-600 to-blue-600',
        bgColor: 'bg-gradient-to-r from-purple-600 to-blue-600'
      };
    }
    return {
      title: 'Dashboard',
      subtitle: 'Tu espacio personal en Family Market',
      icon: Home,
      gradient: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-gradient-to-r from-blue-600 to-indigo-600'
    };
  };

  const { title, subtitle, icon: HeaderIcon, bgColor } = getHeaderConfig();
  const storeUrl = userData?.storeSlug ? userData.storeSlug : null;
  const notificationsEnabled = userData?.notifications?.acceptNotifications && notificationPermission === 'granted';

  return (
    <div className={`${bgColor} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          
          {/* Información principal */}
          <div className="flex items-center space-x-4">
            {/* Icono del header */}
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <HeaderIcon className="h-8 w-8 text-white" />
            </div>
            
            <div>
              {/* Saludo personalizado */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {getGreeting()}, {userData?.firstName || user?.displayName || 'Usuario'}
              </h1>
              
              {/* Título y subtítulo */}
              <div className="mt-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white/90">
                  {title}
                </h2>
                <p className="text-white/70 text-sm">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            
            {/* Badge de admin si corresponde */}
            {isAdmin && (
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="text-white text-sm font-medium">Administrador</span>
                </div>
              </div>
            )}

            {/* Botón de la tienda (solo para usuarios normales) */}
            {!isAdmin && storeUrl && (
              <a
                href={`/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200 rounded-lg px-4 py-2 border border-white/30 flex items-center space-x-2"
              >
                <Store className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Ver mi tienda</span>
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            )}

            {/* Botón de Notificaciones */}
            <button
              onClick={toggleNotifications}
              disabled={updatingNotifications}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border ${
                notificationsEnabled
                  ? 'bg-green-500/20 text-white border-green-400/30 hover:bg-green-500/30'
                  : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
              } ${updatingNotifications ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} backdrop-blur-sm`}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  <span>
                    {updatingNotifications ? 'Deshabilitando...' : 'Notificaciones ON'}
                  </span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  <span>
                    {updatingNotifications ? 'Habilitando...' : 'Habilitar notificaciones'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Información adicional para admins */}
        {isAdmin && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h3 className="text-white font-medium">Modo Administración Activo</h3>
                <p className="text-white/70 text-sm">
                  Tienes acceso completo a todas las funciones administrativas de la plataforma.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <span>Conectado como:</span>
                <span className="font-medium bg-white/10 px-2 py-1 rounded">
                  {userData?.email}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}