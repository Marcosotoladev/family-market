// src/components/profile/ProfileSidebar.js
import { 
  User, 
  Camera, 
  Settings,
  CheckCircle,
  Shield
} from 'lucide-react';

const ProfileSidebar = ({ activeSection, setActiveSection, profileImageState }) => {
  const menuItems = [
    {
      id: 'personal',
      label: 'Información Personal',
      icon: User,
      description: 'Datos personales y contacto'
    },
    {
      id: 'image',
      label: 'Foto de Perfil',
      icon: Camera,
      description: 'Tu imagen de perfil'
    },
    {
      id: 'account',
      label: 'Configuración de Cuenta',
      icon: Settings,
      description: 'Privacidad y configuración'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header con imagen de perfil */}
{/*       <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {profileImageState?.url ? (
              <img
                src={profileImageState.url}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Mi Perfil
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Información personal
            </p>
          </div>
        </div>
      </div> */}

      {/* Menu Items */}
      <nav className="p-2">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-800/30'
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.label}
                    </div>
                    <div className={`text-xs ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Info adicional - Privacidad */}
{/*       <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Tu Privacidad
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Tu información personal está protegida y solo se muestra según tus preferencias de privacidad
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default ProfileSidebar;