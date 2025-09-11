// src/app/dashboard/profile/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import BusinessInfoSection from '@/components/profile/BusinessInfoSection';
import ImageUploadSection from '@/components/profile/ImageUploadSection';
import AccountSettingsSection from '@/components/profile/AccountSettingsSection';
import StoreConfigSection from '@/components/profile/StoreConfigSection';
import { AlertCircle, CheckCircle, User } from 'lucide-react';

export default function DashboardPerfil() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [messages, setMessages] = useState({
    success: '',
    error: ''
  });

  // Estados para imágenes
  const [imageStates, setImageStates] = useState({
    profileImage: {
      url: '',
      uploading: false,
      preview: null
    },
    storeLogo: {
      url: '',
      uploading: false,
      preview: null
    }
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (userData) {
      setImageStates(prev => ({
        ...prev,
        profileImage: {
          ...prev.profileImage,
          url: userData.profileImage || ''
        },
        storeLogo: {
          ...prev.storeLogo,
          url: userData.storeLogo || ''
        }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalInfoSection showMessage={showMessage} />;
      case 'negocio':
        return <BusinessInfoSection showMessage={showMessage} />;
      case 'imagenes':
        return (
          <ImageUploadSection 
            imageStates={imageStates}
            setImageStates={setImageStates}
            showMessage={showMessage}
          />
        );
      case 'tienda':
        return <StoreConfigSection showMessage={showMessage} />;
      case 'cuenta':
        return <AccountSettingsSection showMessage={showMessage} />;
      default:
        return <PersonalInfoSection showMessage={showMessage} />;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'personal':
        return 'Información Personal';
      case 'negocio':
        return 'Información del Negocio';
      case 'imagenes':
        return 'Fotos y Logos';
      case 'tienda':
        return 'Configuración de Tienda';
      case 'cuenta':
        return 'Configuración de Cuenta';
      default:
        return 'Mi Perfil';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'personal':
        return 'Gestiona tu información personal y de contacto';
      case 'negocio':
        return 'Información de tu empresa o negocio';
      case 'imagenes':
        return 'Administra tu imagen de perfil y logo de la tienda';
      case 'tienda':
        return 'Personaliza cómo se ve y qué muestra tu tienda online';
      case 'cuenta':
        return 'Configuración de privacidad y cuenta';
      default:
        return 'Gestiona tu información personal y configuración de cuenta';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center overflow-hidden">
              {imageStates.profileImage.url ? (
                <img
                  src={imageStates.profileImage.url}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              imageStates={imageStates}
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