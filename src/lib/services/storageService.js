// src/lib/services/storageService.js
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

/**
 * Sube un archivo PDF a Firebase Storage
 * @param {File} file - Archivo PDF a subir
 * @param {string} userId - ID del usuario
 * @returns {Promise<{url: string, path: string, nombre: string, size: number}>}
 */
export const uploadCV = async (file, userId) => {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('El archivo debe ser un PDF');
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB límite
    throw new Error('El archivo no debe superar los 10MB');
  }

  try {
    // Crear path único para el archivo
    const timestamp = Date.now();
    const fileName = `CV_${timestamp}.pdf`;
    const storagePath = `cvs/${userId}/${fileName}`;
    
    // Crear referencia en Storage
    const storageRef = ref(storage, storagePath);
    
    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: 'application/pdf',
      customMetadata: {
        originalName: file.name,
        uploadedBy: userId,
        uploadDate: new Date().toISOString()
      }
    });
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: storagePath,
      nombre: file.name,
      size: file.size
    };
  } catch (error) {
    console.error('Error al subir CV:', error);
    throw new Error('No se pudo subir el CV. Por favor, intenta nuevamente.');
  }
};

/**
 * Elimina un CV de Firebase Storage
 * @param {string} path - Path del archivo en Storage
 */
export const deleteCV = async (path) => {
  if (!path) return;
  
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('CV eliminado exitosamente');
  } catch (error) {
    // Si el archivo no existe, no es un error crítico
    if (error.code === 'storage/object-not-found') {
      console.log('El archivo CV ya no existe en Storage');
    } else {
      console.error('Error al eliminar CV:', error);
      throw error;
    }
  }
};

/**
 * Verifica si un CV existe en Storage
 * @param {string} path - Path del archivo en Storage
 * @returns {Promise<boolean>}
 */
export const checkCVExists = async (path) => {
  if (!path) return false;
  
  try {
    const storageRef = ref(storage, path);
    await getMetadata(storageRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    throw error;
  }
};