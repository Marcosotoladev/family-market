// src/app/dashboard/page.js - Dashboard Hub Central
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import { 
  User, 
  Heart, 
  MessageSquare, 
  Store,
  Users,
  Send,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, userData, loading } = useAuth();
  const router = useRouter();
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

  // Tarjetas de navegación para usuarios normales
  const userCards = [
    {
      title: 'Mi Perfil',
      description: 'Gestiona tu información personal y configuración',
      icon: User,
      href: '/dashboard/profile',
      color: 'bg-blue-500',
      darkColor: 'dark:bg-blue-600'
    },
    {
      title: 'Favoritos',
      description: 'Accede a tus productos y servicios guardados',
      icon: Heart,
      href: '/dashboard/favorites',
      color: 'bg-pink-500',
      darkColor: 'dark:bg-pink-600'
    },
    {
      title: 'Mis Reseñas',
      description: 'Gestiona tus comentarios y valoraciones',
      icon: MessageSquare,
      href: '/dashboard/reviews',
      color: 'bg-purple-500',
      darkColor: 'dark:bg-purple-600'
    },
    {
      title: 'Mi Tienda',
      description: 'Administra tu tienda y configuración',
      icon: Store,
      href: '/dashboard/store',
      color: 'bg-green-500',
      darkColor: 'dark:bg-green-600'
    }
  ];

  // Tarjetas adicionales para administradores
  const adminCards = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios de la plataforma',
      icon: Users,
      href: '/dashboard/users',
      color: 'bg-indigo-500',
      darkColor: 'dark:bg-indigo-600'
    },
    {
      title: 'Mensajería',
      description: 'Envía notificaciones a los usuarios',
      icon: Send,
      href: '/dashboard/messaging',
      color: 'bg-rose-500',
      darkColor: 'dark:bg-rose-600'
    }
  ];

  const allCards = isAdmin ? [...userCards, ...adminCards] : userCards;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mi Cuenta
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Bienvenido, {userData?.firstName || userData?.businessName || userData?.email}
          </p>
        </div>

        {/* Sección de Usuario */}
        <div className={isAdmin ? 'mb-8 sm:mb-12' : ''}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gestión Personal
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {userCards.map((card) => (
              <NavigationCard key={card.href} {...card} router={router} />
            ))}
          </div>
        </div>

        {/* Sección de Administración - solo para admins */}
        {isAdmin && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Panel de Administración
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {adminCards.map((card) => (
                <NavigationCard key={card.href} {...card} router={router} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de navegación
function NavigationCard({ title, description, icon: Icon, href, color, darkColor, router }) {
  return (
    <button
      onClick={() => router.push(href)}
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 text-left border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    >
      {/* Icono */}
      <div className={`${color} ${darkColor} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>

      {/* Contenido */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Flecha */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </button>
  );
}