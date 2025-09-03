// src/lib/helpers/employmentHelpers.js

import { TIPOS_EMPLEO, MODALIDADES_TRABAJO, NIVELES_EXPERIENCIA, CATEGORIAS_EMPLEO } from '../../types/employment'

// Crear publicación de empleo con validaciones
export const crearPublicacionEmpleo = ({
  id,
  usuarioId,
  tiendaId = null,
  tipo, // 'oferta' o 'demanda'
  titulo,
  descripcion,
  categoria,
  subcategoria = null,
  tipoEmpleo, // tiempo_completo, medio_tiempo, etc.
  modalidad, // presencial, remoto, hibrido
  ubicacion = '',
  salario = null,
  experiencia = null,
  contacto = {},
  fechaCreacion = new Date(),
  activo = true,
  destacado = false
}) => {
  // Validaciones básicas
  if (!id || !usuarioId || !tipo || !titulo || !categoria || !modalidad) {
    throw new Error('ID, usuarioId, tipo, titulo, categoria y modalidad son requeridos')
  }

  return {
    id,
    usuarioId,
    tiendaId,
    tipo,
    titulo: titulo.trim(),
    descripcion: descripcion?.trim() || '',
    categoria,
    subcategoria,
    tipoEmpleo,
    modalidad,
    ubicacion: ubicacion.trim(),
    salario: salario ? {
      minimo: salario.minimo || null,
      maximo: salario.maximo || null,
      tipo: salario.tipo || 'mensual', // 'por_hora', 'mensual', 'por_proyecto'
      moneda: salario.moneda || 'ARS'
    } : null,
    experiencia,
    contacto: {
      whatsapp: contacto.whatsapp?.trim() || '',
      email: contacto.email?.toLowerCase().trim() || '',
      telefono: contacto.telefono?.trim() || '',
      ...contacto
    },
    fechaCreacion,
    fechaActualizacion: new Date(),
    activo,
    destacado,
    // Campos adicionales
    slug: generarSlugEmpleo(titulo, tipo, id),
    palabrasClave: generarPalabrasClaveEmpleo(titulo, descripcion, categoria, subcategoria)
  }
}

// Generar slug para URL amigable
export const generarSlugEmpleo = (titulo, tipo, id) => {
  const prefijo = tipo === 'oferta' ? 'trabajo' : 'busco'
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios por guiones
    .substring(0, 40) // Máximo 40 caracteres
  
  return `${prefijo}-${slug}-${id.substring(0, 8)}`
}

// Generar palabras clave para búsqueda
export const generarPalabrasClaveEmpleo = (titulo, descripcion = '', categoria = '', subcategoria = '') => {
  const texto = `${titulo} ${descripcion} ${categoria} ${subcategoria}`.toLowerCase()
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras y números
    .split(/\s+/)
    .filter(palabra => palabra.length > 2) // Palabras de más de 2 caracteres
    .filter((palabra, index, array) => array.indexOf(palabra) === index) // Remover duplicados
}

// Formatear salario para mostrar
export const formatearSalario = (salario) => {
  if (!salario) return 'A convenir'
  
  const { minimo, maximo, tipo, moneda = '$' } = salario
  
  let sufijo = ''
  switch (tipo) {
    case 'por_hora':
      sufijo = 'por hora'
      break
    case 'mensual':
      sufijo = 'mensual'
      break
    case 'por_proyecto':
      sufijo = 'por proyecto'
      break
    default:
      sufijo = ''
  }
  
  if (minimo && maximo) {
    return `${moneda} ${minimo.toLocaleString()} - ${maximo.toLocaleString()} ${sufijo}`.trim()
  } else if (minimo) {
    return `Desde ${moneda} ${minimo.toLocaleString()} ${sufijo}`.trim()
  } else if (maximo) {
    return `Hasta ${maximo.toLocaleString()} ${sufijo}`.trim()
  }
  
  return 'A convenir'
}

// Validar salario
export const validarSalario = (salario) => {
  if (!salario) return { valido: true } // Es opcional
  
  const errores = []
  
  if (salario.minimo && (isNaN(salario.minimo) || salario.minimo < 0)) {
    errores.push('Salario mínimo debe ser un número positivo')
  }
  
  if (salario.maximo && (isNaN(salario.maximo) || salario.maximo < 0)) {
    errores.push('Salario máximo debe ser un número positivo')
  }
  
  if (salario.minimo && salario.maximo && salario.minimo > salario.maximo) {
    errores.push('Salario mínimo no puede ser mayor al máximo')
  }
  
  if (salario.tipo && !['por_hora', 'mensual', 'por_proyecto'].includes(salario.tipo)) {
    errores.push('Tipo de salario no válido')
  }

  return {
    valido: errores.length === 0,
    errores
  }
}

