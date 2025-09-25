// src/lib/helpers/productHelpers.js

import { CATEGORIAS_PRODUCTOS } from '../../types/categories.js'

// Crear producto con validaciones
export const crearProducto = ({
  id,
  tiendaId,
  usuarioId,
  nombre,
  descripcion,
  precio,
  categoria,
  subcategoria = null,
  imagenes = [],
  stock = null,
  peso = null,
  dimensiones = null,
  estado = 'nuevo', // 'nuevo', 'usado', 'reacondicionado'
  disponible = true,
  destacado = false,
  envioGratis = false,
  tags = [],
  fechaCreacion = new Date(),
  fechaActualizacion = new Date()
}) => {
  // Validaciones básicas
  if (!id || !tiendaId || !usuarioId || !nombre || precio == null) {
    throw new Error('ID, tiendaId, usuarioId, nombre y precio son requeridos')
  }

  return {
    id,
    tiendaId,
    usuarioId,
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || '',
    precio: parseFloat(precio),
    categoria,
    subcategoria,
    imagenes: Array.isArray(imagenes) ? imagenes : [],
    stock: stock !== null ? parseInt(stock) : null,
    peso: peso !== null ? parseFloat(peso) : null,
    dimensiones: dimensiones || null,
    estado,
    disponible,
    destacado,
    envioGratis,
    tags: Array.isArray(tags) ? tags : [],
    fechaCreacion,
    fechaActualizacion,
    // Campos adicionales útiles
    slug: generarSlugProducto(nombre, id),
    palabrasClave: generarPalabrasClave(nombre, descripcion, categoria, subcategoria, tags)
  }
}

// Generar slug para URL amigable
export const generarSlugProducto = (nombre, id) => {
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios por guiones
    .substring(0, 50) // Máximo 50 caracteres
  
  return `${slug}-${id.substring(0, 8)}`
}

