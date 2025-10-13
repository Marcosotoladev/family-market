// src/lib/hooks/useFavorites.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useFavorites() {
  const { userData } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para verificar si un item existe
  const checkItemExists = async (itemType, itemId) => {
    try {
      let collectionName;
      switch (itemType) {
        case 'product': collectionName = 'products'; break;
        case 'service': collectionName = 'services'; break;
        case 'job': collectionName = 'jobs'; break;
        default: return false;
      }

      const itemRef = doc(db, collectionName, itemId);
      const itemSnap = await getDoc(itemRef);
      return itemSnap.exists();
    } catch (error) {
      console.error('Error verificando item:', error);
      return false;
    }
  };

  // Cargar favoritos con validación
  const loadFavorites = useCallback(async () => {
    if (!userData?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', userData.uid));
      const querySnapshot = await getDocs(q);

      const favoritesData = [];

      // Validar cada favorito
      for (const favoriteDoc of querySnapshot.docs) {
        const favorite = { id: favoriteDoc.id, ...favoriteDoc.data() };
        
        // Verificar si el item existe
        const exists = await checkItemExists(favorite.itemType, favorite.itemId);
        
        if (exists) {
          // Si existe, agregarlo
          favoritesData.push(favorite);
        } else {
          // Si no existe, eliminarlo silenciosamente
          await deleteDoc(doc(db, 'favorites', favorite.id));
          console.log(`Favorito eliminado (item no existe): ${favorite.id}`);
        }
      }

      setFavorites(favoritesData);

    } catch (err) {
      console.error('Error cargando favoritos:', err);
      setError('Error al cargar favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userData?.uid]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Agregar a favoritos
  const addFavorite = async (itemType, itemId, itemData) => {
    if (!userData?.uid) throw new Error('Usuario no autenticado');

    // Verificar que el item existe
    const exists = await checkItemExists(itemType, itemId);
    if (!exists) throw new Error('El elemento ya no existe');

    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', userData.uid),
        where('itemId', '==', itemId),
        where('itemType', '==', itemType)
      );
      const existingFavorites = await getDocs(q);

      if (!existingFavorites.empty) {
        throw new Error('Ya está en favoritos');
      }

      const docRef = await addDoc(favoritesRef, {
        userId: userData.uid,
        itemId,
        itemType,
        itemData: {
          title: itemData.title || itemData.name,
          description: itemData.description,
          price: itemData.price,
          image: itemData.images?.[0] || itemData.image,
          location: itemData.location || itemData.city,
          ownerName: itemData.ownerName || itemData.userName,
          storeSlug: itemData.storeSlug
        },
        createdAt: serverTimestamp()
      });

      const newFavorite = {
        id: docRef.id,
        userId: userData.uid,
        itemId,
        itemType,
        itemData: {
          title: itemData.title || itemData.name,
          description: itemData.description,
          price: itemData.price,
          image: itemData.images?.[0] || itemData.image,
          location: itemData.location || itemData.city,
          ownerName: itemData.ownerName || itemData.userName,
          storeSlug: itemData.storeSlug
        }
      };

      setFavorites(prev => [...prev, newFavorite]);
      return docRef.id;

    } catch (error) {
      console.error('Error agregando favorito:', error);
      throw error;
    }
  };

  // Remover favorito
  const removeFavorite = async (itemType, itemId) => {
    if (!userData?.uid) throw new Error('Usuario no autenticado');

    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', userData.uid),
        where('itemId', '==', itemId),
        where('itemType', '==', itemType)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const favoriteDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, 'favorites', favoriteDoc.id));
        
        setFavorites(prev => 
          prev.filter(fav => !(fav.itemId === itemId && fav.itemType === itemType))
        );
      }
    } catch (error) {
      console.error('Error removiendo favorito:', error);
      throw error;
    }
  };

  // Remover por ID
  const removeFavoriteById = async (favoriteId) => {
    if (!userData?.uid) throw new Error('Usuario no autenticado');

    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removiendo favorito:', error);
      throw error;
    }
  };

  // Verificar si es favorito
  const isFavorite = (itemType, itemId) => {
    return favorites.some(
      fav => fav.itemId === itemId && fav.itemType === itemType
    );
  };

  // Contar por tipo
  const getFavoritesByType = (type) => {
    if (type === 'all') return favorites.length;
    return favorites.filter(fav => fav.itemType === type).length;
  };

  // Verificar si un item es favorito (función asíncrona para compatibilidad)
  const checkIsFavorite = async (itemId, itemType) => {
    return favorites.some(
      fav => fav.itemId === itemId && fav.itemType === itemType
    );
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    removeFavoriteById,
    isFavorite,
    checkIsFavorite,
    getFavoritesByType,
    refreshFavorites: loadFavorites
  };
}