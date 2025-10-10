// src/types/employment.js

// ================================
// TIPOS DE PUBLICACIÓN
// ================================
export const TIPOS_PUBLICACION = {
  OFERTA_EMPLEO: 'oferta_empleo',
  BUSQUEDA_EMPLEO: 'busqueda_empleo',
  SERVICIO_PROFESIONAL: 'servicio_profesional'
};

// ================================
// ESTADOS DE PUBLICACIÓN
// ================================
export const ESTADOS_PUBLICACION = {
  ACTIVO: 'activo',
  PAUSADO: 'pausado',
  INACTIVO: 'inactivo',
  FINALIZADO: 'finalizado'
};

// ================================
// TIPOS DE EMPLEO
// ================================
export const TIPOS_EMPLEO = {
  TIEMPO_COMPLETO: {
    id: 'tiempo_completo',
    nombre: 'Tiempo Completo',
    descripcion: '40+ horas semanales'
  },
  MEDIO_TIEMPO: {
    id: 'medio_tiempo',
    nombre: 'Medio Tiempo',
    descripcion: '20-30 horas semanales'
  },
  POR_HORAS: {
    id: 'por_horas',
    nombre: 'Por Horas',
    descripcion: 'Trabajo flexible por horas'
  },
  FREELANCE: {
    id: 'freelance',
    nombre: 'Freelance',
    descripcion: 'Trabajo por proyectos'
  },
  TEMPORAL: {
    id: 'temporal',
    nombre: 'Temporal',
    descripcion: 'Contrato por tiempo definido'
  },
  PASANTIA: {
    id: 'pasantia',
    nombre: 'Pasantía',
    descripcion: 'Oportunidad de aprendizaje'
  },
  ESTACIONAL: {
    id: 'estacional',
    nombre: 'Estacional',
    descripcion: 'Trabajo por temporadas'
  }
};

// ================================
// MODALIDADES DE TRABAJO
// ================================
export const MODALIDADES_TRABAJO = {
  PRESENCIAL: {
    id: 'presencial',
    nombre: 'Presencial',
    icono: '🏢'
  },
  REMOTO: {
    id: 'remoto',
    nombre: 'Remoto',
    icono: '🏠'
  },
  HIBRIDO: {
    id: 'hibrido',
    nombre: 'Híbrido',
    icono: '🔄'
  }
};

// ================================
// NIVELES DE EXPERIENCIA
// ================================
export const NIVELES_EXPERIENCIA = {
  SIN_EXPERIENCIA: {
    id: 'sin_experiencia',
    nombre: 'Sin Experiencia',
    descripcion: 'Para principiantes'
  },
  JUNIOR: {
    id: 'junior',
    nombre: 'Junior',
    descripcion: '1-2 años de experiencia'
  },
  SEMI_SENIOR: {
    id: 'semi_senior',
    nombre: 'Semi Senior',
    descripcion: '3-5 años de experiencia'
  },
  SENIOR: {
    id: 'senior',
    nombre: 'Senior',
    descripcion: '5+ años de experiencia'
  },
  EXPERTO: {
    id: 'experto',
    nombre: 'Experto/Líder',
    descripcion: '8+ años con liderazgo'
  }
};

// ================================
// TIPOS DE SALARIO/TARIFA
// ================================
export const TIPOS_SALARIO = {
  FIJO: 'fijo',
  POR_HORA: 'por_hora',
  POR_DIA: 'por_dia',
  POR_PROYECTO: 'por_proyecto',
  POR_SERVICIO: 'por_servicio',
  MENSUAL: 'mensual',
  SEMANAL: 'semanal',
  NEGOCIABLE: 'negociable',
  A_CONVENIR: 'a_convenir'
};

