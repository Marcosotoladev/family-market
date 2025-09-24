// src/lib/helpers/serviceHelpers.js

import { CATEGORIAS_SERVICIOS } from '../../types/services.js';
import { 
  ESTADOS_SERVICIO,
  TIPOS_PRECIO_SERVICIO,
  MODALIDAD_SERVICIO,
  GESTION_CUPOS,
  validarServicio,
  generarSlugServicio
} from '../../types/services.js';

// Crear servicio con validaciones
export const crearServicio = ({
  id,
  tiendaId,
  usuarioId,
  titulo,
  descripcion,
  precio,
  tipoPrecio = TIPOS_PRECIO_SERVICIO.FIJO,
  categoria,
  subcategoria = null,
  modalidad = MODALIDAD_SERVICIO.PRESENCIAL,
  duracion = null,
  duracionPersonalizada = '',
  gestionCupos = GESTION_CUPOS.ILIMITADO,
  cuposDisponibles = null,
  diasDisponibles = [],
  horarios = [],
  horarioPersonalizado = '',
  imagenes = [],
  estado = ESTADOS_SERVICIO.DISPONIBLE,
  palabrasClave = [],
  ubicacion = '',
  fechaCreacion = new Date(),
  fechaActualizacion = new Date()
}) => {
  // Validaciones básicas
  if (!id || !tiendaId || !usuarioId || !titulo || !descripcion) {
    throw new Error('ID, tiendaId, usuarioId, título y descripción son requeridos');
  }

  return {
    id,
    tiendaId,
    usuarioId,
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    precio: precio ? parseFloat(precio) : 0,
    tipoPrecio,
    categoria,
    subcategoria,
    modalidad,
    duracion,
    duracionPersonalizada,
    gestionCupos,
    cuposDisponibles: cuposDisponibles !== null ? parseInt(cuposDisponibles) : null,
    diasDisponibles: Array.isArray(diasDisponibles) ? diasDisponibles : [],
    horarios: Array.isArray(horarios) ? horarios : [],
    horarioPersonalizado,
    imagenes: Array.isArray(imagenes) ? imagenes : [],
    estado,
    palabrasClave: Array.isArray(palabrasClave) ? palabrasClave : [],
    ubicacion: ubicacion.trim(),
    fechaCreacion,
    fechaActualizacion,
    // Campos adicionales útiles
    slug: generarSlugServicio(titulo, id),
    palabrasClaveGeneradas: generarPalabrasClaveServicio(titulo, descripcion, categoria, subcategoria, palabrasClave)
  };
};

// Generar palabras clave para búsqueda de servicios
export const generarPalabrasClaveServicio = (titulo, descripcion = '', categoria = '', subcategoria = '', palabrasClave = []) => {
  // Obtener nombre legible de la categoría
  const categoriaObj = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoria);
  
  const nombreCategoria = categoriaObj ? categoriaObj.nombre : categoria;
  
  // Generar nombre legible de subcategoría
  const nombreSubcategoria = subcategoria ? 
    subcategoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  
  // Combinar palabras clave si es array
  const palabrasClaveTexto = Array.isArray(palabrasClave) ? palabrasClave.join(' ') : '';
  
  const texto = `${titulo} ${descripcion} ${nombreCategoria} ${nombreSubcategoria} ${palabrasClaveTexto}`.toLowerCase();
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras y números
    .split(/\s+/)
    .filter(palabra => palabra.length > 2) // Palabras de más de 2 caracteres
    .filter((palabra, index, array) => array.indexOf(palabra) === index); // Remover duplicados
};

// Validar categoría y subcategoría de servicio
export const validarCategoriaServicio = (categoria, subcategoria = null) => {
  const categoriaObj = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoria);
  
  if (!categoriaObj) {
    return { valido: false, error: 'Categoría de servicio no válida' };
  }
  
  if (subcategoria) {
    const subcategorias = Object.values(categoriaObj.subcategorias);
    if (!subcategorias.includes(subcategoria)) {
      return { valido: false, error: 'Subcategoría no válida para la categoría de servicio seleccionada' };
    }
  }
  
  return { valido: true };
};