// Validar categoría y subcategoría
export const validarCategoria = (categoria, subcategoria = null) => {
  const categoriaObj = Object.values(CATEGORIAS_PRODUCTOS)
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

// Generar palabras clave para búsqueda (mejorado)
export const generarPalabrasClave = (nombre, descripcion = '', categoria = '', subcategoria = '', tags = []) => {
  // Obtener nombre legible de la categoría
  const categoriaObj = Object.values(CATEGORIAS_PRODUCTOS)
    .find(cat => cat.id === categoria)
  
  const nombreCategoria = categoriaObj ? categoriaObj.nombre : categoria
  
  // Generar nombre legible de subcategoría
  const nombreSubcategoria = subcategoria ? 
    subcategoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
  
  // Combinar tags si es array
  const tagsTexto = Array.isArray(tags) ? tags.join(' ') : ''
  
  const texto = `${nombre} ${descripcion} ${nombreCategoria} ${nombreSubcategoria} ${tagsTexto}`.toLowerCase()
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras y números
    .split(/\s+/)
    .filter(palabra => palabra.length > 2) // Palabras de más de 2 caracteres
    .filter((palabra, index, array) => array.indexOf(palabra) === index) // Remover duplicados
}

// Validar precio
export const validarPrecio = (precio) => {
  if (precio === null || precio === undefined || precio === '') {
    return { valido: false, error: 'Precio es requerido' }
  }
  
  const precioNum = parseFloat(precio)
  
  if (isNaN(precioNum)) {
    return { valido: false, error: 'Precio debe ser un número válido' }
  }
  
  if (precioNum < 0) {
    return { valido: false, error: 'Precio no puede ser negativo' }
  }
  
  if (precioNum > 999999999) {
    return { valido: false, error: 'Precio demasiado alto' }
  }

  return { valido: true, precio: precioNum }
}

// Validar stock
export const validarStock = (stock) => {
  if (stock === null || stock === undefined) {
    return { valido: true } // Stock es opcional
  }
  
  const stockNum = parseInt(stock)
  
  if (isNaN(stockNum)) {
    return { valido: false, error: 'Stock debe ser un número entero' }
  }
  
  if (stockNum < 0) {
    return { valido: false, error: 'Stock no puede ser negativo' }
  }
  
  if (stockNum > 999999) {
    return { valido: false, error: 'Stock demasiado alto' }
  }

  return { valido: true, stock: stockNum }
}

// Validar estado del producto
export const validarEstado = (estado) => {
  const estadosValidos = ['nuevo', 'usado', 'reacondicionado']
  
  if (!estadosValidos.includes(estado)) {
    return { valido: false, error: 'Estado debe ser: nuevo, usado o reacondicionado' }
  }
  
  return { valido: true }
}

// Validar imágenes
export const validarImagenes = (imagenes) => {
  const errores = []
  
  if (!Array.isArray(imagenes)) {
    errores.push('Imágenes debe ser un arreglo')
    return { valido: false, errores }
  }
  
  if (imagenes.length === 0) {
    errores.push('Debe incluir al menos una imagen')
  }
  
  if (imagenes.length > 10) {
    errores.push('Máximo 10 imágenes por producto')
  }
  
  // Validar URLs de imágenes
  imagenes.forEach((imagen, index) => {
    if (typeof imagen === 'string') {
      if (!imagen.startsWith('http') && !imagen.startsWith('data:')) {
        errores.push(`Imagen ${index + 1}: URL no válida`)
      }
    } else if (typeof imagen === 'object') {
      if (!imagen.secure_url && !imagen.url) {
        errores.push(`Imagen ${index + 1}: URL requerida`)
      }
    }
  })

  return {
    valido: errores.length === 0,
    errores
  }
}

// Validar datos completos del producto (mejorado)
export const validarProducto = (producto) => {
  const errores = []

  // Validaciones básicas
  if (!producto.nombre) errores.push('Nombre es requerido')
  if (producto.nombre && producto.nombre.length < 3) {
    errores.push('Nombre debe tener al menos 3 caracteres')
  }
  if (producto.nombre && producto.nombre.length > 100) {
    errores.push('Nombre no puede exceder 100 caracteres')
  }
  
  if (producto.descripcion && producto.descripcion.length > 2000) {
    errores.push('Descripción no puede exceder 2000 caracteres')
  }
  
  if (!producto.categoria) errores.push('Categoría es requerida')
  
  // Validar categoría y subcategoría
  if (producto.categoria) {
    const validacionCategoria = validarCategoria(producto.categoria, producto.subcategoria)
    if (!validacionCategoria.valido) {
      errores.push(validacionCategoria.error)
    }
  }
  
  // Validar precio
  const validacionPrecio = validarPrecio(producto.precio)
  if (!validacionPrecio.valido) {
    errores.push(validacionPrecio.error)
  }
  
  // Validar stock
  if (producto.stock !== undefined && producto.stock !== null) {
    const validacionStock = validarStock(producto.stock)
    if (!validacionStock.valido) {
      errores.push(validacionStock.error)
    }
  }
  
  // Validar estado
  if (producto.estado) {
    const validacionEstado = validarEstado(producto.estado)
    if (!validacionEstado.valido) {
      errores.push(validacionEstado.error)
    }
  }
  
  // Validar imágenes si están presentes
  if (producto.imagenes && producto.imagenes.length > 0) {
    const validacionImagenes = validarImagenes(producto.imagenes)
    errores.push(...validacionImagenes.errores)
  }

  return {
    valido: errores.length === 0,
    errores
  }
}

// Calcular descuento
export const calcularDescuento = (precioOriginal, precioDescuento) => {
  if (!precioOriginal || !precioDescuento || precioOriginal <= precioDescuento) {
    return 0
  }
  
  return Math.round(((precioOriginal - precioDescuento) / precioOriginal) * 100)
}

// Filtrar productos por categoría
export const filtrarPorCategoria = (productos, categoria, subcategoria = null) => {
  return productos.filter(producto => {
    const coincideCategoria = producto.categoria === categoria
    if (!subcategoria) return coincideCategoria
    
    return coincideCategoria && producto.subcategoria === subcategoria
  })
}

// Filtrar productos por múltiples categorías
export const filtrarPorCategorias = (productos, categorias = [], subcategorias = []) => {
  return productos.filter(producto => {
    const coincideCategoria = categorias.length === 0 || 
                             categorias.includes(producto.categoria)
    
    const coincideSubcategoria = subcategorias.length === 0 || 
                                subcategorias.includes(producto.subcategoria)
    
    return coincideCategoria && coincideSubcategoria
  })
}

// Filtrar por rango de precios
export const filtrarPorPrecio = (productos, precioMin = 0, precioMax = Infinity) => {
  return productos.filter(producto => {
    const precio = parseFloat(producto.precio) || 0
    return precio >= precioMin && precio <= precioMax
  })
}

// Filtrar por estado del producto
export const filtrarPorEstado = (productos, estado) => {
  return productos.filter(producto => producto.estado === estado)
}

// Filtrar por disponibilidad
export const filtrarDisponibles = (productos) => {
  return productos.filter(producto => producto.disponible === true)
}

// Filtrar destacados
export const filtrarDestacados = (productos) => {
  return productos.filter(producto => producto.destacado === true)
}

// Filtrar con envío gratis
export const filtrarEnvioGratis = (productos) => {
  return productos.filter(producto => producto.envioGratis === true)
}

// Buscar productos por texto
export const buscarProductos = (productos, termino) => {
  if (!termino || termino.length < 2) return productos
  
  const terminoLimpio = termino
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  
  return productos.filter(producto => {
    const palabrasClave = producto.palabrasClave || 
                         generarPalabrasClave(producto.nombre, producto.descripcion, producto.categoria, producto.subcategoria, producto.tags)
    
    return palabrasClave.some(palabra => 
      palabra.includes(terminoLimpio) || terminoLimpio.includes(palabra)
    )
  })
}

// Ordenar productos
export const ordenarProductos = (productos, criterio = 'fecha_desc') => {
  const copia = [...productos]
  
  switch (criterio) {
    case 'fecha_desc':
      return copia.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    case 'fecha_asc':
      return copia.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))
    case 'precio_desc':
      return copia.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio))
    case 'precio_asc':
      return copia.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio))
    case 'nombre':
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre))
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
export const obtenerNombreCategoria = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_PRODUCTOS)
    .find(cat => cat.id === categoriaId)
  
  return categoria ? categoria.nombre : categoriaId
}