// Validar publicación de empleo
export const validarPublicacionEmpleo = (publicacion) => {
  const errores = []

  // Validaciones básicas
  if (!publicacion.tipo || !['oferta', 'demanda'].includes(publicacion.tipo)) {
    errores.push('Tipo de publicación no válido (debe ser "oferta" o "demanda")')
  }
  
  if (!publicacion.titulo) errores.push('Título es requerido')
  if (publicacion.titulo && publicacion.titulo.length < 5) {
    errores.push('Título debe tener al menos 5 caracteres')
  }
  if (publicacion.titulo && publicacion.titulo.length > 100) {
    errores.push('Título no puede exceder 100 caracteres')
  }
  
  if (publicacion.descripcion && publicacion.descripcion.length > 2000) {
    errores.push('Descripción no puede exceder 2000 caracteres')
  }
  
  if (!publicacion.categoria) {
    errores.push('Categoría es requerida')
  } else {
    // Validar que la categoría existe
    const categoriaValida = Object.values(CATEGORIAS_EMPLEO).find(cat => cat.id === publicacion.categoria)
    if (!categoriaValida) {
      errores.push('Categoría no válida')
    } else if (publicacion.subcategoria) {
      // Validar subcategoría si está presente
      const subcategoriaValida = Object.values(categoriaValida.subcategorias).includes(publicacion.subcategoria)
      if (!subcategoriaValida) {
        errores.push('Subcategoría no válida para la categoría seleccionada')
      }
    }
  }
  
  if (!publicacion.modalidad) {
    errores.push('Modalidad de trabajo es requerida')
  } else {
    const modalidadValida = Object.values(MODALIDADES_TRABAJO).find(mod => mod.id === publicacion.modalidad)
    if (!modalidadValida) {
      errores.push('Modalidad de trabajo no válida')
    }
  }
  
  if (publicacion.tipoEmpleo) {
    const tipoEmpleoValido = Object.values(TIPOS_EMPLEO).find(tipo => tipo.id === publicacion.tipoEmpleo)
    if (!tipoEmpleoValido) {
      errores.push('Tipo de empleo no válido')
    }
  }
  
  if (publicacion.experiencia) {
    const experienciaValida = Object.values(NIVELES_EXPERIENCIA).find(exp => exp.id === publicacion.experiencia)
    if (!experienciaValida) {
      errores.push('Nivel de experiencia no válido')
    }
  }
  
  // Validar salario
  if (publicacion.salario) {
    const validacionSalario = validarSalario(publicacion.salario)
    errores.push(...(validacionSalario.errores || []))
  }
  
  // Validar contacto (al menos uno requerido)
  const tieneContacto = publicacion.contacto?.whatsapp || 
                       publicacion.contacto?.email || 
                       publicacion.contacto?.telefono
  
  if (!tieneContacto) {
    errores.push('Debe proporcionar al menos un método de contacto')
  }

  // Validar email si está presente
  if (publicacion.contacto?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(publicacion.contacto.email)) {
      errores.push('Email no válido')
    }
  }

  return {
    valido: errores.length === 0,
    errores
  }
}

// Filtrar publicaciones por tipo
export const filtrarPorTipo = (publicaciones, tipo) => {
  return publicaciones.filter(pub => pub.tipo === tipo)
}

// Filtrar por tipo de empleo
export const filtrarPorTipoEmpleo = (publicaciones, tipoEmpleo) => {
  return publicaciones.filter(pub => pub.tipoEmpleo === tipoEmpleo)
}

// Filtrar por modalidad de trabajo
export const filtrarPorModalidad = (publicaciones, modalidad) => {
  return publicaciones.filter(pub => pub.modalidad === modalidad)
}

// Filtrar por categoría
export const filtrarPorCategoria = (publicaciones, categoria, subcategoria = null) => {
  return publicaciones.filter(pub => {
    if (pub.categoria !== categoria) return false
    if (subcategoria && pub.subcategoria !== subcategoria) return false
    return true
  })
}

// Filtrar por nivel de experiencia
export const filtrarPorExperiencia = (publicaciones, experiencia) => {
  return publicaciones.filter(pub => pub.experiencia === experiencia || !pub.experiencia)
}

// Filtrar por rango salarial
export const filtrarPorSalario = (publicaciones, salarioMin, salarioMax) => {
  return publicaciones.filter(pub => {
    if (!pub.salario) return true // Incluir "a convenir"
    
    const { minimo, maximo } = pub.salario
    
    // Si la publicación tiene rango salarial
    if (minimo && maximo) {
      return (minimo <= salarioMax) && (maximo >= salarioMin)
    }
    
    // Si solo tiene salario mínimo
    if (minimo) {
      return minimo <= salarioMax
    }
    
    // Si solo tiene salario máximo
    if (maximo) {
      return maximo >= salarioMin
    }
    
    return true
  })
}

