// src/components/tienda/StoreLayout.js
'use client';

import { useState, useEffect } from 'react';
import StoreHeader from './StoreHeader';
import StoreNavigation from './StoreNavigation';

const StoreLayout = ({ 
  storeData, 
  storeConfig, 
  children,
  onSearch 
}) => {
  const [activeSection, setActiveSection] = useState('productos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Detectar sección activa basada en scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['productos', 'servicios', 'empleos', 'galeria', 'testimonios', 'nosotros'];
      const scrollPosition = window.scrollY + 200; // Offset para activación anticipada
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Scroll será manejado por StoreNavigation
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Aplicar estilos CSS custom para colores de la tienda
  useEffect(() => {
    if (storeConfig?.primaryColor) {
      document.documentElement.style.setProperty('--store-primary-color', storeConfig.primaryColor);
    }
    if (storeConfig?.secondaryColor) {
      document.documentElement.style.setProperty('--store-secondary-color', storeConfig.secondaryColor);
    }
    
    // Cleanup al desmontar
    return () => {
      document.documentElement.style.removeProperty('--store-primary-color');
      document.documentElement.style.removeProperty('--store-secondary-color');
    };
  }, [storeConfig]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Header */}
      <StoreHeader
        storeLogo={storeData?.storeLogo}
        storeName={storeData?.businessName || storeData?.familyName || 'Mi Tienda'}
        storeConfig={storeConfig}
        onSearch={handleSearch}
        onMenuToggle={handleMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Navegación */}
      <StoreNavigation
        storeConfig={storeConfig}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={handleMobileMenuClose}
        storeSlug={storeData?.storeSlug}
      />
      
      {/* Contenido principal */}
      <main className="pb-20 lg:pb-8">
        {children}
      </main>
      
      {/* Overlay para cerrar menú móvil al hacer click fuera */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={handleMobileMenuClose}
        />
      )}
    </div>
  );
};

export default StoreLayout;