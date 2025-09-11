// src/components/profile/ProfileSidebar.js
import { 
  User, 
  Building2, 
  ImageIcon, 
  Settings, 
  Store,
  CheckCircle 
} from 'lucide-react';

const ProfileSidebar = ({ activeSection, setActiveSection, imageStates }) => {
  const menuItems = [
    {
      id: 'personal',
      label: 'Información Personal',
      icon: User,
      description: 'Datos personales y de contacto'
    },
    {
      id: 'negocio',
      label: 'Información del Negocio',
      icon: Building2,
      description: 'Datos de tu empresa'
    },
    {
      id: 'imagenes',
      label: 'Fotos y Logos',
      icon: ImageIcon,
      description: 'Imagen de perfil y logo'
    },
    {
      id: 'tienda',
      label: 'Configuración de Tienda',
      icon: Store,
      description: 'Personaliza tu tienda online',
      isNew: true
    },
    {
      id: 'cuenta',
      label: 'Configuración de Cuenta',
      icon: Settings,
      description: 'Privacidad y configuración'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header con imagen de perfil */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center overflow-hidden">
            {imageStates?.profileImage?.url ? (
              <img
                src={imageStates.profileImage.url}
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
              Configuración completa
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-800/30'
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center">
                      {item.label}
                      {item.isNew && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Info adicional */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Store className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
              Tu Tienda Online
            </span>
          </div>
          <p className="text-xs text-primary-700 dark:text-primary-300">
            Personaliza completamente tu tienda con la nueva configuración avanzada
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;