// ================================
// CATEGORÍAS DE EMPLEO Y SERVICIOS
// ================================
export const CATEGORIAS_EMPLEO = {
  ADMINISTRACION: {
    id: 'administracion',
    nombre: 'Administración y Oficina',
    subcategorias: {
      CONTABILIDAD: 'Contabilidad',
      RECURSOS_HUMANOS: 'Recursos Humanos',
      SECRETARIADO: 'Secretariado',
      FINANZAS: 'Finanzas',
      ASISTENTE_ADMINISTRATIVO: 'Asistente Administrativo',
      RECEPCION: 'Recepción',
      OTRO: 'Otro'
    }
  },
  
  TECNOLOGIA: {
    id: 'tecnologia',
    nombre: 'Tecnología e Informática',
    subcategorias: {
      DESARROLLO_WEB: 'Desarrollo Web',
      DESARROLLO_MOBILE: 'Desarrollo Mobile',
      SOPORTE_TECNICO: 'Soporte Técnico',
      DISEÑO_UX_UI: 'Diseño UX/UI',
      MARKETING_DIGITAL: 'Marketing Digital',
      DATOS_ANALYTICS: 'Datos y Analytics',
      CIBERSEGURIDAD: 'Ciberseguridad',
      REDES: 'Redes y Sistemas',
      REPARACION_EQUIPOS: 'Reparación de Equipos',
      OTRO: 'Otro'
    }
  },
  
  SALUD: {
    id: 'salud',
    nombre: 'Salud y Bienestar',
    subcategorias: {
      ENFERMERIA: 'Enfermería',
      CUIDADO_PERSONAS: 'Cuidado de Personas',
      FISIOTERAPIA: 'Fisioterapia',
      NUTRICION: 'Nutrición',
      PSICOLOGIA: 'Psicología',
      MEDICINA: 'Medicina',
      ODONTOLOGIA: 'Odontología',
      FARMACIA: 'Farmacia',
      MASAJES: 'Masajes Terapéuticos',
      OTRO: 'Otro'
    }
  },
  
  BELLEZA: {
    id: 'belleza',
    nombre: 'Belleza y Estética',
    subcategorias: {
      PELUQUERIA: 'Peluquería',
      BARBERIA: 'Barbería',
      MANICURA: 'Manicura y Pedicura',
      MAQUILLAJE: 'Maquillaje',
      DEPILACION: 'Depilación',
      TRATAMIENTOS_FACIALES: 'Tratamientos Faciales',
      MASAJES_RELAJACION: 'Masajes y Relajación',
      TATUAJES: 'Tatuajes y Piercing',
      OTRO: 'Otro'
    }
  },
  
  EDUCACION: {
    id: 'educacion',
    nombre: 'Educación y Capacitación',
    subcategorias: {
      PROFESOR: 'Profesor/Docente',
      TUTOR: 'Tutor Particular',
      CUIDADO_NINOS: 'Cuidado de Niños',
      IDIOMAS: 'Enseñanza de Idiomas',
      MUSICA: 'Música e Instrumentos',
      DEPORTES: 'Deportes y Entrenamiento',
      ARTE: 'Arte y Dibujo',
      INFORMATICA: 'Informática y Programación',
      OTRO: 'Otro'
    }
  },
  
  GASTRONOMIA: {
    id: 'gastronomia',
    nombre: 'Gastronomía y Alimentos',
    subcategorias: {
      COCINERO: 'Cocinero/Chef',
      MESERO: 'Mesero/Camarero',
      BARTENDER: 'Bartender',
      AYUDANTE_COCINA: 'Ayudante de Cocina',
      DELIVERY: 'Delivery',
      PANADERO: 'Panadero',
      PASTELERO: 'Pastelero',
      CATERING: 'Catering',
      OTRO: 'Otro'
    }
  },
  
  CONSTRUCCION: {
    id: 'construccion',
    nombre: 'Construcción y Mantenimiento',
    subcategorias: {
      ALBANIL: 'Albañil',
      PLOMERO: 'Plomero',
      ELECTRICISTA: 'Electricista',
      CARPINTERO: 'Carpintero',
      PINTOR: 'Pintor',
      SOLDADOR: 'Soldador',
      ARQUITECTO: 'Arquitecto',
      INGENIERO: 'Ingeniero',
      MANTENIMIENTO: 'Mantenimiento General',
      OTRO: 'Otro'
    }
  },
  
  HOGAR: {
    id: 'hogar',
    nombre: 'Servicios del Hogar',
    subcategorias: {
      LIMPIEZA: 'Limpieza',
      LAVANDERIA: 'Lavandería',
      JARDINERIA: 'Jardinería',
      CERRAJERIA: 'Cerrajería',
      AIRE_ACONDICIONADO: 'Aire Acondicionado',
      FUMIGACION: 'Fumigación',
      MUDANZAS: 'Mudanzas',
      DECORACION: 'Decoración',
      OTRO: 'Otro'
    }
  },
  
  TRANSPORTE: {
    id: 'transporte',
    nombre: 'Transporte y Logística',
    subcategorias: {
      CONDUCTOR: 'Conductor',
      DELIVERY: 'Delivery',
      MENSAJERIA: 'Mensajería',
      LOGISTICA: 'Logística',
      ALMACEN: 'Almacén',
      TRANSPORTE_PERSONAS: 'Transporte de Personas',
      MUDANZAS: 'Mudanzas y Fletes',
      OTRO: 'Otro'
    }
  },
  
  VENTAS: {
    id: 'ventas',
    nombre: 'Ventas y Atención',
    subcategorias: {
      VENDEDOR: 'Vendedor',
      CAJERO: 'Cajero',
      ATENCION_CLIENTE: 'Atención al Cliente',
      TELEMARKETING: 'Telemarketing',
      PROMOTOR: 'Promotor',
      REPOSITOR: 'Repositor',
      SUPERVISOR: 'Supervisor',
      OTRO: 'Otro'
    }
  },
  
  MARKETING: {
    id: 'marketing',
    nombre: 'Marketing y Comunicación',
    subcategorias: {
      COMMUNITY_MANAGER: 'Community Manager',
      DISEÑO_GRAFICO: 'Diseño Gráfico',
      FOTOGRAFIA: 'Fotografía',
      VIDEO: 'Video y Edición',
      COPYWRITING: 'Copywriting',
      PUBLICIDAD: 'Publicidad',
      RELACIONES_PUBLICAS: 'Relaciones Públicas',
      OTRO: 'Otro'
    }
  },
  
  EVENTOS: {
    id: 'eventos',
    nombre: 'Eventos y Entretenimiento',
    subcategorias: {
      ORGANIZACION_EVENTOS: 'Organización de Eventos',
      ANIMACION: 'Animación',
      DJ: 'DJ',
      MUSICO: 'Músico',
      FOTOGRAFIA_EVENTOS: 'Fotografía de Eventos',
      DECORACION_EVENTOS: 'Decoración de Eventos',
      CATERING_EVENTOS: 'Catering',
      SEGURIDAD: 'Seguridad',
      OTRO: 'Otro'
    }
  },
  
  AUTOMOTRIZ: {
    id: 'automotriz',
    nombre: 'Automotriz',
    subcategorias: {
      MECANICO: 'Mecánico',
      ELECTRICISTA_AUTO: 'Electricista Automotriz',
      CHAPISTA: 'Chapista y Pintura',
      LAVADO_AUTOS: 'Lavado de Autos',
      GRUA: 'Grúa y Remolque',
      NEUMATICOS: 'Neumáticos',
      OTRO: 'Otro'
    }
  },
  
  LEGAL: {
    id: 'legal',
    nombre: 'Legal y Profesional',
    subcategorias: {
      ABOGADO: 'Abogado',
      CONTADOR: 'Contador',
      CONSULTOR: 'Consultor',
      ESCRIBANO: 'Escribano',
      TRAMITES: 'Gestión de Trámites',
      TRADUCCION: 'Traducción',
      OTRO: 'Otro'
    }
  },
  
  SEGURIDAD: {
    id: 'seguridad',
    nombre: 'Seguridad',
    subcategorias: {
      GUARDIA_SEGURIDAD: 'Guardia de Seguridad',
      VIGILANCIA: 'Vigilancia',
      SEGURIDAD_PRIVADA: 'Seguridad Privada',
      MONITOREO: 'Monitoreo',
      OTRO: 'Otro'
    }
  },
  
  MASCOTAS: {
    id: 'mascotas',
    nombre: 'Mascotas',
    subcategorias: {
      VETERINARIO: 'Veterinario',
      PELUQUERIA_MASCOTAS: 'Peluquería para Mascotas',
      PASEO_PERROS: 'Paseo de Perros',
      CUIDADO_MASCOTAS: 'Cuidado de Mascotas',
      ADIESTRAMIENTO: 'Adiestramiento',
      GUARDERIA: 'Guardería',
      OTRO: 'Otro'
    }
  },
  
  OTRO: {
    id: 'otro',
    nombre: 'Otros',
    subcategorias: {
      GENERAL: 'General'
    }
  }
};

