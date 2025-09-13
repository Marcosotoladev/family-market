// src/components/tienda/StoreNavigation.js
'use client';

import { useState } from 'react';
import { 
  Package, 
  Wrench, 
  Briefcase, 
  Camera, 
  MessageCircle, 
  Users,
  ChevronDown,
  X
} from 'lucide-react';

const StoreNavigation = ({ 
  storeConfig, 
  activeSection, 
  onSectionChange,
  isMobileMenuOpen,
  onMobileMenuClose,
  storeSlug // Agregar storeSlug para las rutas
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Mapear secciones de configuración a elementos de navegación
  const getNavigationItems = () => {
    const items = [];
    
    if (storeConfig?.showProducts) {
      items.push({
        id: 'productos',
        label: 'Productos',
        icon: Package,
        path: `/tienda/${storeSlug}/productos`
      });
    }
    
    if (storeConfig?.showServices) {
      items.push({
        id: 'servicios',
        label: 'Servicios',
        icon: Wrench,
        path: `/tienda/${storeSlug}/servicios`
      });
    }
    
    if (storeConfig?.showJobs) {
      items.push({
        id: 'empleos',
        label: 'Empleos',
        icon: Briefcase,
        path: `/tienda/${storeSlug}/empleos`
      });
    }
    
    if (storeConfig?.showGallery) {
      items.push({
        id: 'galeria',
        label: 'Galería',
        icon: Camera,
        path: `/tienda/${storeSlug}/galeria`
      });
    }
    
    if (storeConfig?.showTestimonials) {
      items.push({
        id: 'testimonios',
        label: 'Testimonios',
        icon: MessageCircle,
        path: `/tienda/${storeSlug}/testimonios`
      });
    }
    
    // Siempre mostrar "Nosotros"
    items.push({
      id: 'nosotros',
      label: 'Nosotros',
      icon: Users,
      path: `/tienda/${storeSlug}/nosotros`
    });
    
    return items;
  };

  const navigationItems = getNavigationItems();

  const handleItemClick = (item) => {
    // Navegar a la página correspondiente en lugar de hacer scroll
    window.location.href = item.path;
    
    // Cerrar menú móvil
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const getItemClasses = (itemId) => {
    const isActive = activeSection === itemId;
    const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200";
    
    if (isActive) {
      return `${baseClasses} text-white shadow-lg transform scale-105`;
    }
    
    return `${baseClasses} text-gray-700 dark:text-gray-300 hover:text-white hover:shadow-md hover:transform hover:scale-105`;
  };

  return (
    <>
      {/* DESKTOP NAVIGATION */}
      <nav className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={getItemClasses(item.id)}
                  style={{
                    backgroundColor: isActive 
                      ? storeConfig?.primaryColor || '#ea580c'
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = storeConfig?.primaryColor || '#ea580c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION OVERLAY */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay de fondo */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onMobileMenuClose}
          />
          
          {/* Menú móvil */}
          <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300">
            
            {/* Header del menú */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Navegación
              </h3>
              <button
                onClick={onMobileMenuClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Items de navegación */}
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full ${getItemClasses(item.id)} justify-start`}
                    style={{
                      backgroundColor: isActive 
                        ? storeConfig?.primaryColor || '#ea580c'
                        : 'transparent'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Información adicional en el menú móvil */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Tienda online
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* MOBILE BOTTOM NAVIGATION (opcional) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                style={{
                  backgroundColor: isActive 
                    ? storeConfig?.primaryColor || '#ea580c'
                    : 'transparent'
                }}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
          
          {/* Botón "Más" si hay más de 4 items */}
          {navigationItems.length > 4 && (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400"
            >
              <ChevronDown className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Más</span>
            </button>
          )}
        </div>
        
        {/* Dropdown para items adicionales */}
        {dropdownOpen && navigationItems.length > 4 && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-2 space-y-1">
              {navigationItems.slice(4).map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleItemClick(item);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? storeConfig?.primaryColor || '#ea580c'
                        : 'transparent'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default StoreNavigation;