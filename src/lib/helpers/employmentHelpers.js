// src/lib/helpers/employmentHelpers.js

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  TIPOS_PUBLICACION,
  ESTADOS_PUBLICACION,
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  TIPOS_SALARIO,
  CATEGORIAS_EMPLEO,
  obtenerNombreCategoria,
  obtenerNombreSubcategoria,
  generarSlugEmpleo,

} from '../../types/employment';
import { deleteCV } from '@/lib/services/storageService';

// ================================
// FUNCIONES FIREBASE
// ================================

// Crear nueva publicación de empleo en Firestore
export const createEmployment = async (employmentData) => {
  try {
    console.log('🚀 Enviando a Firestore:', employmentData);
    console.log('📊 Estructura:', {
      hasUsuarioId: !!employmentData.usuarioId,
      hasTipoPublicacion: !!employmentData.tipoPublicacion,
      hasTitulo: !!employmentData.titulo,
      usuarioIdValue: employmentData.usuarioId,
      tipoPublicacionValue: employmentData.tipoPublicacion,
      tituloValue: employmentData.titulo
    });
    
    const docRef = await addDoc(collection(db, 'empleos'), employmentData);
    console.log('✅ Documento creado con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error en createEmployment:', error);
    console.error('❌ Datos que fallaron:', employmentData);
    throw error;
  }
};