// ================================
// DÍAS DISPONIBLES
// ================================
export const DIAS_SEMANA = {
  LUNES: { id: 'lunes', nombre: 'Lunes', abrev: 'Lun' },
  MARTES: { id: 'martes', nombre: 'Martes', abrev: 'Mar' },
  MIERCOLES: { id: 'miercoles', nombre: 'Miércoles', abrev: 'Mié' },
  JUEVES: { id: 'jueves', nombre: 'Jueves', abrev: 'Jue' },
  VIERNES: { id: 'viernes', nombre: 'Viernes', abrev: 'Vie' },
  SABADO: { id: 'sabado', nombre: 'Sábado', abrev: 'Sáb' },
  DOMINGO: { id: 'domingo', nombre: 'Domingo', abrev: 'Dom' }
};

// ================================
// HORARIOS
// ================================
export const HORARIOS = {
  MAÑANA: { id: 'mañana', nombre: 'Mañana', rango: '6:00 - 12:00' },
  TARDE: { id: 'tarde', nombre: 'Tarde', rango: '12:00 - 18:00' },
  NOCHE: { id: 'noche', nombre: 'Noche', rango: '18:00 - 24:00' },
  TODO_DIA: { id: 'todo_dia', nombre: 'Todo el día', rango: '6:00 - 24:00' },
  FLEXIBLE: { id: 'flexible', nombre: 'Flexible', rango: 'A convenir' }
};

