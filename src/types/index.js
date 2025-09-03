// src/types/index.js

// Exportar todas las categorías y tipos desde un lugar centralizado

// Categories (Productos)
export {
  CATEGORIAS_PRODUCTOS
} from './categories'

// Services (Servicios)
export {
  CATEGORIAS_SERVICIOS
} from './services'

// Employment (Sistema de empleo)
export {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  CATEGORIAS_EMPLEO
} from './employment'

// User Types
export {
  ROLES_USUARIO,
  ESTADOS_USUARIO,
  VERIFICACION_HOGAR,
  REDES_SOCIALES,
  PRIVACIDAD_USUARIO,
  TIPOS_NOTIFICACION,
  METODOS_AUTH
} from './user'

// Store Types
export {
  ESTADOS_TIENDA,
  TIPOS_ENTREGA,
  METODOS_PAGO,
  ZONAS_COBERTURA,
  DIAS_SEMANA,
  TIPOS_NEGOCIO,
  CONFIGURACION_TIENDA,
  VERIFICACION_TIENDA
} from './store'

// Product Types
export {
  ESTADOS_PRODUCTO,
  CONDICION_PRODUCTO,
  TIPOS_PRECIO,
  UNIDADES_MEDIDA,
  TIPOS_DESTACADO,
  GESTION_STOCK,
  TIPOS_DESCUENTO,
  ETIQUETAS_PRODUCTO,
  TIPOS_VARIACION,
  ORIGEN_PRODUCTO
} from './product'

// Constantes generales útiles
export const MONEDAS = {
  ARS: 'ARS',
  USD: 'USD'
}

export const ESTADOS_GENERALES = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  PENDIENTE: 'pendiente',
  SUSPENDIDO: 'suspendido'
}

export const TIPOS_IMAGEN = {
  PRODUCTO: 'producto',
  TIENDA: 'tienda',
  USUARIO: 'usuario'
}