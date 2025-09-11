// src/app/dashboard/page.js - Con top navigation integrada
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import notificationService from '@/lib/services/notificationService';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation'; // NUEVO IMPORT
import { 
  ShoppingBag, 
  Wrench, 
  Briefcase, 
  Bell, 
  BellOff, 
  Store, 
  ExternalLink,
  Settings,
  User,
  ChevronRight,
  Plus,
  Eye,
  Mail,
  Home,
  Building2,
  Shield,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, userData, user, loading, refreshUserData } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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

  // FUNCIÓN PRINCIPAL DE NOTIFICACIONES - LIMPIA
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  const storeUrl = userData?.storeSlug ? `/tienda/${userData.storeSlug}` : null;
  const notificationsEnabled = userData?.notifications?.acceptNotifications && notificationPermission === 'granted';
  const StatusIcon = getStatusIcon(userData?.accountStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* TOP NAVIGATION PARA DASHBOARD */}
      <DashboardTopNavigation />

      {/* Header del Panel - Ahora más compacto */}
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
            
            {/* Quick Actions - Más compacto */}
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
                      {updatingNotifications ? 'Deshabilitando...' : 'Notificaciones ON'}
                    </span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">
                      {updatingNotifications ? 'Habilitando...' : 'Notificaciones OFF'}
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
                  className="flex items-center px-3 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <Store className="w-4 h-4 mr-1" />
                  <ExternalLink className="w-3 h-3 ml-1" />
                  <span className="hidden sm:inline ml-1">Ver tienda</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Resto del código igual */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Información del Usuario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Info principal del usuario */}
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {userData.businessName}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                  {userData.familyName}
                </p>
                <div className="flex items-center mt-1">
                  <StatusIcon className={`w-4 h-4 mr-1 ${getStatusColor(userData.accountStatus)}`} />
                  <span className={`text-sm font-medium ${getStatusColor(userData.accountStatus)}`}>
                    {getStatusText(userData.accountStatus)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* URL de la tienda */}
            {storeUrl && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 lg:text-right">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">URL de tu tienda:</p>
                <p className="text-xs sm:text-sm font-mono text-primary-600 dark:text-primary-400 break-all">
                  familymarket.vercel.app/tienda/{storeUrl}
                </p>
              </div>
            )}
          </div>

          {/* Datos adicionales del usuario en grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-900 dark:text-white truncate">{userData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Home className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Familia</p>
                <p className="text-sm text-gray-900 dark:text-white truncate">{userData.familyName}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rol</p>
                <p className="text-sm text-gray-900 dark:text-white">{userData.role || 'Usuario'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Registro</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones Principales - Con navegación por tabs, estas se ven más como cards de resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Productos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white truncate">
                    Productos
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Gestiona tu catálogo de productos, precios, imágenes y descripciones.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => router.push('/dashboard/productos')}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear
                </button>
                <button 
                  onClick={() => router.push('/dashboard/productos')}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver todos
                </button>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white truncate">
                    Servicios
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Ofrece servicios profesionales, consultas y trabajos especializados.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => router.push('/dashboard/servicios')}
                  className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear
                </button>
                <button 
                  onClick={() => router.push('/dashboard/servicios')}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver todos
                </button>
              </div>
            </div>
          </div>

          {/* Empleos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white truncate">
                    Empleos
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Publica ofertas de trabajo y encuentra candidatos para tu negocio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => router.push('/dashboard/empleos')}
                  className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear
                </button>
                <button 
                  onClick={() => router.push('/dashboard/empleos')}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver todos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - Responsivo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumen rápido
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Productos</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">0</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Servicios</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">0</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Empleos</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${getStatusColor(userData.accountStatus)}`} />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Estado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}