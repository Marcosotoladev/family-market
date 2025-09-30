// src/types/categories.js

export const CATEGORIAS_PRODUCTOS = {
  // Tecnología y Electrónicos
  TECNOLOGIA: {
    id: 'tecnologia',
    nombre: 'Tecnología',
    subcategorias: {
      CELULARES_TABLETS: 'celulares_tablets',
      COMPUTACION: 'computacion', 
      AUDIO_VIDEO: 'audio_video',
      ELECTRODOMESTICOS: 'electrodomesticos',
      GAMING: 'gaming',
      ACCESORIOS_TECH: 'accesorios_tech',
      DRONES_CAMARAS: 'drones_camaras',
      SMARTWATCH_WEARABLES: 'smartwatch_wearables',
      COMPONENTES_PC: 'componentes_pc',
      REDES_WIFI: 'redes_wifi',
      OTRO_TECNOLOGIA: 'otro_tecnologia'
    }
  },

  // Vehículos y Transporte
  VEHICULOS: {
    id: 'vehiculos',
    nombre: 'Vehículos',
    subcategorias: {
      AUTOS: 'autos',
      MOTOS: 'motos',
      BICICLETAS: 'bicicletas',
      REPUESTOS_AUTO: 'repuestos_auto',
      REPUESTOS_MOTO: 'repuestos_moto',
      ACCESORIOS_AUTO: 'accesorios_auto',
      NEUMATICOS: 'neumaticos',
      CAMIONES_COMERCIALES: 'camiones_comerciales',
      NAUTICA: 'nautica',
      CUATRICICLOS_ATV: 'cuatriciclos_atv',
      SCOOTERS_PATINETAS: 'scooters_patinetas',
      OTRO_VEHICULO: 'otro_vehiculo'
    }
  },

  // Inmuebles y Propiedades
  INMUEBLES: {
    id: 'inmuebles',
    nombre: 'Inmuebles',
    subcategorias: {
      VENTA_CASAS: 'venta_casas',
      VENTA_DEPARTAMENTOS: 'venta_departamentos',
      ALQUILER_CASAS: 'alquiler_casas',
      ALQUILER_DEPARTAMENTOS: 'alquiler_departamentos',
      TERRENOS: 'terrenos',
      LOCALES_COMERCIALES: 'locales_comerciales',
      OFICINAS: 'oficinas',
      TEMPORARIOS: 'temporarios',
      CAMPOS_CHACRAS: 'campos_chacras',
      COCHERAS: 'cocheras',
      GALPONES_DEPOSITOS: 'galpones_depositos',
      OTRO_INMUEBLE: 'otro_inmueble'
    }
  },

  // Moda y Belleza
  MODA_BELLEZA: {
    id: 'moda_belleza',
    nombre: 'Moda y Belleza',
    subcategorias: {
      ROPA_MUJER: 'ropa_mujer',
      ROPA_HOMBRE: 'ropa_hombre',
      ROPA_INFANTIL: 'ropa_infantil',
      CALZADO: 'calzado',
      ACCESORIOS: 'accesorios',
      BELLEZA_CUIDADO: 'belleza_cuidado',
      JOYERIA_RELOJES: 'joyeria_relojes',
      LENTES: 'lentes',
      PERFUMES: 'perfumes',
      CARTERAS_BOLSOS: 'carteras_bolsos',
      ROPA_INTIMA: 'ropa_intima',
      OTRO_MODA: 'otro_moda'
    }
  },

  // Hogar y Decoración
  HOGAR_DECORACION: {
    id: 'hogar_decoracion',
    nombre: 'Hogar y Decoración',
    subcategorias: {
      MUEBLES: 'muebles',
      DECORACION: 'decoracion',
      TEXTILES_HOGAR: 'textiles_hogar',
      JARDIN_EXTERIOR: 'jardin_exterior',
      COCINA_COMEDOR: 'cocina_comedor',
      BAÑO: 'bano',
      ILUMINACION: 'iluminacion',
      HERRAMIENTAS: 'herramientas',
      CONSTRUCCION: 'construccion',
      PILETAS: 'piletas',
      ORGANIZACION_LIMPIEZA: 'organizacion_limpieza',
      SEGURIDAD_HOGAR: 'seguridad_hogar',
      OTRO_HOGAR: 'otro_hogar'
    }
  },

  // Mascotas
  MASCOTAS: {
    id: 'mascotas',
    nombre: 'Mascotas',
    subcategorias: {
      PERROS: 'perros',
      GATOS: 'gatos',
      AVES: 'aves',
      PECES: 'peces',
      CONEJOS_ROEDORES: 'conejos_roedores',
      REPTILES: 'reptiles',
      ALIMENTOS_MASCOTAS: 'alimentos_mascotas',
      ACCESORIOS_MASCOTAS: 'accesorios_mascotas',
      VETERINARIA: 'veterinaria',
      MEDICAMENTOS_MASCOTAS: 'medicamentos_mascotas',
      ACUARIOS_PECERAS: 'acuarios_peceras',
      OTRO_MASCOTA: 'otro_mascota'
    }
  },

  // Alimentos y Bebidas
  ALIMENTOS_BEBIDAS: {
    id: 'alimentos_bebidas', 
    nombre: 'Alimentos y Bebidas',
    subcategorias: {
      REPOSTERIA: 'reposteria',
      COMIDA_CASERA: 'comida_casera',
      PANADERIA: 'panaderia',
      BEBIDAS: 'bebidas',
      PRODUCTOS_ORGANICOS: 'productos_organicos',
      CONSERVAS_MERMELADAS: 'conservas_mermeladas',
      CATERING_EVENTOS: 'catering_eventos',
      CARNICERIA: 'carniceria',
      VERDULERIA: 'verduleria',
      LACTEOS: 'lacteos',
      VINOS_LICORES: 'vinos_licores',
      ESPECIAS_CONDIMENTOS: 'especias_condimentos',
      OTRO_ALIMENTO: 'otro_alimento'
    }
  },

  // Arte y Manualidades
  ARTE_MANUALIDADES: {
    id: 'arte_manualidades',
    nombre: 'Arte y Manualidades',
    subcategorias: {
      ARTESANIAS: 'artesanias',
      CUADROS_PINTURAS: 'cuadros_pinturas', 
      MANUALIDADES: 'manualidades',
      SOUVENIRS: 'souvenirs',
      TEJIDOS_CROCHET: 'tejidos_crochet',
      CERAMICA: 'ceramica',
      CARPINTERIA: 'carpinteria',
      ESCULTURAS: 'esculturas',
      MATERIALES_ARTE: 'materiales_arte',
      BORDADOS: 'bordados',
      JOYERIA_ARTESANAL: 'joyeria_artesanal',
      OTRO_ARTE: 'otro_arte'
    }
  },

  // Deportes y Fitness
  DEPORTES_FITNESS: {
    id: 'deportes_fitness',
    nombre: 'Deportes y Fitness',
    subcategorias: {
      ROPA_DEPORTIVA: 'ropa_deportiva',
      EQUIPOS_EJERCICIO: 'equipos_ejercicio',
      DEPORTES_ACUATICOS: 'deportes_acuaticos',
      FUTBOL: 'futbol',
      BASQUET: 'basquet',
      TENIS: 'tenis',
      CICLISMO: 'ciclismo',
      SUPLEMENTOS: 'suplementos',
      CAMPING_OUTDOOR: 'camping_outdoor',
      ARTES_MARCIALES: 'artes_marciales',
      GOLF: 'golf',
      RUNNING: 'running',
      OTRO_DEPORTE: 'otro_deporte'
    }
  },

  // Libros y Educación
  LIBROS_EDUCACION: {
    id: 'libros_educacion',
    nombre: 'Libros y Educación',
    subcategorias: {
      LIBROS_LITERATURA: 'libros_literatura',
      LIBROS_TECNICOS: 'libros_tecnicos',
      LIBROS_INFANTILES: 'libros_infantiles',
      MATERIAL_ESCOLAR: 'material_escolar',
      INSTRUMENTOS_MUSICALES: 'instrumentos_musicales',
      CURSOS_DIGITALES: 'cursos_digitales',
      LIBROS_RELIGIOSOS: 'libros_religiosos',
      COMICS_REVISTAS: 'comics_revistas',
      LIBROS_UNIVERSITARIOS: 'libros_universitarios',
      MATERIAL_OFICINA: 'material_oficina',
      OTRO_EDUCACION: 'otro_educacion'
    }
  },

  // Bebés y Niños
  BEBES_NIÑOS: {
    id: 'bebes_ninos',
    nombre: 'Bebés y Niños',
    subcategorias: {
      ROPA_BEBE: 'ropa_bebe',
      JUGUETES: 'juguetes',
      PAÑALERIA: 'panaleria',
      CUNAS_MUEBLES: 'cunas_muebles',
      COCHES_SILLAS: 'coches_sillas',
      ALIMENTACION_BEBE: 'alimentacion_bebe',
      SEGURIDAD_BEBE: 'seguridad_bebe',
      JUGUETES_EDUCATIVOS: 'juguetes_educativos',
      ROPA_NIÑOS: 'ropa_ninos',
      ACCESORIOS_BEBE: 'accesorios_bebe',
      OTRO_BEBE: 'otro_bebe'
    }
  },

  // Salud y Bienestar
  SALUD_BIENESTAR: {
    id: 'salud_bienestar',
    nombre: 'Salud y Bienestar',
    subcategorias: {
      PRODUCTOS_NATURALES: 'productos_naturales',
      VITAMINAS: 'vitaminas',
      ORTOPEDIA: 'ortopedia',
      RELAJACION: 'relajacion',
      EQUIPOS_MEDICOS: 'equipos_medicos',
      PRODUCTOS_DIETETICOS: 'productos_dieteticos',
      PRIMEROS_AUXILIOS: 'primeros_auxilios',
      TERAPIAS_ALTERNATIVAS: 'terapias_alternativas',
      OTRO_SALUD: 'otro_salud'
    }
  },

  // Música y Entretenimiento
  MUSICA_ENTRETENIMIENTO: {
    id: 'musica_entretenimiento',
    nombre: 'Música y Entretenimiento',
    subcategorias: {
      INSTRUMENTOS: 'instrumentos',
      VINILOS_CDS: 'vinilos_cds',
      EQUIPOS_AUDIO: 'equipos_audio',
      JUEGOS_MESA: 'juegos_mesa',
      PELICULAS_SERIES: 'peliculas_series',
      ENTRADAS_EVENTOS: 'entradas_eventos',
      ACCESORIOS_MUSICA: 'accesorios_musica',
      KARAOKE: 'karaoke',
      COLECCIONABLES: 'coleccionables',
      OTRO_ENTRETENIMIENTO: 'otro_entretenimiento'
    }
  },

  // Industria y Comercio
  INDUSTRIA_COMERCIO: {
    id: 'industria_comercio',
    nombre: 'Industria y Comercio',
    subcategorias: {
      MAQUINARIA: 'maquinaria',
      EQUIPOS_INDUSTRIALES: 'equipos_industriales',
      MATERIA_PRIMA: 'materia_prima',
      EQUIPOS_OFICINA: 'equipos_oficina',
      SEGURIDAD_INDUSTRIAL: 'seguridad_industrial',
      LOGISTICA: 'logistica',
      EQUIPOS_GASTRONOMIA: 'equipos_gastronomia',
      UNIFORMES_TRABAJO: 'uniformes_trabajo',
      PACKAGING: 'packaging',
      OTRO_INDUSTRIA: 'otro_industria'
    }
  },

  // Servicios (mantengo esta categoría pero podría moverse a CATEGORIAS_SERVICIOS)
  SERVICIOS: {
    id: 'servicios',
    nombre: 'Servicios',
    subcategorias: {
      LIMPIEZA: 'limpieza',
      MANTENIMIENTO: 'mantenimiento',
      CONSTRUCCION_REFORMA: 'construccion_reforma',
      JARDINERIA: 'jardineria',
      TRANSPORTE_FLETES: 'transporte_fletes',
      EVENTOS_FIESTAS: 'eventos_fiestas',
      BELLEZA_ESTETICA: 'belleza_estetica',
      SALUD_TERAPIAS: 'salud_terapias',
      EDUCACION_CLASES: 'educacion_clases',
      TECNICOS_REPARACIONES: 'tecnicos_reparaciones',
      OTRO_SERVICIO: 'otro_servicio'
    }
  },

  // Trabajo y Empleo (similar comentario - podría ir en CATEGORIAS_EMPLEO)
  TRABAJO: {
    id: 'trabajo',
    nombre: 'Trabajo',
    subcategorias: {
      EMPLEOS_TIEMPO_COMPLETO: 'empleos_tiempo_completo',
      EMPLEOS_MEDIO_TIEMPO: 'empleos_medio_tiempo',
      TRABAJOS_FREELANCE: 'trabajos_freelance',
      PRACTICAS_PASANTIAS: 'practicas_pasantias',
      EMPLEOS_DOMESTICOS: 'empleos_domesticos',
      VENTAS_COMERCIAL: 'ventas_comercial',
      TRABAJO_REMOTO: 'trabajo_remoto',
      OTRO_TRABAJO: 'otro_trabajo'
    }
  },

  // Otros Productos (Categoría General)
  OTROS: {
    id: 'otros',
    nombre: 'Otros Productos',
    subcategorias: {
      PRODUCTOS_VARIOS: 'productos_varios',
      ANTIGUEDADES: 'antiguedades',
      PRODUCTOS_IMPORTADOS: 'productos_importados',
      PRODUCTOS_ECOLOGICOS: 'productos_ecologicos',
      OTRO: 'otro'
    }
  }

  
}