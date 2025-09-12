// src/components/store/StoreLogoSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ImageIcon, Upload, X, Store } from 'lucide-react';

export default function StoreLogoSection({ logoState, setLogoState, showMessage }) {
  const { user, refreshUserData } = useAuth();
  const logoRef = useRef(null);

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
            <li>• Formato recomendado: horizontal (proporción 3:2 o 4:3)</li>
            <li>• Resolución mínima: 300x200 píxeles</li>
            <li>• Formatos compatibles: JPG, PNG, SVG</li>
          </ul>
        </div>

        <div className="flex items-start space-x-6">
          {/* Preview del logo */}
          <div className={`
            relative flex-shrink-0 w-48 h-28 rounded-lg
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

          {/* Controles */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => logoRef.current?.click()}
                disabled={logoState.uploading}
                className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {hasLogo ? 'Cambiar Logo' : 'Subir Logo'}
              </button>

              {hasLogo && !logoState.uploading && (
                <button
                  onClick={handleRemoveLogo}
                  className="flex items-center px-6 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>Recomendaciones:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Usa una imagen con fondo transparente (PNG) para mejor integración</li>
                <li>Asegúrate de que el texto sea legible en diferentes tamaños</li>
                <li>Evita logos muy detallados que se vean mal en tamaños pequeños</li>
                <li>Mantén colores consistentes con tu marca</li>
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

        {/* Vista previa en contexto */}
        {hasLogo && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vista previa en tienda
            </h4>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
              <div className="flex items-center justify-between">
                <img
                  src={logoState.preview || logoState.url}
                  alt="Logo preview"
                  className="h-8 object-contain"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Así se verá en tu tienda
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}