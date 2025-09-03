// src/lib/helpers/userHelpers.js

// Crear usuario con validaciones
export const crearUsuario = ({
  id,
  nombre,
  email,
  hogar,
  telefono = '',
  redesSociales = {},
  fechaCreacion = new Date(),
  activo = true
}) => {
  // Validaciones básicas
  if (!id || !nombre || !email || !hogar) {
    throw new Error('ID, nombre, email y hogar son requeridos')
  }

  return {
    id,
    nombre: nombre.trim(),
    email: email.toLowerCase().trim(),
    hogar: hogar.trim(),
    telefono: telefono.trim(),
    redesSociales: {
      whatsapp: redesSociales.whatsapp?.trim() || '',
      instagram: redesSociales.instagram?.trim() || '',
      facebook: redesSociales.facebook?.trim() || '',
      ...redesSociales
    },
    fechaCreacion,
    fechaActualizacion: new Date(),
    activo
  }
}

// Validar formato de email
export const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar formato de teléfono argentino
export const validarTelefono = (telefono) => {
  if (!telefono) return true // Opcional
  const telefonoRegex = /^(\+54|54)?[0-9]{10,11}$/
  return telefonoRegex.test(telefono.replace(/\s|-/g, ''))
}

// Formatear nombre completo
export const formatearNombre = (nombre) => {
  return nombre
    .trim()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ')
}

// Obtener iniciales del usuario
export const obtenerIniciales = (nombre) => {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Validar datos completos del usuario
export const validarUsuario = (usuario) => {
  const errores = []

  if (!usuario.nombre) errores.push('Nombre es requerido')
  if (!usuario.email) errores.push('Email es requerido')
  if (!usuario.hogar) errores.push('Hogar es requerido')
  
  if (usuario.email && !validarEmail(usuario.email)) {
    errores.push('Email no tiene formato válido')
  }
  
  if (usuario.telefono && !validarTelefono(usuario.telefono)) {
    errores.push('Teléfono no tiene formato válido')
  }

  return {
    valido: errores.length === 0,
    errores
  }
}