// ================================
// ESQUEMA PARA OFERTA DE EMPLEO
// ================================
export const OFERTA_EMPLEO_SCHEMA = {
  id: '',
  tipo: TIPOS_PUBLICACION.OFERTA_EMPLEO,
  usuarioId: '',
  tiendaId: '',
  
  // Información básica
  titulo: '',
  descripcion: '',
  categoria: '',
  subcategoria: '',
  
  // Detalles del empleo
  tipoEmpleo: '',
  modalidad: '',
  experienciaRequerida: '',
  
  // Requisitos
  requisitos: [],
  habilidades: [],
  certificaciones: [],
  
  // Condiciones laborales
  horario: {
    dias: [],
    turnos: [],
    horaInicio: '',
    horaFin: '',
    flexible: false
  },
  
  // Salario
  salario: {
    tipo: TIPOS_SALARIO.MENSUAL,
    minimo: null,
    maximo: null,
    moneda: 'ARS',
    beneficios: []
  },
  
  // Ubicación
  ubicacion: {
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: 'Argentina',
    coordenadas: null
  },
  
  // Contacto
  contacto: {
    whatsapp: '',
    telefono: '',
    email: '',
    preferencia: 'whatsapp'
  },
  
  // Estado
  estado: ESTADOS_PUBLICACION.ACTIVO,
  destacado: false,
  featuredUntil: null,
  
  // Metadata
  fechaCreacion: null,
  fechaActualizacion: null,
  vistas: 0,
  postulaciones: 0,
  
  // Info de la tienda
  tiendaInfo: {
    nombre: '',
    slug: '',
    logo: ''
  }
};