// Validar precio de servicio
export const validarPrecioServicio = (precio, tipoPrecio) => {
  if (tipoPrecio === TIPOS_PRECIO_SERVICIO.GRATIS) {
    return { valido: true, precio: 0 };
  }
  
  if (tipoPrecio === TIPOS_PRECIO_SERVICIO.NEGOCIABLE || tipoPrecio === TIPOS_PRECIO_SERVICIO.CONSULTAR) {
    return { valido: true };
  }
  
  if (precio === null || precio === undefined || precio === '') {
    return { valido: false, error: 'Precio es requerido para este tipo de precio' };
  }
  
  const precioNum = parseFloat(precio);
  
  if (isNaN(precioNum)) {
    return { valido: false, error: 'Precio debe ser un número válido' };
  }
  
  if (precioNum < 0) {
    return { valido: false, error: 'Precio no puede ser negativo' };
  }
  
  if (precioNum > 999999999) {
    return { valido: false, error: 'Precio demasiado alto' };
  }

  return { valido: true, precio: precioNum };
};

// Validar cupos
export const validarCupos = (cupos, gestionCupos) => {
  if (gestionCupos === GESTION_CUPOS.ILIMITADO) {
    return { valido: true };
  }
  
  if (gestionCupos === GESTION_CUPOS.UNICO) {
    return { valido: true, cupos: 1 };
  }
  
  if (cupos === null || cupos === undefined || cupos === '') {
    return { valido: false, error: 'Cupos disponibles son requeridos para gestión limitada' };
  }
  
  const cuposNum = parseInt(cupos);
  
  if (isNaN(cuposNum)) {
    return { valido: false, error: 'Cupos debe ser un número entero' };
  }
  
  if (cuposNum < 0) {
    return { valido: false, error: 'Cupos no puede ser negativo' };
  }
  
  if (cuposNum > 10000) {
    return { valido: false, error: 'Cupos demasiado alto' };
  }

  return { valido: true, cupos: cuposNum };
};

// Validar imágenes de servicio
export const validarImagenesServicio = (imagenes) => {
  const errores = [];
  
  if (!Array.isArray(imagenes)) {
    errores.push('Imágenes debe ser un arreglo');
    return { valido: false, errores };
  }
  
  if (imagenes.length > 5) {
    errores.push('Máximo 5 imágenes por servicio');
  }
  
  // Validar URLs de imágenes
  imagenes.forEach((imagen, index) => {
    if (typeof imagen === 'string') {
      if (!imagen.startsWith('http') && !imagen.startsWith('data:')) {
        errores.push(`Imagen ${index + 1}: URL no válida`);
      }
    } else if (typeof imagen === 'object') {
      if (!imagen.secure_url && !imagen.url) {
        errores.push(`Imagen ${index + 1}: URL requerida`);
      }
    }
  });

  return {
    valido: errores.length === 0,
    errores
  };
};

// Validar datos completos del servicio
export const validarServicioCompleto = (servicio) => {
  const errores = [];

  // Validaciones básicas usando la función del tipo
  const erroresBasicos = validarServicio(servicio);
  errores.push(...erroresBasicos);
  
  // Validar categoría y subcategoría
  if (servicio.categoria) {
    const validacionCategoria = validarCategoriaServicio(servicio.categoria, servicio.subcategoria);
    if (!validacionCategoria.valido) {
      errores.push(validacionCategoria.error);
    }
  }
  
  // Validar precio
  const validacionPrecio = validarPrecioServicio(servicio.precio, servicio.tipoPrecio);
  if (!validacionPrecio.valido) {
    errores.push(validacionPrecio.error);
  }
  
  // Validar cupos
  if (servicio.gestionCupos) {
    const validacionCupos = validarCupos(servicio.cuposDisponibles, servicio.gestionCupos);
    if (!validacionCupos.valido) {
      errores.push(validacionCupos.error);
    }
  }
  
  // Validar imágenes si están presentes
  if (servicio.imagenes && servicio.imagenes.length > 0) {
    const validacionImagenes = validarImagenesServicio(servicio.imagenes);
    errores.push(...validacionImagenes.errores);
  }

  return errores;
};

// Filtrar servicios por categoría
export const filtrarPorCategoriaServicio = (servicios, categoria, subcategoria = null) => {
  return servicios.filter(servicio => {
    const coincideCategoria = servicio.categoria === categoria;
    if (!subcategoria) return coincideCategoria;
    
    return coincideCategoria && servicio.subcategoria === subcategoria;
  });
};

// Filtrar servicios por modalidad
export const filtrarPorModalidad = (servicios, modalidades = []) => {
  if (!Array.isArray(modalidades) || modalidades.length === 0) return servicios;
  
  return servicios.filter(servicio => modalidades.includes(servicio.modalidad));
};

