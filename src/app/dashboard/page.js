// src/app/dashboard/page.js - Dashboard completo con mensajería integrada
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
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

  // Pestañas del dashboard - solo para admins
  const tabs = [];

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
    }
  ];

  // Si es admin, agregar las pestañas administrativas
  if (isAdmin) {
    tabs.push(...adminTabs);
  }

  // Función para renderizar el contenido de cada pestaña
  const renderTabContent = () => {
    // Si es admin y hay una pestaña activa específica
    if (isAdmin && activeTab !== 'dashboard') {
      switch (activeTab) {
        case 'users':
          return (
            <div className="py-6">
              <UserManagementSection />
            </div>
          );
        
        case 'messaging':
          return (
            <div className="py-6">
              <MessagingManagementSection />
            </div>
          );
        
        case 'comments':
          return (
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
            </div>
          );
        
        case 'settings':
          return (
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
          );
        
        default:
          return null;
      }
    }

    // Por defecto: mostrar siempre el dashboard principal
    return (
      <div className="grid gap-2">
        <UserInfoCard />
        <FavoritesSection />
        <CommentsSection />
        <StoreInfoCard />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      {/* Contenido del Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderTabContent()}
      </div>
    </div>
  );
}