// ================================
// ESQUEMA PARA BÚSQUEDA DE EMPLEO
// ================================
export const BUSQUEDA_EMPLEO_SCHEMA = {
  id: '',
  tipo: TIPOS_PUBLICACION.BUSQUEDA_EMPLEO,
  usuarioId: '',
  tiendaId: '',
  
  // Información personal
  nombre: '',
  apellido: '',
  edad: null,
  foto: '',
  
  // Perfil profesional
  titulo: '',
  descripcion: '',
  objetivoLaboral: '',
  
  // Áreas de interés
  categorias: [],
  subcategorias: [],
  
  // Experiencia
  experiencia: {
    nivel: '',
    años: 0,
    trabajosAnteriores: [],
    descripcionExperiencia: ''
  },
  
  // Formación
  educacion: {
    nivel: '',
    estudios: [],
    certificaciones: []
  },
  
  // Habilidades
  habilidades: [],
  idiomas: [],
  
  // Disponibilidad
  disponibilidad: {
    tiposEmpleo: [],
    modalidades: [],
    diasDisponibles: [],
    horarios: [],
    inmediata: false,
    fechaDisponible: null
  },
  
  // Preferencias
  preferencias: {
    salarioMinimo: null,
    salarioMaximo: null,
    zonas: [],
    beneficiosDeseados: []
  },
  
  // Ubicación
  ubicacion: {
    ciudad: '',
    provincia: '',
    pais: 'Argentina',
    dispuestoMudar: false
  },
  
  // CV y documentos
  curriculum: {
    url: '',
    nombre: '',
    tamaño: 0
  },
  
  // Contacto
  contacto: {
    whatsapp: '',
    telefono: '',
    email: '',
    linkedin: '',
    portfolio: ''
  },
  
  // Estado
  estado: ESTADOS_PUBLICACION.ACTIVO,
  destacado: false,
  featuredUntil: null,
  
  // Metadata
  fechaCreacion: null,
  fechaActualizacion: null,
  vistas: 0
};

// ================================
// ESQUEMA PARA SERVICIO PROFESIONAL
// ================================
export const SERVICIO_PROFESIONAL_SCHEMA = {
  id: '',
  tipo: TIPOS_PUBLICACION.SERVICIO_PROFESIONAL,
  usuarioId: '',
  tiendaId: '',
  
  // Información básica
  titulo: '',
  nombreProfesional: '',
  foto: '',
  descripcion: '',
  
  // Categorización
  categoria: '',
  subcategoria: '',
  especialidades: [],
  
  // Experiencia profesional
  experiencia: {
    años: 0,
    nivel: '',
    descripcion: ''
  },
  
  // Servicios ofrecidos
  servicios: [],
  
  // Certificaciones y formación
  certificaciones: [],
  titulos: [],
  
  // Tarifas
  tarifas: {
    tipo: TIPOS_SALARIO.POR_SERVICIO,
    minimo: null,
    maximo: null,
    moneda: 'ARS',
    detalles: ''
  },
  
  // Disponibilidad
  disponibilidad: {
    modalidades: [],
    diasDisponibles: [],
    horarios: [],
    zonasCobertura: []
  },
  
  // Ubicación
  ubicacion: {
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: 'Argentina',
    atendeADomicilio: false,
    zonaCobertura: []
  },
  
  // Portfolio
  portfolio: {
    imagenes: [],
    videos: [],
    descripcionTrabajos: ''
  },
  
  // Contacto
  contacto: {
    whatsapp: '',
    telefono: '',
    email: '',
    sitioWeb: '',
    redesSociales: {
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  },
  
  // Estado
  estado: ESTADOS_PUBLICACION.ACTIVO,
  destacado: false,
  featuredUntil: null,
  
  // Valoraciones
  valoraciones: {
    promedio: 0,
    total: 0,
    distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  },
  
  // Metadata
  fechaCreacion: null,
  fechaActualizacion: null,
  vistas: 0,
  contactos: 0,
  
  // Info de la tienda
  tiendaInfo: {
    nombre: '',
    slug: '',
    logo: ''
  }
};

// ================================
// UTILIDADES
// ================================

// Obtener nombre de categoría
export const obtenerNombreCategoria = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_EMPLEO).find(c => c.id === categoriaId);
  return categoria ? categoria.nombre : categoriaId;
};

