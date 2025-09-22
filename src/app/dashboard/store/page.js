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
import ToastContainer from '@/components/ui/ToastContainer';
import useToast from '@/hooks/useToast';
import { Store } from 'lucide-react';
import StoreNavBadges from '@/components/layout/StoreNavBadges';

export default function StorePage() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const [activeSection, setActiveSection] = useState('business');

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

  // Función mejorada para mostrar mensajes con toast
  const showMessage = (type, message) => {
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />
      <StoreNavBadges />
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
            {/* Sección activa */}
            {renderActiveSection()}
          </div>
        </div>
      </div>

      {/* Toast Container - Siempre visible */}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
}