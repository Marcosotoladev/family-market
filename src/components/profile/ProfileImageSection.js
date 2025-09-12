// src/components/profile/ProfileImageSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Camera, Upload, X, User } from 'lucide-react';

export default function ProfileImageSection({ profileImageState, setProfileImageState, showMessage }) {
  const { user, refreshUserData } = useAuth();
  const profileImageRef = useRef(null);

  // Función para subir imagen a Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PROFILE);
    
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
        setProfileImageState(prev => ({
          ...prev,
          preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Iniciar estado de carga
      setProfileImageState(prev => ({
        ...prev,
        uploading: true
      }));

      // Subir a Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: imageUrl,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setProfileImageState({
        url: imageUrl,
        uploading: false,
        preview: null
      });

      // Refrescar datos del usuario
      await refreshUserData();

      showMessage('success', 'Foto de perfil actualizada correctamente');

    } catch (error) {
      console.error('Error al subir imagen:', error);
      setProfileImageState(prev => ({
        ...prev,
        uploading: false,
        preview: null
      }));
      showMessage('error', `Error al subir la imagen: ${error.message}`);
    }

    // Limpiar input
    event.target.value = '';
  };

  // Eliminar imagen
  const handleRemoveImage = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: null,
        updatedAt: new Date()
      });

      setProfileImageState({
        url: '',
        uploading: false,
        preview: null
      });

      await refreshUserData();

      showMessage('success', 'Foto de perfil eliminada correctamente');

    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      showMessage('error', `Error al eliminar la imagen: ${error.message}`);
    }
  };

  const hasImage = profileImageState.url || profileImageState.preview;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Foto de Perfil
        </h2>
      </div>

      <div className="space-y-6">
        {/* Información sobre la foto de perfil */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Sobre tu foto de perfil
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Aparece en tu perfil público y publicaciones</li>
            <li>• Formato recomendado: cuadrado (1:1)</li>
            <li>• Resolución mínima: 200x200 píxeles</li>
            <li>• Formatos compatibles: JPG, PNG</li>
          </ul>
        </div>

        {/* NUEVO LAYOUT RESPONSIVE */}
        <div className="flex flex-col items-center space-y-6 md:flex-row md:items-start md:space-y-0 md:space-x-6">
          
          {/* Preview de imagen - centrada en móvil */}
          <div className={`
            relative flex-shrink-0 w-32 h-32 rounded-full
            ${hasImage ? 'border-2 border-gray-200 dark:border-gray-600' : 'border-2 border-dashed border-gray-300 dark:border-gray-600'}
            overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center
          `}>
            {profileImageState.uploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">Subiendo...</span>
              </div>
            ) : hasImage ? (
              <>
                <img
                  src={profileImageState.preview || profileImageState.url}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="Eliminar foto"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>

          {/* Controles - centrados en móvil, alineados en desktop */}
          <div className="w-full md:flex-1 space-y-4">
            
            {/* Botones - centrados en móvil */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => profileImageRef.current?.click()}
                disabled={profileImageState.uploading}
                className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {hasImage ? 'Cambiar Foto' : 'Subir Foto'}
              </button>

              {hasImage && !profileImageState.uploading && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center justify-center px-6 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
            </div>

            {/* Recomendaciones - centradas en móvil */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-center md:text-left">
              <p>
                <strong>Recomendaciones:</strong>
              </p>
              <ul className="text-xs space-y-1 md:list-disc md:list-inside">
                <li>Usa una foto clara donde se vea bien tu rostro</li>
                <li>Evita fotos muy oscuras o con mucho filtro</li>
                <li>Una sonrisa natural genera más confianza</li>
                <li>Mantén la foto actualizada</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Input oculto */}
        <input
          ref={profileImageRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Vista previa en diferentes contextos */}
        {hasImage && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center md:text-left">
              Vista previa en diferentes tamaños
            </h4>
            <div className="flex items-center justify-center md:justify-start space-x-6">
              <div className="text-center">
                <img
                  src={profileImageState.preview || profileImageState.url}
                  alt="Preview grande"
                  className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600 mx-auto mb-2"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Grande</span>
              </div>
              <div className="text-center">
                <img
                  src={profileImageState.preview || profileImageState.url}
                  alt="Preview mediano"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 mx-auto mb-2"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Mediano</span>
              </div>
              <div className="text-center">
                <img
                  src={profileImageState.preview || profileImageState.url}
                  alt="Preview pequeño"
                  className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600 mx-auto mb-2"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Pequeño</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};