// Obtener nombre de subcategoría
export const obtenerNombreSubcategoria = (categoriaId, subcategoriaKey) => {
  const categoria = Object.values(CATEGORIAS_EMPLEO).find(c => c.id === categoriaId);
  if (!categoria) return subcategoriaKey;
  return categoria.subcategorias[subcategoriaKey] || subcategoriaKey;
};

// Obtener todas las subcategorías de una categoría
export const obtenerSubcategorias = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_EMPLEO).find(c => c.id === categoriaId);
  return categoria ? categoria.subcategorias : {};
};

// Formatear días disponibles
export const formatearDias = (dias = []) => {
  if (!Array.isArray(dias) || dias.length === 0) return 'No especificado';
  if (dias.length === 7) return 'Todos los días';
  
  return dias.map(dia => {
    const diaObj = Object.values(DIAS_SEMANA).find(d => d.id === dia);
    return diaObj ? diaObj.abrev : dia;
  }).join(', ');
};

// Formatear horarios
export const formatearHorarios = (horarios = []) => {
  if (!Array.isArray(horarios) || horarios.length === 0) return 'No especificado';
  
  return horarios.map(horario => {
    const horarioObj = Object.values(HORARIOS).find(h => h.id === horario);
    return horarioObj ? horarioObj.nombre : horario;
  }).join(', ');
};

// Formatear salario/tarifa
export const formatearSalario = (salario, tipoPub = null) => {
  if (!salario) return 'A convenir';
  
  const { tipo, minimo, maximo, moneda = 'ARS' } = salario;
  
  if (tipo === TIPOS_SALARIO.NEGOCIABLE || tipo === TIPOS_SALARIO.A_CONVENIR) {
    return 'A convenir';
  }
  
  const simboloMoneda = moneda === 'ARS' ? '$' : moneda;
  
  let rangoTexto = '';
  if (minimo && maximo) {
    rangoTexto = `${simboloMoneda} ${minimo.toLocaleString()} - ${simboloMoneda} ${maximo.toLocaleString()}`;
  } else if (minimo) {
    rangoTexto = `Desde ${simboloMoneda} ${minimo.toLocaleString()}`;
  } else if (maximo) {
    rangoTexto = `Hasta ${simboloMoneda} ${maximo.toLocaleString()}`;
  } else {
    return 'A convenir';
  }
  
  // Agregar sufijo según tipo
  const sufijos = {
    [TIPOS_SALARIO.POR_HORA]: '/hora',
    [TIPOS_SALARIO.POR_DIA]: '/día',
    [TIPOS_SALARIO.POR_PROYECTO]: '/proyecto',
    [TIPOS_SALARIO.POR_SERVICIO]: '/servicio',
    [TIPOS_SALARIO.MENSUAL]: '/mes',
    [TIPOS_SALARIO.SEMANAL]: '/semana'
  };
  
  return `${rangoTexto}${sufijos[tipo] || ''}`;
};

// Generar slug
export const generarSlugEmpleo = (titulo, tipo, id) => {
  const prefijos = {
    [TIPOS_PUBLICACION.OFERTA_EMPLEO]: 'trabajo',
    [TIPOS_PUBLICACION.BUSQUEDA_EMPLEO]: 'busco',
    [TIPOS_PUBLICACION.SERVICIO_PROFESIONAL]: 'servicio'
  };
  
  const prefijo = prefijos[tipo] || 'empleo';
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 40);
  
  return `${prefijo}-${slug}-${id.substring(0, 8)}`;
};