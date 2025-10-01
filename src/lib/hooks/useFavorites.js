// src/lib/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserFavorites, 
  addFavorite as addFavoriteService,
  removeFavorite as removeFavoriteService,
  isFavorite as isFavoriteService,
  getFavoriteId
} from '@/lib/services/favoritesService';

export const useFavorites = () => {
  const { user, userData } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar favoritos al montar
  const loadFavorites = useCallback(async () => {
    if (!user?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserFavorites(user.uid);
      setFavorites(data);
    } catch (err) {
      console.error('Error cargando favoritos:', err);
      setError('Error al cargar los favoritos');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Agregar favorito
  const addFavorite = async (itemId, itemType) => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const result = await addFavoriteService(user.uid, itemId, itemType);
      if (result.success) {
        // Recargar la lista
        await loadFavorites();
      }
      return result;
    } catch (err) {
      console.error('Error agregando favorito:', err);
      throw err;
    }
  };

  // Eliminar favorito por ID
  const removeFavoriteById = async (favoriteId, itemType) => {
    try {
      await removeFavoriteService(favoriteId, itemType);
      // Actualizar el estado local inmediatamente
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (err) {
      console.error('Error eliminando favorito:', err);
      throw err;
    }
  };

  // Eliminar favorito por itemId e itemType
  const removeFavorite = async (itemId, itemType) => {
    if (!user?.uid) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Primero obtener el ID del favorito
      const favoriteId = await getFavoriteId(user.uid, itemId, itemType);
      
      if (favoriteId) {
        await removeFavoriteById(favoriteId, itemType);
      }
    } catch (err) {
      console.error('Error eliminando favorito:', err);
      throw err;
    }
  };

  // Verificar si es favorito
  const checkIsFavorite = async (itemId, itemType) => {
    if (!user?.uid) return false;
    return await isFavoriteService(user.uid, itemId, itemType);
  };

  // Obtener contador por tipo
  const getFavoritesByType = (type) => {
    if (type === 'all') return favorites.length;
    return favorites.filter(f => f.itemType === type).length;
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    removeFavoriteById,
    checkIsFavorite,
    getFavoritesByType,
    refreshFavorites: loadFavorites
  };
};