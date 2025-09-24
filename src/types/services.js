// src/types/services.js

export const ESTADOS_SERVICIO = {
  DISPONIBLE: 'disponible',
  PAUSADO: 'pausado',
  AGOTADO: 'agotado', // Para servicios con cupos limitados
  INACTIVO: 'inactivo'
};

export const TIPOS_PRECIO_SERVICIO = {
  FIJO: 'fijo',
  POR_HORA: 'por_hora',
  POR_DIA: 'por_dia',
  POR_SESION: 'por_sesion',
  PAQUETE: 'paquete',
  NEGOCIABLE: 'negociable',
  CONSULTAR: 'consultar',
  GRATIS: 'gratis'
};

export const MODALIDAD_SERVICIO = {
  PRESENCIAL: 'presencial',
  DOMICILIO: 'domicilio',
  VIRTUAL: 'virtual',
  HIBRIDO: 'hibrido'
};

export const CATEGORIAS_SERVICIOS = {
  BELLEZA_Y_BIENESTAR: 'belleza_y_bienestar',
  SALUD_Y_MEDICINA: 'salud_y_medicina',
  EDUCACION_Y_CAPACITACION: 'educacion_y_capacitacion',
  TECNOLOGIA_E_INFORMATICA: 'tecnologia_e_informatica',
  HOGAR_Y_MANTENIMIENTO: 'hogar_y_mantenimiento',
  AUTOMOTRIZ: 'automotriz',
  EVENTOS_Y_CELEBRACIONES: 'eventos_y_celebraciones',
  DEPORTES_Y_FITNESS: 'deportes_y_fitness',
  MASCOTAS: 'mascotas',
  CONSULTORIA_Y_NEGOCIOS: 'consultoria_y_negocios',
  MARKETING_Y_PUBLICIDAD: 'marketing_y_publicidad',
  DISEÑO_Y_CREATIVIDAD: 'diseño_y_creatividad',
  FOTOGRAFIA_Y_VIDEO: 'fotografia_y_video',
  MUSICA_Y_ENTRETENIMIENTO: 'musica_y_entretenimiento',
  GASTRONOMIA: 'gastronomia',
  JARDINERIA_Y_PAISAJISMO: 'jardineria_y_paisajismo',
  LIMPIEZA: 'limpieza',
  TRANSPORTE_Y_LOGISTICA: 'transporte_y_logistica',
  SERVICIOS_LEGALES: 'servicios_legales',
  SERVICIOS_FINANCIEROS: 'servicios_financieros',
  OTROS: 'otros'
};

export const DURACION_SERVICIO = {
  MINUTOS_30: '30_minutos',
  HORA_1: '1_hora',
  HORAS_2: '2_horas',
  MEDIO_DIA: 'medio_dia',
  DIA_COMPLETO: 'dia_completo',
  VARIOS_DIAS: 'varios_dias',
  SEMANAL: 'semanal',
  MENSUAL: 'mensual',
  PERSONALIZADA: 'personalizada'
};

export const DIAS_DISPONIBLES = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miercoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sabado',
  DOMINGO: 'domingo'
};

export const HORARIOS_DISPONIBLES = {
  MAÑANA: 'mañana', // 6:00 - 12:00
  TARDE: 'tarde',   // 12:00 - 18:00
  NOCHE: 'noche',   // 18:00 - 24:00
  TODO_EL_DIA: 'todo_el_dia',
  PERSONALIZADO: 'personalizado'
};

export const GESTION_CUPOS = {
  ILIMITADO: 'ilimitado',
  LIMITADO: 'limitado',
  UNICO: 'unico' // Para servicios únicos como trabajos específicos
};

