// src/app/admin/layout.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, LayoutDashboard } from 'lucide-react';
import AdminNavBadges from '@/components/admin/AdminNavBadges';

export default function AdminLayout({ children }) {
  const { isAuthenticated, userData, loading } = useAuth();
  const router = useRouter();
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    if (!loading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para acceder al panel de administración.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barra superior delgada indicadora de admin */}
      <div className="bg-red-600 dark:bg-red-700 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Modo Administrador</span>
            <span className="hidden sm:inline text-red-200">•</span>
            <span className="hidden sm:inline text-red-200">{userData?.email}</span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-xs hover:text-red-100 transition-colors"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span className="hidden sm:inline">Mi Panel</span>
          </button>
        </div>
      </div>

      {/* Navegación con badges */}
      <AdminNavBadges />

      {/* Contenido de las páginas admin */}
      <main className="pb-8">{children}</main>
    </div>
  );
}