// Filtrar por ubicación
export const filtrarPorUbicacion = (publicaciones, ubicacion) => {
  if (!ubicacion) return publicaciones
  
  const ubicacionLimpia = ubicacion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  return publicaciones.filter(pub => {
    if (!pub.ubicacion) return false
    
    const pubUbicacion = pub.ubicacion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return pubUbicacion.includes(ubicacionLimpia)
  })
}

// Buscar empleos por texto
export const buscarEmpleos = (publicaciones, termino) => {
  if (!termino || termino.length < 2) return publicaciones
  
  const terminoLimpio = termino
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  
  return publicaciones.filter(pub => {
    const palabrasClave = pub.palabrasClave || 
                         generarPalabrasClaveEmpleo(pub.titulo, pub.descripcion, pub.categoria, pub.subcategoria)
    
    return palabrasClave.some(palabra => 
      palabra.includes(terminoLimpio) || terminoLimpio.includes(palabra)
    )
  })
}

// Ordenar publicaciones
export const ordenarPublicaciones = (publicaciones, criterio = 'fecha_desc') => {
  const copia = [...publicaciones]
  
  switch (criterio) {
    case 'fecha_desc':
      return copia.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    case 'fecha_asc':
      return copia.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))
    case 'salario_desc':
      return copia.sort((a, b) => {
        const salarioA = a.salario?.maximo || a.salario?.minimo || 0
        const salarioB = b.salario?.maximo || b.salario?.minimo || 0
        return salarioB - salarioA
      })
    case 'salario_asc':
      return copia.sort((a, b) => {
        const salarioA = a.salario?.minimo || a.salario?.maximo || 0
        const salarioB = b.salario?.minimo || b.salario?.maximo || 0
        return salarioA - salarioB
      })
    case 'titulo':
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo))
    case 'destacado':
      return copia.sort((a, b) => {
        if (a.destacado && !b.destacado) return -1
        if (!a.destacado && b.destacado) return 1
        return new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      })
    default:
      return copia
  }
}

// Obtener texto descriptivo del tipo de publicación
export const obtenerTextoTipo = (tipo) => {
  switch (tipo) {
    case 'oferta':
      return 'Oferta de trabajo'
    case 'demanda':
      return 'Búsqueda laboral'
    default:
      return 'Empleo'
  }
}

// Obtener texto descriptivo del tipo de empleo
export const obtenerTextoTipoEmpleo = (tipoEmpleo) => {
  const tipo = Object.values(TIPOS_EMPLEO).find(t => t.id === tipoEmpleo)
  return tipo ? tipo.nombre : tipoEmpleo
}

// Obtener texto descriptivo de la modalidad
export const obtenerTextoModalidad = (modalidad) => {
  const mod = Object.values(MODALIDADES_TRABAJO).find(m => m.id === modalidad)
  return mod ? mod.nombre : modalidad
}

// Obtener texto descriptivo de la experiencia
export const obtenerTextoExperiencia = (experiencia) => {
  const exp = Object.values(NIVELES_EXPERIENCIA).find(e => e.id === experiencia)
  return exp ? exp.nombre : experiencia
}

// Obtener texto descriptivo de la categoría
export const obtenerTextoCategoria = (categoria, subcategoria = null) => {
  const cat = Object.values(CATEGORIAS_EMPLEO).find(c => c.id === categoria)
  if (!cat) return categoria
  
  if (subcategoria && cat.subcategorias[subcategoria]) {
    return `${cat.nombre} - ${subcategoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
  }
  
  return cat.nombre
}

// Función para aplicar múltiples filtros
export const aplicarFiltros = (publicaciones, filtros = {}) => {
  let resultado = [...publicaciones]
  
  if (filtros.tipo) {
    resultado = filtrarPorTipo(resultado, filtros.tipo)
  }
  
  if (filtros.tipoEmpleo) {
    resultado = filtrarPorTipoEmpleo(resultado, filtros.tipoEmpleo)
  }
  
  if (filtros.modalidad) {
    resultado = filtrarPorModalidad(resultado, filtros.modalidad)
  }
  
  if (filtros.categoria) {
    resultado = filtrarPorCategoria(resultado, filtros.categoria, filtros.subcategoria)
  }
  
  if (filtros.experiencia) {
    resultado = filtrarPorExperiencia(resultado, filtros.experiencia)
  }
  
  if (filtros.salarioMin || filtros.salarioMax) {
    resultado = filtrarPorSalario(resultado, filtros.salarioMin || 0, filtros.salarioMax || Infinity)
  }
  
  if (filtros.ubicacion) {
    resultado = filtrarPorUbicacion(resultado, filtros.ubicacion)
  }
  
  if (filtros.busqueda) {
    resultado = buscarEmpleos(resultado, filtros.busqueda)
  }
  
  // Siempre ordenar al final
  resultado = ordenarPublicaciones(resultado, filtros.orden || 'destacado')
  
  return resultado
}