// Función para formatear precio de servicio
export const formatearPrecioServicio = (precio, tipoPrecio = TIPOS_PRECIO_SERVICIO.FIJO, moneda = '$') => {
  if (!precio && precio !== 0) {
    switch (tipoPrecio) {
      case TIPOS_PRECIO_SERVICIO.NEGOCIABLE:
        return 'Precio negociable';
      case TIPOS_PRECIO_SERVICIO.CONSULTAR:
        return 'Consultar precio';
      case TIPOS_PRECIO_SERVICIO.GRATIS:
        return 'Gratis';
      default:
        return 'Precio a consultar';
    }
  }
  
  const precioFormateado = `${moneda} ${parseFloat(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
  
  switch (tipoPrecio) {
    case TIPOS_PRECIO_SERVICIO.POR_HORA:
      return `${precioFormateado} / hora`;
    case TIPOS_PRECIO_SERVICIO.POR_DIA:
      return `${precioFormateado} / día`;
    case TIPOS_PRECIO_SERVICIO.POR_SESION:
      return `${precioFormateado} / sesión`;
    case TIPOS_PRECIO_SERVICIO.PAQUETE:
      return `${precioFormateado} / paquete`;
    default:
      return precioFormateado;
  }
};

// Función para obtener el badge del estado
export const obtenerEstadoBadgeServicio = (estado) => {
  switch (estado) {
    case ESTADOS_SERVICIO.DISPONIBLE:
      return { texto: 'Disponible', color: 'green' };
    case ESTADOS_SERVICIO.PAUSADO:
      return { texto: 'Pausado', color: 'yellow' };
    case ESTADOS_SERVICIO.AGOTADO:
      return { texto: 'Sin cupos', color: 'red' };
    case ESTADOS_SERVICIO.INACTIVO:
      return { texto: 'Inactivo', color: 'gray' };
    default:
      return { texto: 'Desconocido', color: 'gray' };
  }
};

// Función para formatear modalidad
export const formatearModalidad = (modalidad) => {
  switch (modalidad) {
    case MODALIDAD_SERVICIO.PRESENCIAL:
      return 'Presencial';
    case MODALIDAD_SERVICIO.DOMICILIO:
      return 'A domicilio';
    case MODALIDAD_SERVICIO.VIRTUAL:
      return 'Virtual/Online';
    case MODALIDAD_SERVICIO.HIBRIDO:
      return 'Híbrido';
    default:
      return modalidad;
  }
};

// Función para formatear categoría
export const formatearCategoria = (categoria) => {
  const nombres = {
    [CATEGORIAS_SERVICIOS.BELLEZA_Y_BIENESTAR]: 'Belleza y Bienestar',
    [CATEGORIAS_SERVICIOS.SALUD_Y_MEDICINA]: 'Salud y Medicina',
    [CATEGORIAS_SERVICIOS.EDUCACION_Y_CAPACITACION]: 'Educación y Capacitación',
    [CATEGORIAS_SERVICIOS.TECNOLOGIA_E_INFORMATICA]: 'Tecnología e Informática',
    [CATEGORIAS_SERVICIOS.HOGAR_Y_MANTENIMIENTO]: 'Hogar y Mantenimiento',
    [CATEGORIAS_SERVICIOS.AUTOMOTRIZ]: 'Automotriz',
    [CATEGORIAS_SERVICIOS.EVENTOS_Y_CELEBRACIONES]: 'Eventos y Celebraciones',
    [CATEGORIAS_SERVICIOS.DEPORTES_Y_FITNESS]: 'Deportes y Fitness',
    [CATEGORIAS_SERVICIOS.MASCOTAS]: 'Mascotas',
    [CATEGORIAS_SERVICIOS.CONSULTORIA_Y_NEGOCIOS]: 'Consultoría y Negocios',
    [CATEGORIAS_SERVICIOS.MARKETING_Y_PUBLICIDAD]: 'Marketing y Publicidad',
    [CATEGORIAS_SERVICIOS.DISEÑO_Y_CREATIVIDAD]: 'Diseño y Creatividad',
    [CATEGORIAS_SERVICIOS.FOTOGRAFIA_Y_VIDEO]: 'Fotografía y Video',
    [CATEGORIAS_SERVICIOS.MUSICA_Y_ENTRETENIMIENTO]: 'Música y Entretenimiento',
    [CATEGORIAS_SERVICIOS.GASTRONOMIA]: 'Gastronomía',
    [CATEGORIAS_SERVICIOS.JARDINERIA_Y_PAISAJISMO]: 'Jardinería y Paisajismo',
    [CATEGORIAS_SERVICIOS.LIMPIEZA]: 'Limpieza',
    [CATEGORIAS_SERVICIOS.TRANSPORTE_Y_LOGISTICA]: 'Transporte y Logística',
    [CATEGORIAS_SERVICIOS.SERVICIOS_LEGALES]: 'Servicios Legales',
    [CATEGORIAS_SERVICIOS.SERVICIOS_FINANCIEROS]: 'Servicios Financieros',
    [CATEGORIAS_SERVICIOS.OTROS]: 'Otros'
  };
  
  return nombres[categoria] || categoria;
};

// Función para formatear duración
export const formatearDuracion = (duracion, duracionPersonalizada = '') => {
  switch (duracion) {
    case DURACION_SERVICIO.MINUTOS_30:
      return '30 minutos';
    case DURACION_SERVICIO.HORA_1:
      return '1 hora';
    case DURACION_SERVICIO.HORAS_2:
      return '2 horas';
    case DURACION_SERVICIO.MEDIO_DIA:
      return 'Medio día';
    case DURACION_SERVICIO.DIA_COMPLETO:
      return 'Día completo';
    case DURACION_SERVICIO.VARIOS_DIAS:
      return 'Varios días';
    case DURACION_SERVICIO.SEMANAL:
      return 'Semanal';
    case DURACION_SERVICIO.MENSUAL:
      return 'Mensual';
    case DURACION_SERVICIO.PERSONALIZADA:
      return duracionPersonalizada || 'Duración personalizada';
    default:
      return duracion;
  }
};

// Función para formatear días disponibles
export const formatearDiasDisponibles = (dias = []) => {
  if (!Array.isArray(dias) || dias.length === 0) return 'No especificado';
  
  const diasOrdenados = [
    DIAS_DISPONIBLES.LUNES,
    DIAS_DISPONIBLES.MARTES,
    DIAS_DISPONIBLES.MIERCOLES,
    DIAS_DISPONIBLES.JUEVES,
    DIAS_DISPONIBLES.VIERNES,
    DIAS_DISPONIBLES.SABADO,
    DIAS_DISPONIBLES.DOMINGO
  ];
  
  const diasFiltrados = diasOrdenados.filter(dia => dias.includes(dia));
  
  if (diasFiltrados.length === 7) return 'Todos los días';
  if (diasFiltrados.length === 5 && !dias.includes(DIAS_DISPONIBLES.SABADO) && !dias.includes(DIAS_DISPONIBLES.DOMINGO)) {
    return 'Lunes a viernes';
  }
  if (diasFiltrados.length === 2 && dias.includes(DIAS_DISPONIBLES.SABADO) && dias.includes(DIAS_DISPONIBLES.DOMINGO)) {
    return 'Fines de semana';
  }
  
  const nombresDias = {
    [DIAS_DISPONIBLES.LUNES]: 'Lun',
    [DIAS_DISPONIBLES.MARTES]: 'Mar',
    [DIAS_DISPONIBLES.MIERCOLES]: 'Mié',
    [DIAS_DISPONIBLES.JUEVES]: 'Jue',
    [DIAS_DISPONIBLES.VIERNES]: 'Vie',
    [DIAS_DISPONIBLES.SABADO]: 'Sáb',
    [DIAS_DISPONIBLES.DOMINGO]: 'Dom'
  };
  
  return diasFiltrados.map(dia => nombresDias[dia]).join(', ');
};

// Función para formatear horarios
export const formatearHorarios = (horarios = [], horarioPersonalizado = '') => {
  if (!Array.isArray(horarios) || horarios.length === 0) return 'No especificado';
  
  if (horarios.includes(HORARIOS_DISPONIBLES.TODO_EL_DIA)) return 'Todo el día';
  if (horarios.includes(HORARIOS_DISPONIBLES.PERSONALIZADO)) return horarioPersonalizado || 'Horario personalizado';
  
  const nombresHorarios = {
    [HORARIOS_DISPONIBLES.MAÑANA]: 'Mañana',
    [HORARIOS_DISPONIBLES.TARDE]: 'Tarde',
    [HORARIOS_DISPONIBLES.NOCHE]: 'Noche'
  };
  
  return horarios.map(horario => nombresHorarios[horario] || horario).join(', ');
};

// Función para validar servicio
export const validarServicio = (servicio) => {
  const errores = [];

  // Validaciones básicas
  if (!servicio.titulo || servicio.titulo.trim().length === 0) {
    errores.push('El título es requerido');
  }
  if (servicio.titulo && servicio.titulo.length < 3) {
    errores.push('El título debe tener al menos 3 caracteres');
  }
  if (servicio.titulo && servicio.titulo.length > 100) {
    errores.push('El título no puede exceder 100 caracteres');
  }
  
  if (!servicio.descripcion || servicio.descripcion.trim().length === 0) {
    errores.push('La descripción es requerida');
  }
  if (servicio.descripcion && servicio.descripcion.length < 20) {
    errores.push('La descripción debe tener al menos 20 caracteres');
  }
  if (servicio.descripcion && servicio.descripcion.length > 2000) {
    errores.push('La descripción no puede exceder 2000 caracteres');
  }
  
  if (!servicio.categoria) {
    errores.push('La categoría es requerida');
  }
  
  if (!servicio.modalidad) {
    errores.push('La modalidad es requerida');
  }
  
  // Validar precio según tipo
  if (servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.FIJO || 
      servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_HORA ||
      servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_DIA ||
      servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.POR_SESION ||
      servicio.tipoPrecio === TIPOS_PRECIO_SERVICIO.PAQUETE) {
    if (!servicio.precio || servicio.precio <= 0) {
      errores.push('El precio es requerido para este tipo de precio');
    }
  }
  
  // Validar cupos si es limitado
  if (servicio.gestionCupos === GESTION_CUPOS.LIMITADO) {
    if (!servicio.cuposDisponibles || servicio.cuposDisponibles <= 0) {
      errores.push('Los cupos disponibles son requeridos para gestión limitada');
    }
  }
  
  // Validar duración personalizada
  if (servicio.duracion === DURACION_SERVICIO.PERSONALIZADA && !servicio.duracionPersonalizada) {
    errores.push('Debe especificar la duración personalizada');
  }
  
  // Validar horario personalizado
  if (servicio.horarios && servicio.horarios.includes(HORARIOS_DISPONIBLES.PERSONALIZADO) && !servicio.horarioPersonalizado) {
    errores.push('Debe especificar el horario personalizado');
  }
  
  return errores;
};

// Función para auto-completar datos del servicio desde storeData
export const autoCompletarDatosServicio = (servicioData, storeData) => {
  return {
    ...servicioData,
    // Información de la tienda
    tiendaInfo: {
      nombre: storeData?.businessName || storeData?.familyName || 'Tienda',
      slug: storeData?.storeSlug || '',
      ubicacion: storeData?.address || '',
      telefono: storeData?.phone || '',
      email: storeData?.email || '',
      logo: storeData?.storeLogo || storeData?.profileImage || null
    },
    // Auto-completar contacto si no está definido
    contacto: {
      whatsapp: servicioData.contacto?.whatsapp || storeData?.phone || '',
      telefono: servicioData.contacto?.telefono || storeData?.phone || '',
      email: servicioData.contacto?.email || storeData?.email || '',
      mensaje: servicioData.contacto?.mensaje || `Hola! Me interesa tu servicio: ${servicioData.titulo}`
    }
  };
};

// Función para generar slug de servicio
export const generarSlugServicio = (titulo, id) => {
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios por guiones
    .substring(0, 50); // Máximo 50 caracteres
  
  return `${slug}-${id.substring(0, 8)}`;
};

// Función para verificar disponibilidad de cupos
export const verificarDisponibilidadCupos = (servicio) => {
  if (servicio.gestionCupos === GESTION_CUPOS.ILIMITADO) return true;
  if (servicio.gestionCupos === GESTION_CUPOS.UNICO) return servicio.estado === ESTADOS_SERVICIO.DISPONIBLE;
  
  return servicio.cuposDisponibles > 0;
};

export default {
  ESTADOS_SERVICIO,
  TIPOS_PRECIO_SERVICIO,
  MODALIDAD_SERVICIO,
  CATEGORIAS_SERVICIOS,
  DURACION_SERVICIO,
  DIAS_DISPONIBLES,
  HORARIOS_DISPONIBLES,
  GESTION_CUPOS,
  formatearPrecioServicio,
  obtenerEstadoBadgeServicio,
  formatearModalidad,
  formatearCategoria,
  formatearDuracion,
  formatearDiasDisponibles,
  formatearHorarios,
  validarServicio,
  autoCompletarDatosServicio,
  generarSlugServicio,
  verificarDisponibilidadCupos
};