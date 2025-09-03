// src/lib/helpers/serviceHelpers.js

import { CATEGORIAS_SERVICIOS } from '../../types/services.js'

// Crear servicio con validaciones
export const crearServicio = ({
  id,
  tiendaId,
  usuarioId,
  titulo,
  descripcion,
  categoria,
  subcategoria = null,
  precio = null,
  tipoTarifa = 'fijo', // 'fijo', 'por_hora', 'por_dia', 'por_proyecto', 'a_consultar'
  modalidad = 'presencial', // 'presencial', 'domicilio', 'remoto', 'hibrido'
  zona_atencion = '',
  horarios = null,
  disponible = true,
  destacado = false,
  imagenes = [],
  tags = [],
  certificaciones = [],
  experiencia_años = null,
  contacto = {},
  fechaCreacion = new Date(),
  fechaActualizacion = new Date()
}) => {
  // Validaciones básicas
  if (!id || !tiendaId || !usuarioId || !titulo || !categoria) {
    throw new Error('ID, tiendaId, usuarioId, titulo y categoria son requeridos')
  }

  return {
    id,
    tiendaId,
    usuarioId,
    titulo: titulo.trim(),
    descripcion: descripcion?.trim() || '',
    categoria,
    subcategoria,
    precio: precio ? {
      valor: parseFloat(precio.valor) || 0,
      tipo: tipoTarifa,
      moneda: precio.moneda || 'ARS'
    } : null,
    tipoTarifa,
    modalidad,
    zona_atencion: zona_atencion.trim(),
    horarios: horarios || {
      lunes_viernes: null,
      sabados: null,
      domingos: null,
      disponible_24h: false
    },
    disponible,
    destacado,
    imagenes: Array.isArray(imagenes) ? imagenes : [],
    tags: Array.isArray(tags) ? tags : [],
    certificaciones: Array.isArray(certificaciones) ? certificaciones : [],
    experiencia_años: experiencia_años ? parseInt(experiencia_años) : null,
    contacto: {
      whatsapp: contacto.whatsapp?.trim() || '',
      email: contacto.email?.toLowerCase().trim() || '',
      telefono: contacto.telefono?.trim() || '',
      ...contacto
    },
    fechaCreacion,
    fechaActualizacion,
    // Campos adicionales
    slug: generarSlugServicio(titulo, id),
    palabrasClave: generarPalabrasClaveServicio(titulo, descripcion, categoria, subcategoria, tags)
  }
}

// Generar slug para URL amigable
export const generarSlugServicio = (titulo, id) => {
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios por guiones
    .substring(0, 50) // Máximo 50 caracteres
  
  return `servicio-${slug}-${id.substring(0, 8)}`
}

// Generar palabras clave para búsqueda
export const generarPalabrasClaveServicio = (titulo, descripcion = '', categoria = '', subcategoria = '', tags = []) => {
  // Obtener nombre legible de la categoría
  const categoriaObj = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoria)
  
  const nombreCategoria = categoriaObj ? categoriaObj.nombre : categoria
  
  // Generar nombre legible de subcategoría
  const nombreSubcategoria = subcategoria ? 
    subcategoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
  
  // Combinar tags si es array
  const tagsTexto = Array.isArray(tags) ? tags.join(' ') : ''
  
  const texto = `${titulo} ${descripcion} ${nombreCategoria} ${nombreSubcategoria} ${tagsTexto}`.toLowerCase()
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras y números
    .split(/\s+/)
    .filter(palabra => palabra.length > 2) // Palabras de más de 2 caracteres
    .filter((palabra, index, array) => array.indexOf(palabra) === index) // Remover duplicados
}

// Validar categoría y subcategoría
export const validarCategoriaServicio = (categoria, subcategoria = null) => {
  const categoriaObj = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoria)
  
  if (!categoriaObj) {
    return { valido: false, error: 'Categoría no válida' }
  }
  
  if (subcategoria) {
    const subcategorias = Object.values(categoriaObj.subcategorias)
    if (!subcategorias.includes(subcategoria)) {
      return { valido: false, error: 'Subcategoría no válida para la categoría seleccionada' }
    }
  }
  
  return { valido: true }
}