// Filtrar por rango de precios (servicios)
export const filtrarPorPrecioServicio = (servicios, precioMin = 0, precioMax = Infinity) => {
  return servicios.filter(servicio => {
    // Solo filtrar servicios con precio fijo
    if (servicio.tipoPrecio !== TIPOS_PRECIO_SERVICIO.FIJO && 
        servicio.tipoPrecio !== TIPOS_PRECIO_SERVICIO.POR_HORA &&
        servicio.tipoPrecio !== TIPOS_PRECIO_SERVICIO.POR_DIA &&
        servicio.tipoPrecio !== TIPOS_PRECIO_SERVICIO.POR_SESION &&
        servicio.tipoPrecio !== TIPOS_PRECIO_SERVICIO.PAQUETE) {
      return true; // Incluir servicios sin precio fijo
    }
    
    const precio = parseFloat(servicio.precio) || 0;
    return precio >= precioMin && precio <= precioMax;
  });
};

// Filtrar por estado del servicio
export const filtrarPorEstadoServicio = (servicios, estado) => {
  return servicios.filter(servicio => servicio.estado === estado);
};

// Filtrar servicios disponibles
export const filtrarServiciosDisponibles = (servicios) => {
  return servicios.filter(servicio => {
    if (servicio.estado !== ESTADOS_SERVICIO.DISPONIBLE) return false;
    
    // Verificar cupos
    if (servicio.gestionCupos === GESTION_CUPOS.LIMITADO) {
      return servicio.cuposDisponibles > 0;
    }
    
    return true;
  });
};

// Filtrar por días disponibles
export const filtrarPorDiasDisponibles = (servicios, dias = []) => {
  if (!Array.isArray(dias) || dias.length === 0) return servicios;
  
  return servicios.filter(servicio => {
    if (!Array.isArray(servicio.diasDisponibles) || servicio.diasDisponibles.length === 0) {
      return true; // Incluir servicios sin días especificados
    }
    
    return dias.some(dia => servicio.diasDisponibles.includes(dia));
  });
};

// Buscar servicios por texto
export const buscarServicios = (servicios, termino) => {
  if (!termino || termino.length < 2) return servicios;
  
  const terminoLimpio = termino
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  return servicios.filter(servicio => {
    const palabrasClaveGeneradas = servicio.palabrasClaveGeneradas || 
                                 generarPalabrasClaveServicio(
                                   servicio.titulo, 
                                   servicio.descripcion, 
                                   servicio.categoria, 
                                   servicio.subcategoria, 
                                   servicio.palabrasClave
                                 );
    
    return palabrasClaveGeneradas.some(palabra => 
      palabra.includes(terminoLimpio) || terminoLimpio.includes(palabra)
    );
  });
};

// Ordenar servicios
export const ordenarServicios = (servicios, criterio = 'fecha_desc') => {
  const copia = [...servicios];
  
  switch (criterio) {
    case 'fecha_desc':
      return copia.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    case 'fecha_asc':
      return copia.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
    case 'precio_desc':
      return copia.sort((a, b) => {
        const precioA = parseFloat(a.precio) || 0;
        const precioB = parseFloat(b.precio) || 0;
        return precioB - precioA;
      });
    case 'precio_asc':
      return copia.sort((a, b) => {
        const precioA = parseFloat(a.precio) || 0;
        const precioB = parseFloat(b.precio) || 0;
        return precioA - precioB;
      });
    case 'nombre':
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
    case 'modalidad':
      return copia.sort((a, b) => a.modalidad.localeCompare(b.modalidad));
    case 'categoria':
      return copia.sort((a, b) => a.categoria.localeCompare(b.categoria));
    default:
      return copia;
  }
};

// Obtener nombre legible de categoría de servicio
export const obtenerNombreCategoriaServicio = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoriaId);
  
  return categoria ? categoria.nombre : categoriaId;
};

// Obtener nombre legible de subcategoría de servicio
export const obtenerNombreSubcategoriaServicio = (subcategoriaId) => {
  if (!subcategoriaId) return '';
  
  return subcategoriaId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

// Obtener categoría completa (categoría + subcategoría) de servicio
export const obtenerCategoriaCompletaServicio = (categoriaId, subcategoriaId = null) => {
  const nombreCategoria = obtenerNombreCategoriaServicio(categoriaId);
  
  if (subcategoriaId) {
    const nombreSubcategoria = obtenerNombreSubcategoriaServicio(subcategoriaId);
    return `${nombreCategoria} > ${nombreSubcategoria}`;
  }
  
  return nombreCategoria;
};

// Obtener todas las subcategorías de una categoría de servicio
export const obtenerSubcategoriasServicio = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoriaId);
  
  return categoria ? categoria.subcategorias : {};
};

