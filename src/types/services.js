// src/types/services.js

export const CATEGORIAS_SERVICIOS = {
  // Servicios Profesionales
  PROFESIONALES: {
    id: 'profesionales',
    nombre: 'Servicios Profesionales',
    subcategorias: {
      CONTABILIDAD: 'contabilidad',
      ABOGACIA: 'abogacia',
      ARQUITECTURA: 'arquitectura',
      DISEÑO_GRAFICO: 'diseno_grafico',
      MARKETING_DIGITAL: 'marketing_digital',
      DESARROLLO_WEB: 'desarrollo_web',
      FOTOGRAFIA: 'fotografia',
      TRADUCCION: 'traduccion',
      CONSULTORIA: 'consultoria',
      OTRO_PROFESIONAL: 'otro_profesional'
    }
  },

  // Servicios del Hogar
  HOGAR_MANTENIMIENTO: {
    id: 'hogar_mantenimiento',
    nombre: 'Hogar y Mantenimiento',
    subcategorias: {
      LIMPIEZA: 'limpieza',
      PLOMERIA: 'plomeria',
      ELECTRICIDAD: 'electricidad',
      PINTURA: 'pintura',
      CARPINTERIA: 'carpinteria',
      JARDINERIA: 'jardineria',
      AIRE_ACONDICIONADO: 'aire_acondicionado',
      CERRAJERIA: 'cerrajeria',
      MUDANZAS: 'mudanzas',
      OTRO_HOGAR: 'otro_hogar'
    }
  },

  // Servicios de Belleza y Bienestar
  BELLEZA_BIENESTAR: {
    id: 'belleza_bienestar',
    nombre: 'Belleza y Bienestar',
    subcategorias: {
      PELUQUERIA: 'peluqueria',
      ESTETICA: 'estetica',
      MANICURA_PEDICURA: 'manicura_pedicura',
      MASAJES: 'masajes',
      DEPILACION: 'depilacion',
      MAQUILLAJE: 'maquillaje',
      BARBERIA: 'barberia',
      SPA_RELAJACION: 'spa_relajacion',
      CEJAS_PESTAÑAS: 'cejas_pestanas',
      OTRO_BELLEZA: 'otro_belleza'
    }
  },

  // Educación y Clases
  EDUCACION_CLASES: {
    id: 'educacion_clases',
    nombre: 'Educación y Clases',
    subcategorias: {
      CLASES_PARTICULARES: 'clases_particulares',
      IDIOMAS: 'idiomas',
      MUSICA: 'musica',
      ARTE: 'arte',
      DEPORTES: 'deportes',
      INFORMATICA: 'informatica',
      APOYO_ESCOLAR: 'apoyo_escolar',
      CURSOS_OFICIOS: 'cursos_oficios',
      CAPACITACION_EMPRESARIAL: 'capacitacion_empresarial',
      COACHING: 'coaching',
      OTRO_EDUCACION: 'otro_educacion'
    }
  },

  // Transporte y Logística
  TRANSPORTE_LOGISTICA: {
    id: 'transporte_logistica',
    nombre: 'Transporte y Logística',
    subcategorias: {
      DELIVERY: 'delivery',
      MUDANZAS: 'mudanzas',
      TRANSPORTE_PERSONAS: 'transporte_personas',
      FLETES: 'fletes',
      ENVIOS: 'envios',
      REMIS_TAXI: 'remis_taxi',
      TRANSPORTE_ESCOLAR: 'transporte_escolar',
      OTRO_TRANSPORTE: 'otro_transporte'
    }
  },

  // Eventos y Celebraciones
  EVENTOS_CELEBRACIONES: {
    id: 'eventos_celebraciones',
    nombre: 'Eventos y Celebraciones',
    subcategorias: {
      CATERING: 'catering',
      DECORACION_EVENTOS: 'decoracion_eventos',
      ANIMACION: 'animacion',
      MUSICA_EVENTOS: 'musica_eventos',
      FOTOGRAFIA_EVENTOS: 'fotografia_eventos',
      VIDEO_EVENTOS: 'video_eventos',
      TORTAS_REPOSTERIA: 'tortas_reposteria',
      ORGANIZACION_EVENTOS: 'organizacion_eventos',
      SONIDO_ILUMINACION: 'sonido_iluminacion',
      ALQUILER_EQUIPOS: 'alquiler_equipos',
      OTRO_EVENTO: 'otro_evento'
    }
  },

  // Servicios Técnicos
  SERVICIOS_TECNICOS: {
    id: 'servicios_tecnicos',
    nombre: 'Servicios Técnicos',
    subcategorias: {
      REPARACION_CELULARES: 'reparacion_celulares',
      REPARACION_COMPUTADORAS: 'reparacion_computadoras',
      INSTALACION_SOFTWARE: 'instalacion_software',
      SOPORTE_TECNICO: 'soporte_tecnico',
      REPARACION_ELECTRODOMESTICOS: 'reparacion_electrodomesticos',
      INSTALACION_TV_AUDIO: 'instalacion_tv_audio',
      REDES_WIFI: 'redes_wifi',
      OTRO_TECNICO: 'otro_tecnico'
    }
  },

  // Cuidado y Asistencia
  CUIDADO_ASISTENCIA: {
    id: 'cuidado_asistencia',
    nombre: 'Cuidado y Asistencia',
    subcategorias: {
      CUIDADO_NIÑOS: 'cuidado_ninos',
      CUIDADO_ADULTOS_MAYORES: 'cuidado_adultos_mayores',
      CUIDADO_MASCOTAS: 'cuidado_mascotas',
      ENFERMERIA: 'enfermeria',
      ACOMPAÑANTE: 'acompanante',
      PASEO_MASCOTAS: 'paseo_mascotas',
      VETERINARIA_DOMICILIO: 'veterinaria_domicilio',
      OTRO_CUIDADO: 'otro_cuidado'
    }
  },

  // Servicios Automotrices
  AUTOMOTRIZ: {
    id: 'automotriz',
    nombre: 'Servicios Automotrices',
    subcategorias: {
      MECANICA: 'mecanica',
      CHAPA_PINTURA: 'chapa_pintura',
      LAVADO_AUTO: 'lavado_auto',
      GOMERIA: 'gomeria',
      ALARMAS_AUDIO: 'alarmas_audio',
      CRISTALES: 'cristales',
      AIRE_ACONDICIONADO_AUTO: 'aire_acondicionado_auto',
      ELECTRICIDAD_AUTO: 'electricidad_auto',
      CERRAJERIA_AUTO: 'cerrajeria_auto',
      OTRO_AUTOMOTRIZ: 'otro_automotriz'
    }
  },

  // Servicios Financieros
  FINANCIEROS: {
    id: 'financieros',
    nombre: 'Servicios Financieros',
    subcategorias: {
      SEGUROS: 'seguros',
      PRESTAMOS: 'prestamos',
      INVERSIONES: 'inversiones',
      GESTORIA: 'gestoria',
      ASESORIA_FINANCIERA: 'asesoria_financiera',
      TRAMITES_BANCARIOS: 'tramites_bancarios',
      OTRO_FINANCIERO: 'otro_financiero'
    }
  },

  // Servicios de Salud
  SALUD: {
    id: 'salud',
    nombre: 'Servicios de Salud',
    subcategorias: {
      KINESIOLOGIA: 'kinesiologia',
      NUTRICION: 'nutricion',
      PSICOLOGIA: 'psicologia',
      PODOLOGIA: 'podologia',
      FISIOTERAPIA: 'fisioterapia',
      TERAPIA_OCUPACIONAL: 'terapia_ocupacional',
      FONOAUDIOLOGIA: 'fonoaudiologia',
      PSICOPEDAGOGIA: 'psicopedagogia',
      OSTEOPATIA: 'osteopatia',
      QUIROPRAXIA: 'quiropraxia',
      ACUPUNTURA: 'acupuntura',
      REFLEXOLOGIA: 'reflexologia',
      REIKI_TERAPIAS_ALTERNATIVAS: 'reiki_terapias_alternativas',
      ENFERMERIA_DOMICILIO: 'enfermeria_domicilio',
      CUIDADOS_MEDICOS: 'cuidados_medicos',
      LABORATORIO_DOMICILIO: 'laboratorio_domicilio',
      CONSULTAS_ONLINE: 'consultas_online',
      OTRO_SALUD: 'otro_salud'
    }
  },

  // Otros Servicios (Categoría General)
  OTROS: {
    id: 'otros',
    nombre: 'Otros Servicios',
    subcategorias: {
      SERVICIOS_GENERALES: 'servicios_generales',
      TRAMITES_GESTIONES: 'tramites_gestiones',
      SERVICIOS_PERSONALES: 'servicios_personales',
      SERVICIOS_DIGITALES: 'servicios_digitales',
      OTRO: 'otro'
    }
  }
}