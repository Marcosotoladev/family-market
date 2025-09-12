// src/components/profile/ImageUploadSection.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadSection({ imageStates, setImageStates, showMessage }) {
  const { user, refreshUserData } = useAuth();
  
  const profileImageRef = useRef(null);
  const storeLogoRef = useRef(null);

  // Función para subir imagen a Cloudinary
  const uploadToCloudinary = async (file, preset) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    
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
  const handleFileSelect = async (event, imageType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Por favor selecciona un archivo de imagen válido');
      return;
    }

    try {
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageStates(prev => ({
          ...prev,
          [imageType]: {
            ...prev[imageType],
            preview: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);

      // Iniciar estado de carga
      setImageStates(prev => ({
        ...prev,
        [imageType]: {
          ...prev[imageType],
          uploading: true
        }
      }));

      // Determinar el preset según el tipo de imagen
      const preset = imageType === 'profileImage' 
        ? process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PROFILE
        : process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_STORE_LOGO;

      // Subir a Cloudinary
      const imageUrl = await uploadToCloudinary(file, preset);

      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        [imageType]: imageUrl,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setImageStates(prev => ({
        ...prev,
        [imageType]: {
          url: imageUrl,
          uploading: false,
          preview: null
        }
      }));

      // Refrescar datos del usuario
      await refreshUserData();

      showMessage('success', `${imageType === 'profileImage' ? 'Foto de perfil' : 'Logo de tienda'} actualizado correctamente`);

    } catch (error) {
      console.error('Error al subir imagen:', error);
      setImageStates(prev => ({
        ...prev,
        [imageType]: {
          ...prev[imageType],
          uploading: false,
          preview: null
        }
      }));
      showMessage('error', `Error al subir la imagen: ${error.message}`);
    }

    // Limpiar input
    event.target.value = '';
  };

  // Eliminar imagen
  const handleRemoveImage = async (imageType) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [imageType]: null,
        updatedAt: new Date()
      });

      setImageStates(prev => ({
        ...prev,
        [imageType]: {
          url: '',
          uploading: false,
          preview: null
        }
      }));

      await refreshUserData();

      showMessage('success', `${imageType === 'profileImage' ? 'Foto de perfil' : 'Logo de tienda'} eliminado correctamente`);

    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      showMessage('error', `Error al eliminar la imagen: ${error.message}`);
    }
  };

  // Componente para cada tipo de imagen
  const ImageUploadBox = ({ type, title, description, isCircular = false }) => {
    const imageData = imageStates[type];
    const hasImage = imageData.url || imageData.preview;

    return (
      <div className="space-y-4">
        {/* Título y descripción */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* NUEVO LAYOUT MÓVIL: Todo centrado y en columna */}
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
          
          {/* Imagen - siempre centrada */}
          <div className={`
            relative flex-shrink-0
            ${isCircular ? 'w-24 h-24 rounded-full' : 'w-32 h-20 rounded-lg'}
            ${hasImage ? '' : 'border-2 border-dashed border-gray-300 dark:border-gray-600'}
            overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center
          `}>
            {imageData.uploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-1" />
                <span className="text-xs text-gray-500">Subiendo...</span>
              </div>
            ) : hasImage ? (
              <>
                <img
                  src={imageData.preview || imageData.url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(type)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Eliminar imagen"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Controles - centrados en móvil, alineados en desktop */}
          <div className="w-full md:flex-1 space-y-3">
            
            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => {
                  if (type === 'profileImage') {
                    profileImageRef.current?.click();
                  } else {
                    storeLogoRef.current?.click();
                  }
                }}
                disabled={imageData.uploading}
                className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {hasImage ? 'Cambiar' : 'Subir'} {title.toLowerCase()}
              </button>

              {hasImage && !imageData.uploading && (
                <button
                  onClick={() => handleRemoveImage(type)}
                  className="flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
            </div>

            {/* Recomendaciones */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
              <p className="mb-1">Formatos compatibles: JPG, PNG</p>
              {isCircular ? (
                <>
                  <p>• Usa una foto cara donde se vea bien tu rostro</p>
                  <p>• Una foto fácil muy oscura o con mucho filtro</p>
                  <p>• Una sonrisa natural genera más confianza</p>
                  <p>• Mantén la foto actualizada</p>
                </>
              ) : (
                <>
                  <p>• Logo en alta resolución (mínimo 300x200px)</p>
                  <p>• Fondo transparente o uniforme</p>
                  <p>• Evita logos muy complejos o con texto pequeño</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Input oculto */}
        <input
          ref={type === 'profileImage' ? profileImageRef : storeLogoRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, type)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Camera className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Fotos y Logos
        </h2>
      </div>

      <div className="space-y-8">
        {/* Foto de Perfil */}
        <ImageUploadBox
          type="profileImage"
          title="Foto de Perfil"
          description="Esta imagen aparecerá en tu perfil público y en tus publicaciones"
          isCircular={true}
        />

        {/* Separador */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Logo de Tienda */}
        <ImageUploadBox
          type="storeLogo"
          title="Logo de Tienda"
          description="Logo que aparecerá en tu tienda online y materiales promocionales (opcional)"
          isCircular={false}
        />
      </div>
    </div>
  );
}