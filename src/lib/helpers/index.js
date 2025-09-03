// src/lib/helpers/index.js

export * from './employmentHelpers.js'
export * from './productHelpers.js'
export * from './serviceHelpers.js'
export * from './storeHelpers.js'
export * from './userHelpers.js'


// Funciones de utilidad general que podrían estar en cualquier helper
export const formatearPrecio = (precio, moneda = '$') => {
  if (!precio && precio !== 0) return 'Precio a consultar'
  
  return `${moneda} ${parseFloat(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

export const calcularDescuento = (precioOriginal, precioDescuento) => {
  if (!precioOriginal || !precioDescuento || precioOriginal <= precioDescuento) {
    return 0
  }
  
  return Math.round(((precioOriginal - precioDescuento) / precioOriginal) * 100)
}