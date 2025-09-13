// src/components/store/StoreLogoSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRef, useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ImageIcon, Upload, X, Store, Info } from 'lucide-react';

export default function StoreLogoSection({ logoState, setLogoState, showMessage }) {
  const { user, refreshUserData } = useAuth();
  const logoRef = useRef(null);
  
  // Estado para análisis del logo
  const [logoAnalysis, setLogoAnalysis] = useState({
    aspectRatio: 1,
    type: 'unknown', // 'horizontal', 'vertical', 'square', 'unknown'
    naturalWidth: 0,
    naturalHeight: 0,
    isLoaded: false
  });

  // Función para subir imagen a Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_STORE_LOGO);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Error al subir la imagen');
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  // Analizar dimensiones del logo cuando se carga
  const handleLogoLoad = (e) => {
    const img = e.target;
    const { naturalWidth, naturalHeight } = img;
    const aspectRatio = naturalWidth / naturalHeight;
    
    let type = 'square';
    if (aspectRatio > 1.3) {
      type = 'horizontal';
    } else if (aspectRatio < 0.8) {
      type = 'vertical';
    }
    
    setLogoAnalysis({
      aspectRatio,
      type,
      naturalWidth,
      naturalHeight,
      isLoaded: true
    });
  };

  // Obtener clases CSS para el contenedor del logo según su tipo
  const getLogoContainerClasses = () => {
    if (!logoAnalysis.isLoaded) {
      return "w-48 h-28"; // Default mientras carga
    }
    
    switch (logoAnalysis.type) {
      case 'horizontal':
        return "w-64 h-32"; // 2:1 para logos horizontales
      case 'vertical':
        return "w-32 h-48"; // 2:3 para logos verticales
      case 'square':
        return "w-40 h-40"; // 1:1 para logos cuadrados
      default:
        return "w-48 h-32"; // Proporción balanceada
    }
  };

  // Obtener recomendaciones específicas según el tipo de logo
  const getLogoRecommendations = () => {
    if (!logoAnalysis.isLoaded) return [];
    
    const base = [
      'Usa una imagen con fondo transparente (PNG) para mejor integración',
      'Mantén colores consistentes con tu marca'
    ];
    
    switch (logoAnalysis.type) {
      case 'horizontal':
        return [
          ...base,
          'Ideal para headers horizontales - se verá perfecto',
          'Asegúrate de que el texto sea legible en tamaños pequeños',
          `Proporción actual: ${logoAnalysis.aspectRatio.toFixed(2)}:1 (horizontal)`
        ];
      case 'vertical':
        return [
          ...base,
          'Considera crear una versión horizontal para mejor adaptación',
          'Funcionará bien en sidebars y layouts verticales',
          `Proporción actual: ${logoAnalysis.aspectRatio.toFixed(2)}:1 (vertical)`
        ];
      case 'square':
        return [
          ...base,
          'Versátil - se adapta bien a diferentes layouts',
          'Ideal para avatares y iconos de perfil',
          `Proporción actual: ${logoAnalysis.aspectRatio.toFixed(2)}:1 (cuadrado)`
        ];
      default:
        return base;
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'La imagen debe ser menor a 5MB');
      return;
    }

    try {
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoState(prev => ({
          ...prev,
          preview: e.target.result
        }));
        // Reset análisis para nueva imagen
        setLogoAnalysis(prev => ({ ...prev, isLoaded: false }));
      };
      reader.readAsDataURL(file);

      // Iniciar estado de carga
      setLogoState(prev => ({
        ...prev,
        uploading: true
      }));

      // Subir a Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        storeLogo: imageUrl,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setLogoState({
        url: imageUrl,
        uploading: false,
        preview: null
      });

      // Refrescar datos del usuario
      await refreshUserData();

      showMessage('success', 'Logo de tienda actualizado correctamente');

    } catch (error) {
      console.error('Error al subir imagen:', error);
      setLogoState(prev => ({
        ...prev,
        uploading: false,
        preview: null
      }));
      showMessage('error', `Error al subir la imagen: ${error.message}`);
    }

    // Limpiar input
    event.target.value = '';
  };

  // Eliminar logo
  const handleRemoveLogo = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        storeLogo: null,
        updatedAt: new Date()
      });

      setLogoState({
        url: '',
        uploading: false,
        preview: null
      });

      // Reset análisis
      setLogoAnalysis({
        aspectRatio: 1,
        type: 'unknown',
        naturalWidth: 0,
        naturalHeight: 0,
        isLoaded: false
      });

      await refreshUserData();

      showMessage('success', 'Logo de tienda eliminado correctamente');

    } catch (error) {
      console.error('Error al eliminar logo:', error);
      showMessage('error', `Error al eliminar el logo: ${error.message}`);
    }
  };

  const hasLogo = logoState.url || logoState.preview;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Logo de la Tienda
        </h2>
      </div>

      <div className="space-y-6">
        {/* Información sobre el logo */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Sobre tu logo de tienda
          </h4>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Se mostrará en el encabezado de tu tienda online</li>
            <li>• Acepta cualquier proporción: horizontal, vertical o cuadrado</li>
            <li>• Resolución mínima recomendada: 300x300 píxeles</li>
            <li>• Formatos compatibles: JPG, PNG, SVG</li>
          </ul>
        </div>

        {/* Análisis del logo actual */}
        {hasLogo && logoAnalysis.isLoaded && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Análisis de tu logo
              </h4>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• Tipo: <strong>{logoAnalysis.type === 'horizontal' ? 'Horizontal' : logoAnalysis.type === 'vertical' ? 'Vertical' : 'Cuadrado'}</strong></p>
              <p>• Dimensiones: {logoAnalysis.naturalWidth} x {logoAnalysis.naturalHeight} píxeles</p>
              <p>• Proporción: {logoAnalysis.aspectRatio.toFixed(2)}:1</p>
            </div>
          </div>
        )}

        {/* Layout responsive: horizontal en desktop, vertical en móvil */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-6 lg:space-y-0">
          {/* Preview del logo - Adaptativo */}
          <div className={`
            relative mx-auto lg:mx-0 flex-shrink-0 rounded-lg
            ${getLogoContainerClasses()}
            ${hasLogo ? 'border border-gray-200 dark:border-gray-600' : 'border-2 border-dashed border-gray-300 dark:border-gray-600'}
            overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center
          `}>
            {logoState.uploading ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Subiendo logo...</span>
              </div>
            ) : hasLogo ? (
              <>
                <img
                  src={logoState.preview || logoState.url}
                  alt="Logo de la tienda"
                  className="w-full h-full object-contain"
                  onLoad={handleLogoLoad}
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="Eliminar logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vista previa del logo
                </p>
              </div>
            )}
          </div>

          {/* Controles - Ahora están debajo en móvil */}
          <div className="flex-1 space-y-4">
            {/* Botones */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <button
                onClick={() => logoRef.current?.click()}
                disabled={logoState.uploading}
                className="flex items-center justify-center sm:justify-start px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {hasLogo ? 'Cambiar Logo' : 'Subir Logo'}
              </button>

              {hasLogo && !logoState.uploading && (
                <button
                  onClick={handleRemoveLogo}
                  className="flex items-center justify-center sm:justify-start px-6 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
            </div>

            {/* Recomendaciones específicas */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>Recomendaciones:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {getLogoRecommendations().map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Input oculto */}
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Vista previa en diferentes contextos */}
        {hasLogo && logoAnalysis.isLoaded && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vista previa en tienda (diferentes tamaños)
            </h4>
            
            {/* Header preview */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={logoState.preview || logoState.url}
                      alt="Logo header"
                      className={`object-contain ${
                        logoAnalysis.type === 'horizontal' ? 'h-8' :
                        logoAnalysis.type === 'vertical' ? 'h-10 w-8' : 'h-8 w-8'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Tu Tienda</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Header principal</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={logoState.preview || logoState.url}
                    alt="Logo mobile"
                    className={`object-contain ${
                      logoAnalysis.type === 'horizontal' ? 'h-6' :
                      logoAnalysis.type === 'vertical' ? 'h-8 w-6' : 'h-6 w-6'
                    }`}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Vista móvil
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}