// Actualizar publicación existente en Firestore
export const updateEmployment = async (employmentId, employmentData) => {
  try {
    console.log('📝 Actualizando empleo:', employmentId, employmentData);
    
    // Limpiar campos undefined antes de actualizar
    const cleanData = Object.entries(employmentData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const employmentRef = doc(db, 'empleos', employmentId);
    await updateDoc(employmentRef, {
      ...cleanData,
      fechaActualizacion: new Date()
    });
    
    console.log('✅ Empleo actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando empleo:', error);
    throw error;
  }
};

// Eliminar publicación de Firestore
export const deleteEmployment = async (employmentId) => {
  try {
    const employmentRef = doc(db, 'empleos', employmentId);
    await deleteDoc(employmentRef);
    console.log('✅ Documento eliminado:', employmentId);
  } catch (error) {
    console.error('❌ Error eliminando empleo:', error);
    throw error;
  }
};

// Obtener publicación por ID
export const getEmploymentById = async (employmentId) => {
  try {
    const employmentRef = doc(db, 'empleos', employmentId);
    const employmentSnap = await getDoc(employmentRef);
    
    if (employmentSnap.exists()) {
      return {
        id: employmentSnap.id,
        ...employmentSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo empleo:', error);
    throw error;
  }
};

// Obtener todas las publicaciones de un usuario
export const getEmploymentsByUser = async (userId) => {
  try {
    const empleosRef = collection(db, 'empleos');
    const q = query(
      empleosRef,
      where('usuarioId', '==', userId),
      orderBy('fechaCreacion', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error obteniendo empleos del usuario:', error);
    throw error;
  }
};

// ================================
// VALIDACIONES
// ================================

// Validar Oferta de Empleo
export const validarOfertaEmpleo = (oferta) => {
  const errores = [];

  if (!oferta.titulo || oferta.titulo.trim().length < 5) {
    errores.push('El título debe tener al menos 5 caracteres');
  }
  if (oferta.titulo && oferta.titulo.length > 100) {
    errores.push('El título no puede exceder 100 caracteres');
  }

  if (!oferta.descripcion || oferta.descripcion.trim().length < 20) {
    errores.push('La descripción debe tener al menos 20 caracteres');
  }
  if (oferta.descripcion && oferta.descripcion.length > 2000) {
    errores.push('La descripción no puede exceder 2000 caracteres');
  }

  if (!oferta.categoria) {
    errores.push('Debe seleccionar una categoría');
  }

  if (!oferta.modalidad) {
    errores.push('Debe seleccionar una modalidad de trabajo');
  }

  if (oferta.salario?.tipo === TIPOS_SALARIO.FIJO && (!oferta.salario?.minimo || oferta.salario?.minimo <= 0)) {
    errores.push('Debe especificar un salario válido');
  }

  const tieneContacto = oferta.contacto?.whatsapp || oferta.contacto?.telefono || oferta.contacto?.email;
  if (!tieneContacto) {
    errores.push('Debe proporcionar al menos un método de contacto');
  }

  return errores;
};

// ✅ NUEVA: Validar Búsqueda de Empleo
export const validarBusquedaEmpleo = (busqueda) => {
  const errores = [];

  // Validar nombre
  if (!busqueda.nombre || busqueda.nombre.trim().length < 2) {
    errores.push('El nombre es obligatorio');
  }

  // Validar título
  if (!busqueda.titulo || busqueda.titulo.trim().length < 5) {
    errores.push('El título/puesto que buscas debe tener al menos 5 caracteres');
  }
  if (busqueda.titulo && busqueda.titulo.length > 100) {
    errores.push('El título no puede exceder 100 caracteres');
  }

  // Validar categoría
  if (!busqueda.categoria) {
    errores.push('Debes seleccionar una categoría');
  }

  // Validar descripción
  if (!busqueda.descripcion || busqueda.descripcion.trim().length < 20) {
    errores.push('La descripción debe tener al menos 20 caracteres');
  }
  if (busqueda.descripcion && busqueda.descripcion.length > 1000) {
    errores.push('La descripción no puede exceder 1000 caracteres');
  }

  // Validar disponibilidad - tipo de empleo
  if (!busqueda.disponibilidad?.tipoEmpleo || busqueda.disponibilidad.tipoEmpleo.length === 0) {
    errores.push('Selecciona al menos un tipo de empleo');
  }

  // Validar disponibilidad - modalidades
  if (!busqueda.disponibilidad?.modalidades || busqueda.disponibilidad.modalidades.length === 0) {
    errores.push('Selecciona al menos una modalidad de trabajo');
  }

  // Validar contacto
  const tieneContacto = busqueda.contacto?.whatsapp || 
                       busqueda.contacto?.telefono || 
                       busqueda.contacto?.email;
  if (!tieneContacto) {
    errores.push('Debes proporcionar al menos un medio de contacto');
  }

  return errores;
};

// Validar Servicio Profesional
export const validarServicioProfesional = (servicio) => {
  const errores = [];

  if (!servicio.titulo || servicio.titulo.trim().length < 5) {
    errores.push('El título debe tener al menos 5 caracteres');
  }

  if (!servicio.nombreProfesional || servicio.nombreProfesional.trim().length < 3) {
    errores.push('El nombre profesional es requerido');
  }

  if (!servicio.descripcion || servicio.descripcion.trim().length < 20) {
    errores.push('La descripción debe tener al menos 20 caracteres');
  }

  if (!servicio.categoria) {
    errores.push('Debe seleccionar una categoría');
  }

  if (servicio.tarifas?.tipo !== TIPOS_SALARIO.A_CONVENIR && 
      servicio.tarifas?.tipo !== TIPOS_SALARIO.NEGOCIABLE &&
      (!servicio.tarifas?.minimo || servicio.tarifas?.minimo <= 0)) {
    errores.push('Debe especificar una tarifa válida');
  }

  const tieneContacto = servicio.contacto?.whatsapp || servicio.contacto?.telefono || servicio.contacto?.email;
  if (!tieneContacto) {
    errores.push('Debe proporcionar al menos un método de contacto');
  }

  return errores;
};

// ================================
// FILTROS Y BÚSQUEDAS
// ================================

// Filtrar por tipo de publicación
export const filtrarPorTipo = (publicaciones, tipo) => {
  return publicaciones.filter(pub => pub.tipo === tipo);
};

// Filtrar por categoría
export const filtrarPorCategoria = (publicaciones, categoria, subcategoria = null) => {
  return publicaciones.filter(pub => {
    if (pub.categoria !== categoria) return false;
    if (subcategoria && pub.subcategoria !== subcategoria) return false;
    return true;
  });
};

// Filtrar por modalidad
export const filtrarPorModalidad = (publicaciones, modalidad) => {
  return publicaciones.filter(pub => {
    if (pub.modalidad === modalidad) return true;
    if (Array.isArray(pub.disponibilidad?.modalidades)) {
      return pub.disponibilidad.modalidades.includes(modalidad);
    }
    return false;
  });
};

// Filtrar por ubicación
export const filtrarPorUbicacion = (publicaciones, ciudad = '', provincia = '') => {
  return publicaciones.filter(pub => {
    if (!pub.ubicacion) return false;
    
    const ciudadMatch = !ciudad || 
      pub.ubicacion.ciudad?.toLowerCase().includes(ciudad.toLowerCase());
    
    const provinciaMatch = !provincia || 
      pub.ubicacion.provincia?.toLowerCase().includes(provincia.toLowerCase());
    
    return ciudadMatch && provinciaMatch;
  });
};

// Filtrar por rango salarial
export const filtrarPorSalario = (publicaciones, minimo = 0, maximo = Infinity) => {
  return publicaciones.filter(pub => {
    const salarioData = pub.salario || pub.tarifas || pub.preferencias;
    if (!salarioData) return true;

    const salarioMin = salarioData.minimo || 0;
    const salarioMax = salarioData.maximo || Infinity;

    return salarioMax >= minimo && salarioMin <= maximo;
  });
};

// Buscar por texto
export const buscarPublicaciones = (publicaciones, termino) => {
  if (!termino || termino.length < 2) return publicaciones;

  const terminoLimpio = termino
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return publicaciones.filter(pub => {
    const textosBusqueda = [
      pub.titulo,
      pub.descripcion,
      pub.nombreProfesional,
      pub.nombre,
      pub.categoria,
      pub.subcategoria,
      ...(pub.habilidades || []),
      ...(pub.servicios || []),
      ...(pub.especialidades || [])
    ].filter(Boolean);

    const textoCombinado = textosBusqueda
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return textoCombinado.includes(terminoLimpio);
  });
};

// Filtrar activos
export const filtrarActivos = (publicaciones) => {
  return publicaciones.filter(pub => pub.estado === ESTADOS_PUBLICACION.ACTIVO);
};

// Filtrar destacados
export const filtrarDestacados = (publicaciones) => {
  return publicaciones.filter(pub => {
    if (!pub.destacado) return false;
    if (!pub.featuredUntil) return true;
    return new Date(pub.featuredUntil) > new Date();
  });
};

// ================================
// ORDENAMIENTO
// ================================

export const ordenarPublicaciones = (publicaciones, criterio = 'fecha_desc') => {
  const copia = [...publicaciones];

  switch (criterio) {
    case 'fecha_desc':
      return copia.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    
    case 'fecha_asc':
      return copia.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
    
    case 'vistas_desc':
      return copia.sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
    
    case 'titulo':
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
    
    case 'destacado':
      return copia.sort((a, b) => {
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
      });
    
    case 'valoracion':
      return copia.sort((a, b) => {
        const ratingA = a.valoraciones?.promedio || 0;
        const ratingB = b.valoraciones?.promedio || 0;
        return ratingB - ratingA;
      });
    
    default:
      return copia;
  }
};

// ================================
// APLICAR MÚLTIPLES FILTROS
// ================================

export const aplicarFiltros = (publicaciones, filtros = {}) => {
  let resultado = [...publicaciones];

  if (filtros.tipo) {
    resultado = filtrarPorTipo(resultado, filtros.tipo);
  }

  if (filtros.categoria) {
    resultado = filtrarPorCategoria(resultado, filtros.categoria, filtros.subcategoria);
  }

  if (filtros.modalidad) {
    resultado = filtrarPorModalidad(resultado, filtros.modalidad);
  }

  if (filtros.ciudad || filtros.provincia) {
    resultado = filtrarPorUbicacion(resultado, filtros.ciudad, filtros.provincia);
  }

  if (filtros.salarioMin || filtros.salarioMax) {
    resultado = filtrarPorSalario(resultado, filtros.salarioMin, filtros.salarioMax);
  }

  if (filtros.busqueda) {
    resultado = buscarPublicaciones(resultado, filtros.busqueda);
  }

  if (filtros.soloActivos) {
    resultado = filtrarActivos(resultado);
  }

  if (filtros.soloDestacados) {
    resultado = filtrarDestacados(resultado);
  }

  resultado = ordenarPublicaciones(resultado, filtros.orden || 'destacado');

  return resultado;
};

// ================================
// UTILIDADES ADICIONALES
// ================================

// Verificar si una publicación está vigente
export const estaVigente = (publicacion) => {
  if (publicacion.estado !== ESTADOS_PUBLICACION.ACTIVO) return false;
  if (!publicacion.destacado) return true;
  if (!publicacion.featuredUntil) return true;
  return new Date(publicacion.featuredUntil) > new Date();
};

// Incrementar vistas
export const incrementarVistas = async (publicacionId, db) => {
  const { doc, updateDoc, increment } = await import('firebase/firestore');
  const docRef = doc(db, 'empleos', publicacionId);
  await updateDoc(docRef, {
    vistas: increment(1)
  });
};

// Generar mensaje de WhatsApp
export const generarMensajeWhatsApp = (publicacion) => {
  const tipos = {
    [TIPOS_PUBLICACION.OFERTA_EMPLEO]: 'la oferta de empleo',
    [TIPOS_PUBLICACION.BUSQUEDA_EMPLEO]: 'tu perfil profesional',
    [TIPOS_PUBLICACION.SERVICIO_PROFESIONAL]: 'tu servicio'
  };

  return `Hola! Me interesa ${tipos[publicacion.tipo]}: ${publicacion.titulo}`;
};

/**
 * Elimina una búsqueda de empleo y su CV asociado
 * @param {string} busquedaId - ID de la búsqueda a eliminar
 * @param {string} userId - ID del usuario propietario
 * @returns {Promise<void>}
 */

export const eliminarBusquedaEmpleo = async (busquedaId, userId) => {
  try {
    // Obtener la búsqueda antes de eliminarla para acceder al path del CV
    const busquedaRef = doc(db, 'empleos', busquedaId);
    const busquedaDoc = await getDoc(busquedaRef);
    
    if (!busquedaDoc.exists()) {
      throw new Error('La búsqueda no existe');
    }
    
    const busquedaData = busquedaDoc.data();
    
    // Verificar que el usuario sea el propietario
    if (busquedaData.usuarioId !== userId) {
      throw new Error('No tienes permisos para eliminar esta búsqueda');
    }
    
    // Eliminar el CV del Storage si existe
    if (busquedaData.cv?.path) {
      try {
        await deleteCV(busquedaData.cv.path);
        console.log('CV eliminado del Storage');
      } catch (error) {
        console.error('Error al eliminar CV del Storage:', error);
        // Continuar con la eliminación del documento aunque falle el Storage
      }
    }
    
    // Eliminar el documento de Firestore
    await deleteDoc(busquedaRef);
    console.log('Búsqueda de empleo eliminada exitosamente');
    
  } catch (error) {
    console.error('Error al eliminar búsqueda de empleo:', error);
    throw error;
  }
};