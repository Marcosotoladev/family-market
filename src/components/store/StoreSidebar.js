// src/components/store/StoreSidebar.js
import { 
  Building2, 
  ImageIcon, 
  Settings,
  Store,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const StoreSidebar = ({ activeSection, setActiveSection, logoState }) => {
  const menuItems = [
    {
      id: 'business',
      label: 'Información del Negocio',
      icon: Building2,
      description: 'Datos de tu empresa'
    },
    {
      id: 'logo',
      label: 'Logo de la Tienda',
      icon: ImageIcon,
      description: 'Logo para tu tienda online'
    },
    {
      id: 'config',
      label: 'Configuración',
      icon: Settings,
      description: 'Personaliza tu tienda',
      isNew: true
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header con logo de tienda */}
{/*       <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center overflow-hidden">
            {logoState?.url ? (
              <img
                src={logoState.url}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <Store className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Mi Tienda
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configuración completa
            </p>
          </div>
        </div>
      </div> */}

      {/* Menu Items */}
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-100 dark:bg-orange-800/30'
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center">
                      {item.label}
                      {item.isNew && (
                        <></>
/*                         <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          Nuevo
                        </span> */
                      )}
                    </div>
                    <div className={`text-xs ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
                
                {isActive && (
                  <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Info adicional - Vista previa de tienda */}
      {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Vista Previa
              </span>
            </div>
            <ExternalLink className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
            Ve cómo se ve tu tienda para los clientes
          </p>
          <button className="w-full text-xs bg-orange-100 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300 py-2 px-3 rounded-md hover:bg-orange-200 dark:hover:bg-orange-700/30 transition-colors">
            Ver mi tienda
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default StoreSidebar;