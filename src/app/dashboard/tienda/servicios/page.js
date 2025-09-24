// src/app/dashboard/tienda/servicios/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import ServiceManager from '@/components/tienda/servicios/ServiceManager';
import { Loader2, Store, AlertCircle, Briefcase } from 'lucide-react';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';

export default function ServiciosPage() {
  const { user, loading: authLoading } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadStoreData();
    } else if (!authLoading && !user) {
      setError('Usuario no autenticado');
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del usuario/tienda
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setError('Datos de usuario no encontrados');
        return;
      }
      
      const userData = { id: userDoc.id, ...userDoc.data() };
      
      // Verificar que el usuario tenga una tienda configurada
      if (!userData.businessName && !userData.familyName) {
        setError('No has configurado tu tienda. Ve a configuración para completar tu perfil.');
        return;
      }
      
      // Cargar configuración de la tienda
      const config = await getPublicStoreConfig(user.uid);
      
      setStoreData(userData);
      setStoreConfig(config);
      
    } catch (error) {
      console.error('Error cargando datos de la tienda:', error);
      setError('Error al cargar los datos de la tienda');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando servicios...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos preparando tu panel de servicios
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar la tienda
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadStoreData}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Reintentar
            </button>
            <a
              href="/dashboard/store"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Ir a Configuración
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!storeData || !storeConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Configuración incompleta
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Completa la configuración de tu tienda para gestionar servicios
          </p>
          <a
            href="/dashboard/store"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Configurar Tienda
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardTopNavigation />
      <ServiceManager 
        storeId={user.uid} 
        storeData={storeData}
        storeConfig={storeConfig}
      />
    </>
  );
}