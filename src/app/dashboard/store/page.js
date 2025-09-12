// src/app/dashboard/store/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import StoreSidebar from '@/components/store/StoreSidebar';
import BusinessInfoSection from '@/components/store/BusinessInfoSection';
import StoreLogoSection from '@/components/store/StoreLogoSection';
import StoreConfigSection from '@/components/store/StoreConfigSection';
import { AlertCircle, CheckCircle, Store } from 'lucide-react';

export default function StorePage() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState('business');
  const [messages, setMessages] = useState({
    success: '',
    error: ''
  });

  // Estados para logo de tienda
  const [logoState, setLogoState] = useState({
    url: '',
    uploading: false,
    preview: null
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (userData) {
      setLogoState(prev => ({
        ...prev,
        url: userData.storeLogo || ''
      }));
    }
  }, [userData]);

  const showMessage = (type, message) => {
    setMessages({ 
      success: type === 'success' ? message : '',
      error: type === 'error' ? message : ''
    });
    
    setTimeout(() => {
      setMessages({ success: '', error: '' });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'business':
        return <BusinessInfoSection showMessage={showMessage} />;
      case 'logo':
        return (
          <StoreLogoSection 
            logoState={logoState}
            setLogoState={setLogoState}
            showMessage={showMessage}
          />
        );
      case 'config':
        return <StoreConfigSection showMessage={showMessage} />;
      default:
        return <BusinessInfoSection showMessage={showMessage} />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'business':
        return 'Información del Negocio';
      case 'logo':
        return 'Logo de la Tienda';
      case 'config':
        return 'Configuración de Tienda';
      default:
        return 'Mi Tienda';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'business':
        return 'Información de tu empresa o negocio';
      case 'logo':
        return 'Logo que aparecerá en tu tienda online';
      case 'config':
        return 'Personaliza cómo se ve y qué muestra tu tienda online';
      default:
        return 'Gestiona tu tienda online';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />

      {/* Header */}
      {/* <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center overflow-hidden">
              {logoState.url ? (
                <img
                  src={logoState.url}
                  alt="Logo de la tienda"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Store className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {getSectionTitle()}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getSectionDescription()}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <StoreSidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              logoState={logoState}
            />
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Mensajes de estado */}
            {(messages.success || messages.error) && (
              <div className="mb-6">
                {messages.success && (
                  <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {messages.success}
                  </div>
                )}
                {messages.error && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {messages.error}
                  </div>
                )}
              </div>
            )}

            {/* Sección activa */}
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}