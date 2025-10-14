// src/app/admin/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, ShoppingBag, Wrench, Briefcase, 
  MessageCircle, MessageSquare, TrendingUp,
  Activity, Clock
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminDashboard() {
  const { isAuthenticated, userData, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalServices: 0,
    totalJobs: 0,
    totalComments: 0,
    totalNotifications: 0,
    recentActivity: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (!loading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      
      const [users, products, services, jobs, comments, notifications] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'productos')),
        getDocs(collection(db, 'servicios')),
        getDocs(collection(db, 'empleos')),
        getDocs(collection(db, 'comentarios')),
        getDocs(collection(db, 'notifications'))
      ]);

      setStats({
        totalUsers: users.size,
        totalProducts: products.size,
        totalServices: services.size,
        totalJobs: jobs.size,
        totalComments: comments.size,
        totalNotifications: notifications.size
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || !isAuthenticated || !userData || !isAdmin) {
    return null;
  }

  const statCards = [
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'indigo',
      change: '+12%'
    },
    {
      title: 'Productos',
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Servicios',
      value: stats.totalServices,
      icon: Wrench,
      color: 'blue',
      change: '+15%'
    },
    {
      title: 'Empleos',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'purple',
      change: '+5%'
    },
    {
      title: 'Comentarios',
      value: stats.totalComments,
      icon: MessageCircle,
      color: 'pink',
      change: '+23%'
    },
    {
      title: 'Notificaciones',
      value: stats.totalNotifications,
      icon: MessageSquare,
      color: 'cyan',
      change: '+10%'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
    };
    return colors[color];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido, {userData?.firstName || 'Administrador'}. Aquí tienes un resumen de la plataforma.
        </p>
      </div>

      {/* Estadísticas */}
      {loadingStats ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat) => (
              <div 
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg ${getColorClasses(stat.color)} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Actividad
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Accesos Rápidos
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/admin/usuarios')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Gestionar Usuarios
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.totalUsers} usuarios registrados
                    </p>
                  </button>
                  
                  <button
                    onClick={() => router.push('/admin/mensajeria')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Enviar Notificación
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Comunicación masiva
                    </p>
                  </button>

                  <button
                    onClick={() => router.push('/admin/comentarios')}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Moderar Comentarios
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.totalComments} comentarios totales
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Contenido Publicado
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Productos</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.totalProducts}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Servicios</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.totalServices}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Empleos</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.totalJobs}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}