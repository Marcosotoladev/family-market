// src/components/ui/FavoriteButton.js
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';

export default function FavoriteButton({ 
  itemId, 
  itemType, // 'product', 'service', 'job'
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
  showToast = false // Si quieres mostrar notificaciones
}) {
  const { user } = useAuth();
  const { addFavorite, removeFavorite, checkIsFavorite, favorites } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si es favorito al montar
  useEffect(() => {
    if (user?.uid && itemId) {
      checkIsFavorite(itemId, itemType).then(setIsFavorite);
    }
  }, [user?.uid, itemId, itemType]);

  // Actualizar estado cuando cambie la lista de favoritos
  useEffect(() => {
    if (favorites) {
      const found = favorites.some(
        f => f.itemId === itemId && f.itemType === itemType
      );
      setIsFavorite(found);
    }
  }, [favorites, itemId, itemType]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.uid) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Eliminar favorito
        await removeFavorite(itemId, itemType);
        setIsFavorite(false);
        if (showToast) {
          console.log('Eliminado de favoritos');
        }
      } else {
        const result = await addFavorite(itemId, itemType);
        if (result.success) {
          setIsFavorite(true);
          if (showToast) {
            console.log('Agregado a favoritos');
          }
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      alert('Hubo un error. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        bg-white/90 dark:bg-gray-800/90 
        backdrop-blur-sm rounded-full 
        transition-all duration-200
        hover:bg-white dark:hover:bg-gray-800
        hover:scale-110
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isFavorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${className}
      `}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart 
        className={`${iconSizes[size]} transition-all ${
          isFavorite ? 'fill-current' : ''
        }`}
      />
    </button>
  );
}