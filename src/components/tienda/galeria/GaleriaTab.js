// src/components/tienda/GaleriaTab.js
'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function GaleriaTab({ storeSlug, userId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (userId) {
      loadImages();
    }
  }, [userId]);

  const loadImages = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const galeriaRef = collection(db, 'galeria');
      const q = query(
        galeriaRef,
        where('userId', '==', userId),
        orderBy('fechaCreacion', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const imagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setImages(imagesList);
    } catch (error) {
      console.error('Error cargando galería:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedIndex(0);
  };

  const goToPrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const goToNext = () => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay imágenes en la galería
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Esta tienda aún no ha agregado imágenes a su galería
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => openLightbox(image, index)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <img
              src={image.imageUrl}
              alt={image.titulo}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay con título */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {image.titulo}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2 backdrop-blur-sm transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Botón anterior */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white/80 hover:text-white bg-black/50 rounded-full p-3 backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Botón siguiente */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-3 backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Imagen y título */}
          <div
            className="max-w-5xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.titulo}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-white mb-1">
                {selectedImage.titulo}
              </h3>
              <p className="text-white/60 text-sm">
                {selectedIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}