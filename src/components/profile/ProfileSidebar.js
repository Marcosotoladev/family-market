// src/components/profile/ProfileSidebar.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Camera, Settings, Shield } from 'lucide-react';

export default function ProfileSidebar({ activeSection, setActiveSection, imageStates }) {
  const { userData } = useAuth();

  const sections = [
    { id: 'personal', label: 'Datos Personales', icon: User },
    { id: 'negocio', label: 'Datos del Negocio', icon: Building2 },
    { id: 'imagenes', label: 'Fotos y Logos', icon: Camera },
    { id: 'cuenta', label: 'Configuración de Cuenta', icon: Settings }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                ${isActive
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Info de cuenta */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto flex items-center justify-center mb-3 overflow-hidden">
            {imageStates.profileImage.url ? (
              <img
                src={imageStates.profileImage.url}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {userData.firstName} {userData.lastName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userData.businessName}
          </p>
          <div className="flex items-center justify-center mt-2">
            <Shield className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs text-green-600 dark:text-green-400">
              Cuenta verificada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}