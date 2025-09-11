// src/components/store/StoreHeader.js
'use client';

import { useState } from 'react';
import { Store, Menu, X, ArrowLeft, User } from 'lucide-react';

export default function StoreHeader({ storeData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const sections = [];
  
  // Agregar secciones dinámicamente según configuración
  if (storeData.storeConfig?.showProducts) {
    sections.push({ id: 'productos', label: 'Productos' });
  }
  if (storeData.storeConfig?.showServices) {
    sections.push({ id: 'servicios', label: 'Servicios' });
  }
  sections.push({ id: 'contacto', label: 'Contacto' });

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo y nombre de la tienda */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                {storeData.storeLogo ? (
                  <img
                    src={storeData.storeLogo}
                    alt={`${storeData.businessName}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Store className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {storeData.businessName}
                </h1>
              </div>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('inicio')}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Inicio
              </button>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Acciones */}
            <div className="flex items-center space-x-3">
              {/* Botón del vendedor */}
              <button
                onClick={() => setShowOwnerModal(true)}
                className="hidden sm:flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="w-3 h-3 mr-1" />
                Vendedor
              </button>

              {/* Volver a Family Market */}
              <a
                href="/"
                className="hidden sm:flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Family Market
              </a>
              
              {/* Menú móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Menú móvil expandido */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-left py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Inicio
                </button>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="text-left py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {section.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => {
                      setShowOwnerModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Acerca del vendedor
                  </button>
                  <a
                    href="/"
                    className="flex items-center py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Family Market
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modal del vendedor */}
      {showOwnerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Acerca del vendedor</h3>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden">
                {storeData.profileImage ? (
                  <img
                    src={storeData.profileImage}
                    alt={`${storeData.firstName} ${storeData.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                {storeData.firstName} {storeData.lastName}
              </h4>
              <p className="text-sm text-gray-600">
                Propietario de {storeData.businessName}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-900">Familia:</span>
                <span className="text-gray-600 ml-1">{storeData.familyName}</span>
              </div>
              {storeData.city && (
                <div>
                  <span className="font-medium text-gray-900">Ubicación:</span>
                  <span className="text-gray-600 ml-1">{storeData.city}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-900">Miembro desde:</span>
                <span className="text-gray-600 ml-1">
                  {storeData.createdAt ? new Date(storeData.createdAt.toDate()).getFullYear() : new Date().getFullYear()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowOwnerModal(false)}
                className="w-full px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}