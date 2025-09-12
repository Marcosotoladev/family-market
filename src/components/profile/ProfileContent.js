// src/components/profile/ProfileContent.js
import { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import StoreConfigSection from './StoreConfigSection';

// Importar otros componentes de secciones existentes
// import PersonalDataSection from './PersonalDataSection';
// import BusinessDataSection from './BusinessDataSection';
// import PhotosLogosSection from './PhotosLogosSection';
// import AccountSettingsSection from './AccountSettingsSection';

const ProfileContent = () => {
  const [activeSection, setActiveSection] = useState('personal-data');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal-data':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Datos Personales
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Componente PersonalDataSection aquí
            </p>
          </div>
        );
        // return <PersonalDataSection />;
      
      case 'business-data':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Datos del Negocio
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Componente BusinessDataSection aquí
            </p>
          </div>
        );
        // return <BusinessDataSection />;
      
      case 'photos-logos':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Fotos y Logos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Componente PhotosLogosSection aquí
            </p>
          </div>
        );
        // return <PhotosLogosSection />;
      
      case 'store-config':
        return <StoreConfigSection />;
      
      case 'account-settings':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Configuración de Cuenta
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Componente AccountSettingsSection aquí
            </p>
          </div>
        );
        // return <AccountSettingsSection />;
      
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sección no encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              La sección solicitada no existe.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;