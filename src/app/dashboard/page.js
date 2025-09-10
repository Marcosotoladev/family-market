// src/app/dashboard/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { isAuthenticated, userData, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Bienvenido, {userData?.firstName} {userData?.lastName}
            </p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Información de la cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de información personal */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Información Personal
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Email:</span> {userData?.email}</p>
            <p><span className="font-medium">Familia:</span> {userData?.familyName}</p>
            <p><span className="font-medium">Estado:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                userData?.accountStatus === 'approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {userData?.accountStatus === 'approved' ? 'Aprobado' : 'Pendiente'}
              </span>
            </p>
          </div>
        </div>

        {/* Card de la tienda */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Mi Tienda
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nombre:</span> {userData?.businessName}</p>
            <p><span className="font-medium">URL:</span> 
              <a 
                href={`https://familymarket.com${userData?.storeUrl}`}
                target="_blank"
                className="text-primary-600 dark:text-primary-400 hover:underline ml-1"
              >
                {userData?.storeUrl}
              </a>
            </p>
            <p><span className="font-medium">Slug:</span> {userData?.storeSlug}</p>
          </div>
        </div>

        {/* Card de estadísticas */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Estadísticas
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Productos:</span> 0</p>
            <p><span className="font-medium">Pedidos:</span> 0</p>
            <p><span className="font-medium">Ventas:</span> $0</p>
          </div>
        </div>
      </div>

      {/* Contenido principal del dashboard */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Próximos pasos
        </h2>
        
        {userData?.accountStatus !== 'approved' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Cuenta pendiente de aprobación
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  Tu cuenta está siendo revisada por un administrador. Te notificaremos cuando sea aprobada.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Configurar tu tienda</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personaliza la información de tu tienda y agrega productos.
            </p>
            <button 
              className="mt-3 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              disabled={userData?.accountStatus !== 'approved'}
            >
              Configurar tienda
            </button>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Agregar productos</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comienza a agregar productos a tu catálogo.
            </p>
            <button 
              className="mt-3 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              disabled={userData?.accountStatus !== 'approved'}
            >
              Agregar productos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}