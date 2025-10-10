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

// ================================
// FUNCIONES FIREBASE (NUEVAS)
// ================================

// Crear nueva publicación de empleo en Firestore
export const createEmployment = async (employmentData) => {
  try {
    // 🔍 LOG: Verificar antes de enviar a Firestore
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
// CREAR PUBLICACIONES
// ================================

// Crear Oferta de Empleo
export const crearOfertaEmpleo = ({
  id,
  usuarioId,
  tiendaId,
  titulo,
  descripcion,
  categoria,
  subcategoria = null,
  tipoEmpleo,
  modalidad,
  experienciaRequerida = null,
  requisitos = [],
  habilidades = [],
  horario = {},
  salario = {},
  ubicacion = {},
  contacto = {},
  fechaCreacion = new Date()
}) => {
  if (!id || !usuarioId || !titulo || !descripcion || !categoria || !modalidad) {
    throw new Error('Campos requeridos faltantes para Oferta de Empleo');
  }

  return {
    id,
    tipo: TIPOS_PUBLICACION.OFERTA_EMPLEO,
    usuarioId,
    tiendaId: tiendaId || usuarioId,
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    categoria,
    subcategoria,
    tipoEmpleo,
    modalidad,
    experienciaRequerida,
    requisitos: Array.isArray(requisitos) ? requisitos : [],
    habilidades: Array.isArray(habilidades) ? habilidades : [],
    horario: {
      dias: Array.isArray(horario.dias) ? horario.dias : [],
      turnos: Array.isArray(horario.turnos) ? horario.turnos : [],
      horaInicio: horario.horaInicio || '',
      horaFin: horario.horaFin || '',
      flexible: horario.flexible || false
    },
    salario: {
      tipo: salario.tipo || TIPOS_SALARIO.MENSUAL,
      minimo: salario.minimo ? parseFloat(salario.minimo) : null,
      maximo: salario.maximo ? parseFloat(salario.maximo) : null,
      moneda: salario.moneda || 'ARS',
      beneficios: Array.isArray(salario.beneficios) ? salario.beneficios : []
    },
    ubicacion: {
      direccion: ubicacion.direccion || '',
      ciudad: ubicacion.ciudad || '',
      provincia: ubicacion.provincia || '',
      pais: ubicacion.pais || 'Argentina',
      coordenadas: ubicacion.coordenadas || null
    },
    contacto: {
      whatsapp: contacto.whatsapp || '',
      telefono: contacto.telefono || '',
      email: contacto.email || '',
      preferencia: contacto.preferencia || 'whatsapp'
    },
    estado: ESTADOS_PUBLICACION.ACTIVO,
    destacado: false,
    featuredUntil: null,
    fechaCreacion,
    fechaActualizacion: new Date(),
    vistas: 0,
    postulaciones: 0,
    slug: generarSlugEmpleo(titulo, TIPOS_PUBLICACION.OFERTA_EMPLEO, id)
  };
};

// Crear Búsqueda de Empleo
export const crearBusquedaEmpleo = ({
  id,
  usuarioId,
  tiendaId,
  nombre,
  apellido,
  edad = null,
  foto = '',
  titulo,
  descripcion,
  categorias = [],
  experiencia = {},
  habilidades = [],
  disponibilidad = {},
  preferencias = {},
  ubicacion = {},
  curriculum = {},
  contacto = {},
  fechaCreacion = new Date()
}) => {
  if (!id || !usuarioId || !titulo || !descripcion || categorias.length === 0) {
    throw new Error('Campos requeridos faltantes para Búsqueda de Empleo');
  }

  return {
    id,
    tipo: TIPOS_PUBLICACION.BUSQUEDA_EMPLEO,
    usuarioId,
    tiendaId: tiendaId || usuarioId,
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    edad: edad ? parseInt(edad) : null,
    foto,
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    objetivoLaboral: descripcion.trim(),
    categorias: Array.isArray(categorias) ? categorias : [],
    subcategorias: [],
    experiencia: {
      nivel: experiencia.nivel || '',
      años: experiencia.años ? parseInt(experiencia.años) : 0,
      trabajosAnteriores: Array.isArray(experiencia.trabajosAnteriores) ? experiencia.trabajosAnteriores : [],
      descripcionExperiencia: experiencia.descripcionExperiencia || ''
    },
    educacion: {
      nivel: '',
      estudios: [],
      certificaciones: []
    },
    habilidades: Array.isArray(habilidades) ? habilidades : [],
    idiomas: [],
    disponibilidad: {
      tiposEmpleo: Array.isArray(disponibilidad.tiposEmpleo) ? disponibilidad.tiposEmpleo : [],
      modalidades: Array.isArray(disponibilidad.modalidades) ? disponibilidad.modalidades : [],
      diasDisponibles: Array.isArray(disponibilidad.diasDisponibles) ? disponibilidad.diasDisponibles : [],
      horarios: Array.isArray(disponibilidad.horarios) ? disponibilidad.horarios : [],
      inmediata: disponibilidad.inmediata || false,
      fechaDisponible: disponibilidad.fechaDisponible || null
    },
    preferencias: {
      salarioMinimo: preferencias.salarioMinimo ? parseFloat(preferencias.salarioMinimo) : null,
      salarioMaximo: preferencias.salarioMaximo ? parseFloat(preferencias.salarioMaximo) : null,
      zonas: Array.isArray(preferencias.zonas) ? preferencias.zonas : [],
      beneficiosDeseados: Array.isArray(preferencias.beneficiosDeseados) ? preferencias.beneficiosDeseados : []
    },
    ubicacion: {
      ciudad: ubicacion.ciudad || '',
      provincia: ubicacion.provincia || '',
      pais: ubicacion.pais || 'Argentina',
      dispuestoMudar: ubicacion.dispuestoMudar || false
    },
    curriculum: {
      url: curriculum.url || '',
      nombre: curriculum.nombre || '',
      tamaño: curriculum.tamaño || 0
    },
    contacto: {
      whatsapp: contacto.whatsapp || '',
      telefono: contacto.telefono || '',
      email: contacto.email || '',
      linkedin: contacto.linkedin || '',
      portfolio: contacto.portfolio || ''
    },
    estado: ESTADOS_PUBLICACION.ACTIVO,
    destacado: false,
    featuredUntil: null,
    fechaCreacion,
    fechaActualizacion: new Date(),
    vistas: 0,
    slug: generarSlugEmpleo(titulo, TIPOS_PUBLICACION.BUSQUEDA_EMPLEO, id)
  };
};

// Crear Servicio Profesional
export const crearServicioProfesional = ({
  id,
  usuarioId,
  tiendaId,
  titulo,
  nombreProfesional,
  foto = '',
  descripcion,
  categoria,
  subcategoria = null,
  especialidades = [],
  experiencia = {},
  servicios = [],
  tarifas = {},
  disponibilidad = {},
  ubicacion = {},
  portfolio = {},
  contacto = {},
  fechaCreacion = new Date()
}) => {
  if (!id || !usuarioId || !titulo || !descripcion || !categoria) {
    throw new Error('Campos requeridos faltantes para Servicio Profesional');
  }

  return {
    id,
    tipo: TIPOS_PUBLICACION.SERVICIO_PROFESIONAL,
    usuarioId,
    tiendaId: tiendaId || usuarioId,
    titulo: titulo.trim(),
    nombreProfesional: nombreProfesional.trim(),
    foto,
    descripcion: descripcion.trim(),
    categoria,
    subcategoria,
    especialidades: Array.isArray(especialidades) ? especialidades : [],
    experiencia: {
      años: experiencia.años ? parseInt(experiencia.años) : 0,
      nivel: experiencia.nivel || '',
      descripcion: experiencia.descripcion || ''
    },
    servicios: Array.isArray(servicios) ? servicios : [],
    certificaciones: [],
    titulos: [],
    tarifas: {
      tipo: tarifas.tipo || TIPOS_SALARIO.POR_SERVICIO,
      minimo: tarifas.minimo ? parseFloat(tarifas.minimo) : null,
      maximo: tarifas.maximo ? parseFloat(tarifas.maximo) : null,
      moneda: tarifas.moneda || 'ARS',
      detalles: tarifas.detalles || ''
    },
    disponibilidad: {
      modalidades: Array.isArray(disponibilidad.modalidades) ? disponibilidad.modalidades : [],
      diasDisponibles: Array.isArray(disponibilidad.diasDisponibles) ? disponibilidad.diasDisponibles : [],
      horarios: Array.isArray(disponibilidad.horarios) ? disponibilidad.horarios : [],
      zonasCobertura: Array.isArray(disponibilidad.zonasCobertura) ? disponibilidad.zonasCobertura : []
    },
    ubicacion: {
      direccion: ubicacion.direccion || '',
      ciudad: ubicacion.ciudad || '',
      provincia: ubicacion.provincia || '',
      pais: ubicacion.pais || 'Argentina',
      atendeADomicilio: ubicacion.atendeADomicilio || false,
      zonaCobertura: Array.isArray(ubicacion.zonaCobertura) ? ubicacion.zonaCobertura : []
    },
    portfolio: {
      imagenes: Array.isArray(portfolio.imagenes) ? portfolio.imagenes : [],
      videos: Array.isArray(portfolio.videos) ? portfolio.videos : [],
      descripcionTrabajos: portfolio.descripcionTrabajos || ''
    },
    contacto: {
      whatsapp: contacto.whatsapp || '',
      telefono: contacto.telefono || '',
      email: contacto.email || '',
      sitioWeb: contacto.sitioWeb || '',
      redesSociales: {
        facebook: contacto.redesSociales?.facebook || '',
        instagram: contacto.redesSociales?.instagram || '',
        linkedin: contacto.redesSociales?.linkedin || ''
      }
    },
    estado: ESTADOS_PUBLICACION.ACTIVO,
    destacado: false,
    featuredUntil: null,
    valoraciones: {
      promedio: 0,
      total: 0,
      distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    },
    fechaCreacion,
    fechaActualizacion: new Date(),
    vistas: 0,
    contactos: 0,
    slug: generarSlugEmpleo(titulo, TIPOS_PUBLICACION.SERVICIO_PROFESIONAL, id)
  };
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

// Validar Búsqueda de Empleo
export const validarBusquedaEmpleo = (busqueda) => {
  const errores = [];

  if (!busqueda.nombre || busqueda.nombre.trim().length < 2) {
    errores.push('El nombre es requerido');
  }

  if (!busqueda.titulo || busqueda.titulo.trim().length < 5) {
    errores.push('El título profesional debe tener al menos 5 caracteres');
  }

  if (!busqueda.descripcion || busqueda.descripcion.trim().length < 20) {
    errores.push('La descripción debe tener al menos 20 caracteres');
  }

  if (!Array.isArray(busqueda.categorias) || busqueda.categorias.length === 0) {
    errores.push('Debe seleccionar al menos una categoría de interés');
  }

  const tieneContacto = busqueda.contacto?.whatsapp || busqueda.contacto?.telefono || busqueda.contacto?.email;
  if (!tieneContacto) {
    errores.push('Debe proporcionar al menos un método de contacto');
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
// AUTO-COMPLETAR DATOS
// ================================

export const autoCompletarDatosPublicacion = (publicacionData, storeData, userData) => {
  const tiendaInfo = {
    nombre: storeData?.businessName || storeData?.familyName || userData?.displayName || '',
    slug: storeData?.storeSlug || '',
    logo: storeData?.storeLogo || storeData?.profileImage || userData?.photoURL || ''
  };

  const contactoBase = {
    whatsapp: storeData?.phone || userData?.phoneNumber || '',
    telefono: storeData?.phone || userData?.phoneNumber || '',
    email: storeData?.email || userData?.email || ''
  };

  return {
    ...publicacionData,
    tiendaInfo,
    contacto: {
      ...contactoBase,
      ...publicacionData.contacto
    }
  };
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