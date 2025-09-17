// src/app/dashboard/page.js - Dashboard completo con mensajería integrada
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserInfoCard from '@/components/dashboard/UserInfoCard';
import CommentsSection from '@/components/dashboard/CommentsSection';
import FavoritesSection from '@/components/dashboard/FavoritesSection';
import StoreInfoCard from '@/components/dashboard/StoreInfoCard';
import UserManagementSection from '@/components/dashboard/UserManagementSection';
import MessagingManagementSection from '@/components/dashboard/MessagingManagementSection';
// import CommentsManagementSection from '@/components/dashboard/CommentsManagementSection'; // Para el futuro
import { 
  Shield, 
  User, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Users,
  Home,
  Send
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar si el usuario es admin
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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

  // Pestañas del dashboard - siempre incluye la pestaña principal
  const tabs = [
    {
      id: 'dashboard',
      name: 'Mi Dashboard',
      icon: Home,
      description: 'Vista general de tu cuenta y tienda'
    }
  ];

  // Pestañas de administración - solo para admins
  const adminTabs = [
    {
      id: 'users',
      name: 'Usuarios',
      icon: Users,
      description: 'Gestión de usuarios registrados'
    },
    {
      id: 'messaging',
      name: 'Mensajería',
      icon: Send,
      description: 'Envío de notificaciones masivas'
    },
    {
      id: 'comments',
      name: 'Comentarios',
      icon: MessageSquare,
      description: 'Moderación de comentarios globales'
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: Settings,
      description: 'Configuración general de la plataforma'
    }
  ];

  // Si es admin, agregar las pestañas administrativas
  if (isAdmin) {
    tabs.push(...adminTabs);
  }

  // Función para renderizar el contenido de cada pestaña
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid gap-2">
            <UserInfoCard />
            <FavoritesSection />
            <CommentsSection />
            <StoreInfoCard />
          </div>
        );
      
      case 'users':
        return isAdmin ? (
          <div className="py-6">
            <UserManagementSection />
          </div>
        ) : null;
      
      case 'messaging':
        return isAdmin ? (
          <div className="py-6">
            <MessagingManagementSection />
          </div>
        ) : null;
      
      case 'comments':
        return isAdmin ? (
          <div className="py-6">
            {/* Placeholder para el futuro componente de gestión de comentarios */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gestión de Comentarios
                </h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: Moderación y gestión de todos los comentarios de la plataforma.
                </p>
                <div className="text-sm text-gray-500">
                  Esta funcionalidad estará disponible pronto.
                </div>
              </div>
            </div>
            {/* 
            Cuando esté listo, reemplazar con:
            <CommentsManagementSection />
            */}
          </div>
        ) : null;
      
      case 'settings':
        return isAdmin ? (
          <div className="py-6">
            {/* Placeholder para configuración general */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configuración de la Plataforma
                </h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: Configuración general, parámetros del sistema y ajustes globales.
                </p>
                <div className="text-sm text-gray-500">
                  Esta funcionalidad estará disponible pronto.
                </div>
              </div>
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      <DashboardHeader />
      
      {/* Pestañas del Dashboard - Solo mostrar si hay más de una pestaña */}
      {tabs.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Header con badge de admin */}
            {isAdmin && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg p-4">
                <div className="flex items-center gap-3 text-white">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Panel de Administración</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    Admin
                  </span>
                </div>
              </div>
            )}
            
            {/* Navegación de pestañas */}
            <div className={`border-b border-gray-200 dark:border-gray-700 ${isAdmin ? '' : 'rounded-t-lg'}`}>
              <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isAdminTab = adminTabs.some(adminTab => adminTab.id === tab.id);
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      } group inline-flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap`}
                      title={tab.description}
                    >
                      <Icon
                        className={`${
                          activeTab === tab.id
                            ? 'text-blue-500 dark:text-blue-400'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                        } -ml-0.5 mr-2 h-5 w-5 ${isAdminTab ? 'text-purple-500' : ''}`}
                      />
                      <span>{tab.name}</span>
                      {isAdminTab && (
                        <Shield className="ml-1 h-3 w-3 text-purple-400" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderTabContent()}
      </div>

      {/* Indicador de modo admin flotante */}
      {isAdmin && activeTab !== 'dashboard' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <Shield className="w-4 h-4" />
            <span>Modo Admin</span>
            <div className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}