// Validar precio del servicio
export const validarPrecioServicio = (precio) => {
  if (!precio || precio.valor === null || precio.valor === undefined) {
    return { valido: true } // Precio es opcional (puede ser "a consultar")
  }
  
  const precioNum = parseFloat(precio.valor)
  
  if (isNaN(precioNum)) {
    return { valido: false, error: 'Precio debe ser un número válido' }
  }
  
  if (precioNum < 0) {
    return { valido: false, error: 'Precio no puede ser negativo' }
  }
  
  if (precioNum > 999999999) {
    return { valido: false, error: 'Precio demasiado alto' }
  }

  const tiposValidos = ['fijo', 'por_hora', 'por_dia', 'por_proyecto', 'a_consultar']
  if (!tiposValidos.includes(precio.tipo)) {
    return { valido: false, error: 'Tipo de tarifa no válido' }
  }

  return { valido: true, precio: precioNum }
}

// Validar modalidad del servicio
export const validarModalidad = (modalidad) => {
  const modalidadesValidas = ['presencial', 'domicilio', 'remoto', 'hibrido']
  
  if (!modalidadesValidas.includes(modalidad)) {
    return { valido: false, error: 'Modalidad debe ser: presencial, domicilio, remoto o hibrido' }
  }
  
  return { valido: true }
}

// Validar horarios
export const validarHorarios = (horarios) => {
  if (!horarios) return { valido: true }
  
  const errores = []
  
  // Validar formato de horarios si están definidos
  ['lunes_viernes', 'sabados', 'domingos'].forEach(dia => {
    if (horarios[dia]) {
      const horario = horarios[dia]
      if (!horario.inicio || !horario.fin) {
        errores.push(`Horario de ${dia.replace('_', ' ')}: debe incluir hora de inicio y fin`)
      }
    }
  })
  
  return {
    valido: errores.length === 0,
    errores
  }
}

// Validar datos completos del servicio
export const validarServicio = (servicio) => {
  const errores = []

  // Validaciones básicas
  if (!servicio.titulo) errores.push('Título es requerido')
  if (servicio.titulo && servicio.titulo.length < 5) {
    errores.push('Título debe tener al menos 5 caracteres')
  }
  if (servicio.titulo && servicio.titulo.length > 100) {
    errores.push('Título no puede exceder 100 caracteres')
  }
  
  if (servicio.descripcion && servicio.descripcion.length > 2000) {
    errores.push('Descripción no puede exceder 2000 caracteres')
  }
  
  if (!servicio.categoria) {
    errores.push('Categoría es requerida')
  } else {
    const validacionCategoria = validarCategoriaServicio(servicio.categoria, servicio.subcategoria)
    if (!validacionCategoria.valido) {
      errores.push(validacionCategoria.error)
    }
  }
  
  // Validar modalidad
  if (servicio.modalidad) {
    const validacionModalidad = validarModalidad(servicio.modalidad)
    if (!validacionModalidad.valido) {
      errores.push(validacionModalidad.error)
    }
  }
  
  // Validar precio si está presente
  if (servicio.precio) {
    const validacionPrecio = validarPrecioServicio(servicio.precio)
    if (!validacionPrecio.valido) {
      errores.push(validacionPrecio.error)
    }
  }
  
  // Validar horarios si están presentes
  if (servicio.horarios) {
    const validacionHorarios = validarHorarios(servicio.horarios)
    errores.push(...(validacionHorarios.errores || []))
  }
  
  // Validar experiencia en años
  if (servicio.experiencia_años !== null && servicio.experiencia_años !== undefined) {
    const exp = parseInt(servicio.experiencia_años)
    if (isNaN(exp) || exp < 0 || exp > 50) {
      errores.push('Años de experiencia debe ser un número entre 0 y 50')
    }
  }
  
  // Validar contacto (al menos uno requerido)
  const tieneContacto = servicio.contacto?.whatsapp || 
                       servicio.contacto?.email || 
                       servicio.contacto?.telefono
  
  if (!tieneContacto) {
    errores.push('Debe proporcionar al menos un método de contacto')
  }

  // Validar email si está presente
  if (servicio.contacto?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(servicio.contacto.email)) {
      errores.push('Email no válido')
    }
  }

  return {
    valido: errores.length === 0,
    errores
  }
}

