// src/lib/helpers/storeHelpers.js

// Crear tienda con validaciones
export const crearTienda = ({
  id,
  usuarioId,
  nombre,
  descripcion,
  logo = '',
  productos = [],
  contacto = {},
  entrega = {},
  fechaCreacion = new Date(),
  activa = true
}) => {
  // Validaciones básicas
  if (!id || !usuarioId || !nombre) {
    throw new Error('ID, usuarioId y nombre son requeridos')
  }

  return {
    id,
    usuarioId,
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || '',
    logo,
    productos,
    contacto: {
      whatsapp: contacto.whatsapp?.trim() || '',
      instagram: contacto.instagram?.trim() || '',
      facebook: contacto.facebook?.trim() || '',
      email: contacto.email?.toLowerCase().trim() || '',
      ...contacto
    },
    entrega: {
      domicilio: entrega.domicilio || false,
      retiro: entrega.retiro || false,
      ubicacion: entrega.ubicacion?.trim() || '',
      ...entrega
    },
    fechaCreacion,
    fechaActualizacion: new Date(),
    activa
  }
}

// Generar slug único para la tienda
export const generarSlugTienda = (nombre, id) => {
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios por guiones
    .substring(0, 50) // Máximo 50 caracteres
  
  return `${slug}-${id.substring(0, 8)}`
}

// Validar configuración de entrega
export const validarEntrega = (entrega) => {
  const errores = []
  
  if (!entrega.domicilio && !entrega.retiro) {
    errores.push('Debe seleccionar al menos una opción de entrega')
  }
  
  if (entrega.retiro && !entrega.ubicacion) {
    errores.push('Ubicación es requerida para retiro')
  }

  return {
    valido: errores.length === 0,
    errores
  }
}

// Validar información de contacto
export const validarContactoTienda = (contacto) => {
  const errores = []
  
  // Al menos un método de contacto
  const tieneContacto = contacto.whatsapp || 
                       contacto.instagram || 
                       contacto.facebook || 
                       contacto.email
  
  if (!tieneContacto) {
    errores.push('Debe proporcionar al menos un método de contacto')
  }
  
  // Validar email si está presente
  if (contacto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.email)) {
    errores.push('Email no tiene formato válido')
  }

  return {
    valido: errores.length === 0,
    errores
  }
}

// Validar datos completos de la tienda
export const validarTienda = (tienda) => {
  const errores = []

  if (!tienda.nombre) errores.push('Nombre es requerido')
  if (tienda.nombre && tienda.nombre.length < 3) {
    errores.push('Nombre debe tener al menos 3 caracteres')
  }
  
  // Validar contacto
  const validacionContacto = validarContactoTienda(tienda.contacto || {})
  errores.push(...validacionContacto.errores)
  
  // Validar entrega
  const validacionEntrega = validarEntrega(tienda.entrega || {})
  errores.push(...validacionEntrega.errores)

  return {
    valido: errores.length === 0,
    errores
  }
}

// Formatear URL de redes sociales
export const formatearUrlRed = (url, red) => {
  if (!url) return ''
  
  url = url.trim()
  
  switch (red) {
    case 'instagram':
      if (!url.startsWith('@') && !url.includes('instagram.com')) {
        return `@${url}`
      }
      return url
    
    case 'facebook':
      if (!url.includes('facebook.com') && !url.startsWith('@')) {
        return `https://facebook.com/${url}`
      }
      return url
    
    case 'whatsapp':
      // Limpiar formato de teléfono
      return url.replace(/\D/g, '')
    
    default:
      return url
  }
}