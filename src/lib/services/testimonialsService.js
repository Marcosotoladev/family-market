// src/lib/services/testimonialsService.js
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const TESTIMONIALS_COLLECTION = 'testimonials';

/**
 * Agregar un nuevo testimonio
 */
export const addTestimonial = async (testimonialData) => {
  try {
    const docRef = await addDoc(collection(db, TESTIMONIALS_COLLECTION), {
      ...testimonialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      featured: false, // Por defecto no destacado
      approved: true, // Por defecto aprobado (puedes cambiar esto si quieres moderación)
    });
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error al agregar testimonio:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener todos los testimonios
 */
export const getTestimonials = async (filters = {}) => {
  try {
    let q = collection(db, TESTIMONIALS_COLLECTION);
    
    // Aplicar filtros si existen
    const constraints = [];
    
    if (filters.approved !== undefined) {
      constraints.push(where('approved', '==', filters.approved));
    }
    
    if (filters.featured !== undefined) {
      constraints.push(where('featured', '==', filters.featured));
    }
    
    if (filters.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }
    
    // Ordenar por fecha de creación descendente
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    if (constraints.length > 0) {
      q = query(collection(db, TESTIMONIALS_COLLECTION), ...constraints);
    }
    
    const snapshot = await getDocs(q);
    const testimonials = [];
    
    snapshot.forEach((doc) => {
      testimonials.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return testimonials;
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    return [];
  }
};

/**
 * Suscribirse a cambios en testimonios en tiempo real
 */
export const subscribeToTestimonials = (callback, filters = {}) => {
  let q = collection(db, TESTIMONIALS_COLLECTION);
  
  const constraints = [];
  
  if (filters.approved !== undefined) {
    constraints.push(where('approved', '==', filters.approved));
  }
  
  if (filters.featured !== undefined) {
    constraints.push(where('featured', '==', filters.featured));
  }
  
  // Ordenar por fecha de creación descendente
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  if (constraints.length > 0) {
    q = query(collection(db, TESTIMONIALS_COLLECTION), ...constraints);
  }
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const testimonials = [];
    snapshot.forEach((doc) => {
      testimonials.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(testimonials);
  }, (error) => {
    console.error('Error en suscripción a testimonios:', error);
    callback([]);
  });
  
  return unsubscribe;
};

/**
 * Actualizar un testimonio
 */
export const updateTestimonial = async (testimonialId, updates) => {
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error al actualizar testimonio:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Eliminar un testimonio
 */
export const deleteTestimonial = async (testimonialId) => {
  try {
    await deleteDoc(doc(db, TESTIMONIALS_COLLECTION, testimonialId));
    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Marcar/desmarcar testimonio como destacado
 */
export const toggleFeaturedTestimonial = async (testimonialId, featured) => {
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
    await updateDoc(docRef, {
      featured: featured,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error al cambiar estado destacado:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Aprobar/desaprobar testimonio (para moderación)
 */
export const toggleApproveTestimonial = async (testimonialId, approved) => {
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
    await updateDoc(docRef, {
      approved: approved,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error al cambiar estado de aprobación:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener testimonio por ID
 */
export const getTestimonialById = async (testimonialId) => {
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener testimonio:', error);
    return null;
  }
};

/**
 * Verificar si un usuario ya dejó un testimonio
 */
export const hasUserTestimonial = async (userId) => {
  try {
    const q = query(
      collection(db, TESTIMONIALS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error al verificar testimonio de usuario:', error);
    return false;
  }
};

/**
 * Obtener estadísticas de testimonios
 */
export const getTestimonialStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, TESTIMONIALS_COLLECTION));
    
    let totalRating = 0;
    let count = 0;
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating) {
        totalRating += data.rating;
        count++;
        ratingDistribution[data.rating] = (ratingDistribution[data.rating] || 0) + 1;
      }
    });
    
    return {
      averageRating: count > 0 ? (totalRating / count).toFixed(1) : 0,
      totalReviews: count,
      ratingDistribution
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};