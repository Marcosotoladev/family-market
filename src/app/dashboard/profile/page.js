// src/app/dashboard/profile/page.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTopNavigation from '@/components/layout/DashboardTopNavigation';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import ProfileImageSection from '@/components/profile/ProfileImageSection';
import AccountSettingsSection from '@/components/profile/AccountSettingsSection';
import ToastContainer from '@/components/ui/ToastContainer';
import useToast from '@/hooks/useToast';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, userData, user, loading } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, hideToast } = useToast();

  const [activeSection, setActiveSection] = useState('personal');

  // Estado para imagen de perfil
  const [profileImageState, setProfileImageState] = useState({
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
      setProfileImageState(prev => ({
        ...prev,
        url: userData.profileImage || ''
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      case 'image':
        return (
          <ProfileImageSection
            profileImageState={profileImageState}
            setProfileImageState={setProfileImageState}
            showMessage={showMessage}
          />
        );
      case 'account':
        return <AccountSettingsSection showMessage={showMessage} />;
      default:
        return <PersonalInfoSection showMessage={showMessage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardTopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              profileImageState={profileImageState}
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