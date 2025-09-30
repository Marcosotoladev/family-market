// src/components/tienda/StoreGallerySection.js
'use client';

import { useState, useEffect } from 'react';
import { Image, X, ChevronLeft, ChevronRight, Loader2, ImageIcon } from 'lucide-react';

export default function StoreGallerySection({ 
  storeData,
  maxImages = null
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadGallery();
  }, [storeData]);

  const loadGallery = () => {
    try {
      setLoading(true);
      
      // Obtener imágenes de galería del storeData
      const galleryImages = storeData?.gallery || [];
      
      // Limitar si se especificó maxImages
      const imagesToShow = maxImages ? galleryImages.slice(0, maxImages) : galleryImages;
      
      setImages(imagesToShow);
    } catch (error) {
      console.error('Error cargando galería:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando galería...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-8 lg:py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Galería
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Conoce más sobre nosotros
            </p>
          </div>
          
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay imágenes en la galería
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Esta tienda aún no ha agregado imágenes a su galería
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="galeria" className="py-8 lg:py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Galería
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Conoce más sobre nosotros a través de nuestras imágenes
            </p>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url || image}
                  alt={image.title || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                  <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Botón Ver más */}
          {maxImages && images.length >= maxImages && storeData?.gallery?.length > maxImages && (
            <div className="text-center mt-8">
              <a
                href={`/tienda/${storeData.storeSlug}/galeria`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Ver todas las imágenes
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navegación */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Imagen */}
          <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url || selectedImage}
              alt={selectedImage.title || `Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {selectedImage.title && (
              <p className="text-white text-center mt-4 text-lg">
                {selectedImage.title}
              </p>
            )}
            {selectedImage.description && (
              <p className="text-gray-300 text-center mt-2">
                {selectedImage.description}
              </p>
            )}
          </div>

          {/* Contador */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}