// Formatear precio para mostrar
export const formatearPrecioServicio = (servicio) => {
  if (!servicio.precio || !servicio.precio.valor) {
    return 'Precio a consultar'
  }
  
  const { valor, tipo, moneda = '$' } = servicio.precio
  const precio = `${moneda} ${parseFloat(valor).toLocaleString('es-AR')}`
  
  switch (tipo) {
    case 'por_hora':
      return `${precio} por hora`
    case 'por_dia':
      return `${precio} por día`
    case 'por_proyecto':
      return `${precio} por proyecto`
    case 'fijo':
      return precio
    case 'a_consultar':
    default:
      return 'Precio a consultar'
  }
}

// Filtrar servicios por categoría
export const filtrarPorCategoriaServicio = (servicios, categoria, subcategoria = null) => {
  return servicios.filter(servicio => {
    const coincideCategoria = servicio.categoria === categoria
    if (!subcategoria) return coincideCategoria
    
    return coincideCategoria && servicio.subcategoria === subcategoria
  })
}

// Filtrar por modalidad
export const filtrarPorModalidad = (servicios, modalidad) => {
  return servicios.filter(servicio => servicio.modalidad === modalidad)
}

// Filtrar por zona de atención
export const filtrarPorZona = (servicios, zona) => {
  if (!zona) return servicios
  
  const zonaLimpia = zona.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  return servicios.filter(servicio => {
    if (!servicio.zona_atencion) return false
    
    const servicioZona = servicio.zona_atencion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return servicioZona.includes(zonaLimpia)
  })
}

// Filtrar por rango de precios
export const filtrarPorPrecioServicio = (servicios, precioMin = 0, precioMax = Infinity) => {
  return servicios.filter(servicio => {
    if (!servicio.precio || !servicio.precio.valor) return true // Incluir "a consultar"
    
    const precio = parseFloat(servicio.precio.valor) || 0
    return precio >= precioMin && precio <= precioMax
  })
}

// Filtrar por experiencia mínima
export const filtrarPorExperiencia = (servicios, experienciaMin) => {
  return servicios.filter(servicio => {
    if (!servicio.experiencia_años) return true
    return servicio.experiencia_años >= experienciaMin
  })
}

// Filtrar disponibles
export const filtrarDisponibles = (servicios) => {
  return servicios.filter(servicio => servicio.disponible === true)
}

// Filtrar destacados
export const filtrarDestacados = (servicios) => {
  return servicios.filter(servicio => servicio.destacado === true)
}

// Buscar servicios por texto
export const buscarServicios = (servicios, termino) => {
  if (!termino || termino.length < 2) return servicios
  
  const terminoLimpio = termino
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  
  return servicios.filter(servicio => {
    const palabrasClave = servicio.palabrasClave || 
                         generarPalabrasClaveServicio(servicio.titulo, servicio.descripcion, servicio.categoria, servicio.subcategoria, servicio.tags)
    
    return palabrasClave.some(palabra => 
      palabra.includes(terminoLimpio) || terminoLimpio.includes(palabra)
    )
  })
}

