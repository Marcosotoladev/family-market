// src/components/tienda/StoreHeader.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, X, Store } from 'lucide-react';

const StoreHeader = ({ 
  storeLogo, 
  storeName, 
  storeConfig,
  onSearch,
  onMenuToggle,
  isMobileMenuOpen 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logoType, setLogoType] = useState('square');

  // Detectar tipo de logo para adaptación
  const handleLogoLoad = (e) => {
    const img = e.target;
    const { naturalWidth, naturalHeight } = img;
    const aspectRatio = naturalWidth / naturalHeight;
    
    if (aspectRatio > 1.3) {
      setLogoType('horizontal');
    } else if (aspectRatio < 0.8) {
      setLogoType('vertical');
    } else {
      setLogoType('square');
    }
  };

  // Obtener clases CSS del logo según su tipo
  const getLogoClasses = () => {
    switch (logoType) {
      case 'horizontal':
        return 'h-8 sm:h-10 lg:h-12 max-w-[120px] sm:max-w-[160px] lg:max-w-[200px]';
      case 'vertical':
        return 'h-10 sm:h-12 lg:h-14 w-auto max-w-[80px] sm:max-w-[100px]';
      case 'square':
        return 'h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12';
      default:
        return 'h-8 sm:h-10 lg:h-12 max-w-[120px] sm:max-w-[160px]';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Búsqueda en tiempo real opcional
    // if (onSearch) onSearch(e.target.value);
  };

  return (
    <header 
      className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      style={{ 
        borderBottomColor: storeConfig?.primaryColor ? `${storeConfig.primaryColor}20` : undefined 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:flex items-center justify-between py-4">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={`Logo de ${storeName}`}
                className={`object-contain ${getLogoClasses()}`}
                onLoad={handleLogoLoad}
              />
            ) : (
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {storeName}
                </span>
              </div>
            )}
          </div>

          {/* Buscador Central */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Buscar productos, servicios..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-colors"
                  style={{ 
                    '--tw-ring-color': storeConfig?.primaryColor || '#ea580c',
                    focusRingColor: storeConfig?.primaryColor || '#ea580c'
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 text-white rounded-md transition-colors"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {/* Nombre de la tienda (cuando hay logo) */}
          {storeLogo && (
            <div className="flex-shrink-0 text-right">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {storeName}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tienda online
              </p>
            </div>
          )}
        </div>

        {/* MOBILE LAYOUT */}
        <div className="lg:hidden">
          
          {/* Primera fila: Logo, Nombre y Menú */}
          <div className="flex items-center justify-between py-3">
            
            {/* Logo + Nombre */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={`Logo de ${storeName}`}
                  className={`object-contain flex-shrink-0 ${getLogoClasses()}`}
                  onLoad={handleLogoLoad}
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {storeName}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Tienda online
                </p>
              </div>
            </div>

            {/* Botón Menú */}
            <button
              onClick={onMenuToggle}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Segunda fila: Buscador */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-16 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent transition-colors text-sm"
                  style={{ 
                    '--tw-ring-color': storeConfig?.primaryColor || '#ea580c'
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-white rounded-md transition-colors text-sm"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;