// Obtener nombre legible de subcategoría
export const obtenerNombreSubcategoria = (subcategoriaId) => {
  if (!subcategoriaId) return ''
  
  return subcategoriaId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Obtener categoría completa (categoría + subcategoría)
export const obtenerCategoriaCompleta = (categoriaId, subcategoriaId = null) => {
  const nombreCategoria = obtenerNombreCategoria(categoriaId)
  
  if (subcategoriaId) {
    const nombreSubcategoria = obtenerNombreSubcategoria(subcategoriaId)
    return `${nombreCategoria} > ${nombreSubcategoria}`
  }
  
  return nombreCategoria
}

// Obtener todas las subcategorías de una categoría
export const obtenerSubcategorias = (categoriaId) => {
  const categoria = Object.values(CATEGORIAS_PRODUCTOS)
    .find(cat => cat.id === categoriaId)
  
  return categoria ? categoria.subcategorias : {}
}

// Verificar si hay stock disponible
export const tieneStock = (producto, cantidadSolicitada = 1) => {
  if (producto.stock === null || producto.stock === undefined) {
    return true // Sin control de stock
  }
  
  return producto.stock >= cantidadSolicitada
}

// Actualizar stock después de una venta
export const actualizarStock = (producto, cantidadVendida) => {
  if (producto.stock === null || producto.stock === undefined) {
    return producto // Sin control de stock
  }
  
  const nuevoStock = Math.max(0, producto.stock - cantidadVendida)
  
  return {
    ...producto,
    stock: nuevoStock,
    disponible: nuevoStock > 0,
    fechaActualizacion: new Date()
  }
}

// Obtener productos relacionados (misma categoría, diferente producto)
export const obtenerProductosRelacionados = (productos, productoActual, limite = 5) => {
  return productos
    .filter(p => 
      p.id !== productoActual.id && 
      p.categoria === productoActual.categoria &&
      p.disponible === true
    )
    .slice(0, limite)
}

// Función para aplicar múltiples filtros
export const aplicarFiltros = (productos, filtros = {}) => {
  let resultado = [...productos]
  
  if (filtros.categoria) {
    resultado = filtrarPorCategoria(resultado, filtros.categoria, filtros.subcategoria)
  }
  
  if (filtros.precioMin || filtros.precioMax) {
    resultado = filtrarPorPrecio(resultado, filtros.precioMin, filtros.precioMax)
  }
  
  if (filtros.estado) {
    resultado = filtrarPorEstado(resultado, filtros.estado)
  }
  
  if (filtros.soloDisponibles) {
    resultado = filtrarDisponibles(resultado)
  }
  
  if (filtros.soloDestacados) {
    resultado = filtrarDestacados(resultado)
  }
  
  if (filtros.envioGratis) {
    resultado = filtrarEnvioGratis(resultado)
  }
  
  if (filtros.busqueda) {
    resultado = buscarProductos(resultado, filtros.busqueda)
  }
  
  // Siempre ordenar al final
  resultado = ordenarProductos(resultado, filtros.orden || 'destacado')
  
  return resultado
}