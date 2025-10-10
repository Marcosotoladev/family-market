// src/app/dashboard/tienda/empleos/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import EmploymentManager from '@/components/tienda/empleos/EmploymentManager';
import { Briefcase, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function EmpleosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        loadUserData();
      }
    }
  }, [user, authLoading, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        setError('No se encontraron datos del usuario');
        return;
      }

      const data = userDoc.data();
      setUserData(data);

      // Preparar datos de la tienda
      const store = {
        storeSlug: data.storeSlug || data.familyName?.toLowerCase().replace(/\s+/g, '-'),
        storeName: data.businessName || data.familyName || 'Mi Tienda',
        storeDescription: data.businessDescription || '',
        primaryColor: data.primaryColor || '#FF6B35',
        secondaryColor: data.secondaryColor || '#004E89',
        phone: data.phone || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        address: data.address || '',
        city: data.city || '',
        province: data.province || '',
        country: data.country || 'Argentina',
      };

      setStoreData(store);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardTopNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando gestión de empleos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardTopNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error al cargar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      
      {/* Header con gradient */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Botón volver */}
          <button
            onClick={() => router.push('/dashboard/tienda')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver a Mi Tienda
          </button>

          <div className="flex items-center space-x-4">
            {/* Icono */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-white/30">
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Gestión de Empleos
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                Publica ofertas de trabajo, busca empleos o ofrece tus servicios profesionales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EmploymentManager 
          storeId={user.uid}
          storeData={storeData}
          userData={userData}
        />
      </div>
    </div>
  );
}