// src/lib/services/favoritesService.js
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Mapeo de tipos a colecciones en español
const collectionMap = {
  product: {
    items: 'productos',
    favorites: 'favoritos',
    itemIdField: 'productoId'
  },
  service: {
    items: 'servicios',
    favorites: 'favoritos_servicios',
    itemIdField: 'servicioId'
  },
  job: {
    items: 'empleos',
    favorites: 'favoritos_empleos',
    itemIdField: 'empleoId'
  }
};

// Obtener todos los favoritos de un usuario
export const getUserFavorites = async (userId) => {
  try {
    const allFavorites = [];

    // Obtener favoritos de cada tipo
    for (const [itemType, config] of Object.entries(collectionMap)) {
      const favoritesRef = collection(db, config.favorites);
      const q = query(
        favoritesRef,
        where('usuarioId', '==', userId),
        orderBy('fechaCreacion', 'desc')
      );
      
      const snapshot = await getDocs(q);

      // Por cada favorito, obtener la información completa del item
      for (const favoriteDoc of snapshot.docs) {
        const favoriteData = favoriteDoc.data();
        
        // Obtener el item completo
        const itemId = favoriteData[config.itemIdField];
        const itemRef = doc(db, config.items, itemId);
        const itemSnap = await getDoc(itemRef);
        
        let itemData = null;
        
        if (itemSnap.exists()) {
          const rawData = itemSnap.data();
          
          // Normalizar los datos para que tengan la misma estructura
          itemData = {
            title: rawData.titulo || rawData.nombre || 'Sin título',
            description: rawData.descripcion || '',
            price: rawData.precio || null,
            image: rawData.imagen || rawData.imagenes?.[0] || null,
            location: rawData.ubicacion || rawData.localidad || 'N/A',
            userId: rawData.usuarioId
          };
          
          // Obtener información del dueño
          if (rawData.usuarioId) {
            const userRef = doc(db, 'users', rawData.usuarioId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              itemData.ownerName = userData.displayName || 
                                  `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                                  'Desconocido';
              itemData.ownerFamily = userData.familyName || userData.family;
            }
          }
        }

        allFavorites.push({
          id: favoriteDoc.id,
          itemId: itemId,
          itemType: itemType,
          createdAt: favoriteData.fechaCreacion?.toDate() || new Date(),
          itemData: itemData || {
            title: 'Item no disponible',
            description: 'Este elemento ya no existe',
            price: null,
            image: null,
            ownerName: 'Desconocido',
            location: 'N/A'
          }
        });
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    allFavorites.sort((a, b) => b.createdAt - a.createdAt);

    return allFavorites;
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    throw error;
  }
};

// Agregar un favorito
export const addFavorite = async (userId, itemId, itemType) => {
  try {
    const config = collectionMap[itemType];
    if (!config) {
      throw new Error(`Tipo de item inválido: ${itemType}`);
    }

    // Verificar si ya existe
    const favoritesRef = collection(db, config.favorites);
    const q = query(
      favoritesRef,
      where('usuarioId', '==', userId),
      where(config.itemIdField, '==', itemId)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { success: false, message: 'Ya está en favoritos' };
    }

    // Agregar el favorito
    const favoriteData = {
      usuarioId: userId,
      [config.itemIdField]: itemId,
      fechaCreacion: Timestamp.now()
    };

    const docRef = await addDoc(favoritesRef, favoriteData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    throw error;
  }
};

// Eliminar un favorito
export const removeFavorite = async (favoriteId, itemType) => {
  try {
    const config = collectionMap[itemType];
    if (!config) {
      throw new Error(`Tipo de item inválido: ${itemType}`);
    }

    const favoriteRef = doc(db, config.favorites, favoriteId);
    await deleteDoc(favoriteRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    throw error;
  }
};

// Verificar si un item es favorito
export const isFavorite = async (userId, itemId, itemType) => {
  try {
    const config = collectionMap[itemType];
    if (!config) {
      return false;
    }

    const favoritesRef = collection(db, config.favorites);
    const q = query(
      favoritesRef,
      where('usuarioId', '==', userId),
      where(config.itemIdField, '==', itemId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return false;
  }
};

// Obtener el ID del favorito (útil para eliminarlo)
export const getFavoriteId = async (userId, itemId, itemType) => {
  try {
    const config = collectionMap[itemType];
    if (!config) {
      return null;
    }

    const favoritesRef = collection(db, config.favorites);
    const q = query(
      favoritesRef,
      where('usuarioId', '==', userId),
      where(config.itemIdField, '==', itemId)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener ID de favorito:', error);
    return null;
  }
};