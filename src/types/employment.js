// src/types/employment.js

// TIPOS DE EMPLEO
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
    descripcion: 'Trabajo por temporadas específicas'
  }
}

// MODALIDADES DE TRABAJO
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
}

// NIVELES DE EXPERIENCIA
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
  LIDER: {
    id: 'lider',
    nombre: 'Líder/Gerencial',
    descripcion: '8+ años con experiencia en liderazgo'
  }
}

// CATEGORÍAS DE EMPLEO
export const CATEGORIAS_EMPLEO = {
  ADMINISTRACION: {
    id: 'administracion',
    nombre: 'Administración',
    subcategorias: {
      CONTABILIDAD: 'contabilidad',
      RECURSOS_HUMANOS: 'recursos_humanos',
      SECRETARIADO: 'secretariado',
      FINANZAS: 'finanzas',
      ADMINISTRACION_GENERAL: 'administracion_general',
      OTRO: 'otro'
    }
  },
  
  TECNOLOGIA: {
    id: 'tecnologia',
    nombre: 'Tecnología',
    subcategorias: {
      DESARROLLO_WEB: 'desarrollo_web',
      DESARROLLO_MOBILE: 'desarrollo_mobile',
      SOPORTE_TECNICO: 'soporte_tecnico',
      DISEÑO_UX_UI: 'diseño_ux_ui',
      MARKETING_DIGITAL: 'marketing_digital',
      DATOS_ANALYTICS: 'datos_analytics',
      CIBERSEGURIDAD: 'ciberseguridad',
      DEVOPS: 'devops',
      QA_TESTING: 'qa_testing',
      OTRO: 'otro'
    }
  },
  
  MARKETING_VENTAS: {
    id: 'marketing_ventas',
    nombre: 'Marketing y Ventas',
    subcategorias: {
      VENTAS: 'ventas',
      MARKETING: 'marketing',
      ATENCION_CLIENTE: 'atencion_cliente',
      COMMUNITY_MANAGER: 'community_manager',
      PUBLICIDAD: 'publicidad',
      RELACIONES_PUBLICAS: 'relaciones_publicas',
      OTRO: 'otro'
    }
  },
  
  SERVICIOS_OFICIOS: {
    id: 'servicios_oficios',
    nombre: 'Servicios y Oficios',
    subcategorias: {
      LIMPIEZA: 'limpieza',
      MANTENIMIENTO: 'mantenimiento',
      JARDINERIA: 'jardineria',
      PLOMERIA: 'plomeria',
      ELECTRICIDAD: 'electricidad',
      CARPINTERIA: 'carpinteria',
      PINTURA: 'pintura',
      AIRE_ACONDICIONADO: 'aire_acondicionado',
      CERRAJERIA: 'cerrajeria',
      OTRO: 'otro'
    }
  },
  
  GASTRONOMIA: {
    id: 'gastronomia',
    nombre: 'Gastronomía',
    subcategorias: {
      COCINERO: 'cocinero',
      MESERO: 'mesero',
      BARTENDER: 'bartender',
      DELIVERY: 'delivery',
      PANADERO: 'panadero',
      PASTELERO: 'pastelero',
      AYUDANTE_COCINA: 'ayudante_cocina',
      OTRO: 'otro'
    }
  },
  
  EDUCACION: {
    id: 'educacion',
    nombre: 'Educación',
    subcategorias: {
      PROFESOR: 'profesor',
      TUTOR: 'tutor',
      CUIDADO_NINOS: 'cuidado_ninos',
      ENTRENADOR: 'entrenador',
      IDIOMAS: 'idiomas',
      EDUCACION_ESPECIAL: 'educacion_especial',
      OTRO: 'otro'
    }
  },
  
  SALUD_BIENESTAR: {
    id: 'salud_bienestar',
    nombre: 'Salud y Bienestar',
    subcategorias: {
      ENFERMERIA: 'enfermeria',
      CUIDADO_PERSONAS: 'cuidado_personas',
      MASAJES: 'masajes',
      BELLEZA: 'belleza',
      FISIOTERAPIA: 'fisioterapia',
      NUTRICION: 'nutricion',
      PSICOLOGIA: 'psicologia',
      OTRO: 'otro'
    }
  },
  
  TRANSPORTE_LOGISTICA: {
    id: 'transporte_logistica',
    nombre: 'Transporte y Logística',
    subcategorias: {
      CONDUCTOR: 'conductor',
      DELIVERY: 'delivery',
      ALMACEN: 'almacen',
      LOGISTICA: 'logistica',
      MENSAJERIA: 'mensajeria',
      OTRO: 'otro'
    }
  },

  CONSTRUCCION: {
    id: 'construccion',
    nombre: 'Construcción',
    subcategorias: {
      ALBAÑIL: 'albañil',
      SOLDADOR: 'soldador',
      ARQUITECTO: 'arquitecto',
      INGENIERO: 'ingeniero',
      OPERADOR_MAQUINARIA: 'operador_maquinaria',
      SUPERVISOR_OBRA: 'supervisor_obra',
      OTRO: 'otro'
    }
  },

  RETAIL_COMERCIO: {
    id: 'retail_comercio',
    nombre: 'Retail y Comercio',
    subcategorias: {
      VENDEDOR: 'vendedor',
      CAJERO: 'cajero',
      SUPERVISOR_TIENDA: 'supervisor_tienda',
      REPOSITOR: 'repositor',
      VISUAL_MERCHANDISING: 'visual_merchandising',
      OTRO: 'otro'
    }
  },

  ENTRETENIMIENTO: {
    id: 'entretenimiento',
    nombre: 'Entretenimiento',
    subcategorias: {
      MUSICO: 'musico',
      ANIMADOR: 'animador',
      FOTOGRAFO: 'fotografo',
      VIDEOEDITOR: 'videoeditor',
      ACTOR: 'actor',
      DJ: 'dj',
      OTRO: 'otro'
    }
  },

  SEGURIDAD: {
    id: 'seguridad',
    nombre: 'Seguridad',
    subcategorias: {
      GUARDIA_SEGURIDAD: 'guardia_seguridad',
      VIGILANCIA: 'vigilancia',
      SEGURIDAD_PRIVADA: 'seguridad_privada',
      OTRO: 'otro'
    }
  },

  DEPORTES_FITNESS: {
    id: 'deportes_fitness',
    nombre: 'Deportes y Fitness',
    subcategorias: {
      ENTRENADOR_PERSONAL: 'entrenador_personal',
      INSTRUCTOR_YOGA: 'instructor_yoga',
      NUTRICIONISTA_DEPORTIVO: 'nutricionista_deportivo',
      MASAJISTA_DEPORTIVO: 'masajista_deportivo',
      OTRO: 'otro'
    }
  },

  OTRO: {
    id: 'otro',
    nombre: 'Otro',
    subcategorias: {
      GENERAL: 'general'
    }
  }
}