// Verificar si hay cupos disponibles
export const tieneCuposDisponibles = (servicio, cantidadSolicitada = 1) => {
  if (servicio.gestionCupos === GESTION_CUPOS.ILIMITADO) {
    return true;
  }
  
  if (servicio.gestionCupos === GESTION_CUPOS.UNICO) {
    return servicio.estado === ESTADOS_SERVICIO.DISPONIBLE;
  }
  
  return servicio.cuposDisponibles >= cantidadSolicitada;
};

// Actualizar cupos después de una reserva
export const actualizarCupos = (servicio, cantidadReservada) => {
  if (servicio.gestionCupos === GESTION_CUPOS.ILIMITADO) {
    return servicio; // Sin control de cupos
  }
  
  if (servicio.gestionCupos === GESTION_CUPOS.UNICO) {
    return {
      ...servicio,
      estado: ESTADOS_SERVICIO.AGOTADO,
      fechaActualizacion: new Date()
    };
  }
  
  const nuevosCupos = Math.max(0, servicio.cuposDisponibles - cantidadReservada);
  
  return {
    ...servicio,
    cuposDisponibles: nuevosCupos,
    estado: nuevosCupos > 0 ? servicio.estado : ESTADOS_SERVICIO.AGOTADO,
    fechaActualizacion: new Date()
  };
};

// Obtener servicios relacionados (misma categoría, diferente servicio)
export const obtenerServiciosRelacionados = (servicios, servicioActual, limite = 5) => {
  return servicios
    .filter(s => 
      s.id !== servicioActual.id && 
      s.categoria === servicioActual.categoria &&
      s.estado === ESTADOS_SERVICIO.DISPONIBLE
    )
    .slice(0, limite);
};

// Función para aplicar múltiples filtros a servicios
export const aplicarFiltrosServicios = (servicios, filtros = {}) => {
  let resultado = [...servicios];
  
  if (filtros.categoria) {
    resultado = filtrarPorCategoriaServicio(resultado, filtros.categoria, filtros.subcategoria);
  }
  
  if (filtros.modalidades && filtros.modalidades.length > 0) {
    resultado = filtrarPorModalidad(resultado, filtros.modalidades);
  }
  
  if (filtros.precioMin || filtros.precioMax) {
    resultado = filtrarPorPrecioServicio(resultado, filtros.precioMin, filtros.precioMax);
  }
  
  if (filtros.estado) {
    resultado = filtrarPorEstadoServicio(resultado, filtros.estado);
  }
  
  if (filtros.soloDisponibles) {
    resultado = filtrarServiciosDisponibles(resultado);
  }
  
  if (filtros.diasDisponibles && filtros.diasDisponibles.length > 0) {
    resultado = filtrarPorDiasDisponibles(resultado, filtros.diasDisponibles);
  }
  
  if (filtros.busqueda) {
    resultado = buscarServicios(resultado, filtros.busqueda);
  }
  
  // Siempre ordenar al final
  resultado = ordenarServicios(resultado, filtros.orden || 'fecha_desc');
  
  return resultado;
};

// Verificar si un servicio está disponible para reservar
export const estaDisponibleParaReserva = (servicio, dia = null) => {
  if (servicio.estado !== ESTADOS_SERVICIO.DISPONIBLE) return false;
  
  if (!tieneCuposDisponibles(servicio)) return false;
  
  // Verificar disponibilidad por día si se especifica
  if (dia && Array.isArray(servicio.diasDisponibles) && servicio.diasDisponibles.length > 0) {
    return servicio.diasDisponibles.includes(dia);
  }
  
  return true;
};

// Generar mensaje de WhatsApp para servicio
export const generarMensajeWhatsAppServicio = (servicio, storeData) => {
  const mensaje = servicio.contacto?.mensaje || 
    `Hola! Me interesa tu servicio: ${servicio.titulo}`;
  
  const servicioUrl = `${window.location.origin}/tienda/${storeData.storeSlug}/servicio/${servicio.slug || servicio.id}`;
  
  return `${mensaje}\n\nVer servicio: ${servicioUrl}`;
};