// Ordenar servicios
export const ordenarServicios = (servicios, criterio = 'fecha_desc') => {
  const copia = [...servicios]
  
  switch (criterio) {
    case 'fecha_desc':
      return copia.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    case 'fecha_asc':
      return copia.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))
    case 'precio_desc':
      return copia.sort((a, b) => {
        const precioA = a.precio?.valor || 0
        const precioB = b.precio?.valor || 0
        return precioB - precioA
      })
    case 'precio_asc':
      return copia.sort((a, b) => {
        const precioA = a.precio?.valor || 0
        const precioB = b.precio?.valor || 0
        return precioA - precioB
      })
    case 'titulo':
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo))
    case 'experiencia':
      return copia.sort((a, b) => (b.experiencia_años || 0) - (a.experiencia_años || 0))
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

// Obtener nombre legible de categoría
export const obtenerNombreCategoriaServicio = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoriaId)
  
  return categoria ? categoria.nombre : categoriaId
}

// Obtener nombre legible de subcategoría
export const obtenerNombreSubcategoriaServicio = (subcategoriaId) => {
  if (!subcategoriaId) return ''
  
  return subcategoriaId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Obtener categoría completa
export const obtenerCategoriaCompletaServicio = (categoriaId, subcategoriaId = null) => {
  const nombreCategoria = obtenerNombreCategoriaServicio(categoriaId)
  
  if (subcategoriaId) {
    const nombreSubcategoria = obtenerNombreSubcategoriaServicio(subcategoriaId)
    return `${nombreCategoria} > ${nombreSubcategoria}`
  }
  
  return nombreCategoria
}

// Obtener subcategorías de una categoría
export const obtenerSubcategoriasServicio = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_SERVICIOS)
    .find(cat => cat.id === categoriaId)
  
  return categoria ? categoria.subcategorias : {}
}

// Obtener texto descriptivo de modalidad
export const obtenerTextoModalidad = (modalidad) => {
  const textos = {
    presencial: 'Presencial',
    domicilio: 'A domicilio',
    remoto: 'Remoto',
    hibrido: 'Híbrido'
  }
  
  return textos[modalidad] || modalidad
}

// Verificar si el servicio atiende en una zona específica
export const atienceEnZona = (servicio, zona) => {
  if (!servicio.zona_atencion || !zona) return false
  
  const zonaServicio = servicio.zona_atencion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const zonaBuscada = zona.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  return zonaServicio.includes(zonaBuscada) || zonaBuscada.includes(zonaServicio)
}

// Obtener servicios relacionados (misma categoría, diferente servicio)
export const obtenerServiciosRelacionados = (servicios, servicioActual, limite = 5) => {
  return servicios
    .filter(s => 
      s.id !== servicioActual.id && 
      s.categoria === servicioActual.categoria &&
      s.disponible === true
    )
    .slice(0, limite)
}

// Función para aplicar múltiples filtros
export const aplicarFiltrosServicios = (servicios, filtros = {}) => {
  let resultado = [...servicios]
  
  if (filtros.categoria) {
    resultado = filtrarPorCategoriaServicio(resultado, filtros.categoria, filtros.subcategoria)
  }
  
  if (filtros.modalidad) {
    resultado = filtrarPorModalidad(resultado, filtros.modalidad)
  }
  
  if (filtros.zona) {
    resultado = filtrarPorZona(resultado, filtros.zona)
  }
  
  if (filtros.precioMin || filtros.precioMax) {
    resultado = filtrarPorPrecioServicio(resultado, filtros.precioMin, filtros.precioMax)
  }
  
  if (filtros.experienciaMin) {
    resultado = filtrarPorExperiencia(resultado, filtros.experienciaMin)
  }
  
  if (filtros.soloDisponibles) {
    resultado = filtrarDisponibles(resultado)
  }
  
  if (filtros.soloDestacados) {
    resultado = filtrarDestacados(resultado)
  }
  
  if (filtros.busqueda) {
    resultado = buscarServicios(resultado, filtros.busqueda)
  }
  
  // Siempre ordenar al final
  resultado = ordenarServicios(resultado, filtros.orden || 'destacado')
  
  return resultado
}