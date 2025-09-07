// src/lib/helpers/index.js

// EMPLOYMENT HELPERS - funciones que realmente existen
export {
  aplicarFiltros as aplicarFiltrosEmpleos,
  buscarEmpleos,
  crearPublicacionEmpleo,
  filtrarPorCategoria as filtrarEmpleosPorCategoria,
  filtrarPorExperiencia as filtrarEmpleosPorExperiencia,
  filtrarPorModalidad as filtrarEmpleosPorModalidad,
  filtrarPorSalario,
  filtrarPorTipo,
  filtrarPorTipoEmpleo,
  filtrarPorUbicacion,
  formatearSalario,
  generarPalabrasClaveEmpleo,
  generarSlugEmpleo,
  obtenerTextoCategoria as obtenerTextoCategoriaEmpleo,
  obtenerTextoExperiencia,
  obtenerTextoModalidad as obtenerTextoModalidadEmpleo,
  obtenerTextoTipo,
  obtenerTextoTipoEmpleo,
  ordenarPublicaciones as ordenarPublicacionesEmpleo,
  validarPublicacionEmpleo,
  validarSalario
} from './employmentHelpers.js';

// PRODUCT HELPERS - funciones que realmente existen
export {
  crearProducto,
  generarSlugProducto,
  validarCategoria as validarCategoriaProducto,
  generarPalabrasClave as generarPalabrasClaveProducto,
  formatearPrecio as formatearPrecioProducto,
  validarPrecio as validarPrecioProducto,
  validarStock,
  validarEstado as validarEstadoProducto,
  validarImagenes as validarImagenesProducto,
  validarProducto,
  calcularDescuento,
  filtrarPorCategoria as filtrarProductosPorCategoria,
  filtrarPorCategorias as filtrarProductosPorCategorias,
  filtrarPorPrecio as filtrarProductosPorPrecio,
  filtrarPorEstado as filtrarProductosPorEstado,
  filtrarDisponibles as filtrarProductosDisponibles,
  filtrarDestacados as filtrarProductosDestacados,
  filtrarEnvioGratis as filtrarProductosEnvioGratis,
  buscarProductos,
  ordenarProductos,
  obtenerNombreCategoria as obtenerNombreCategoriaProducto,
  obtenerNombreSubcategoria as obtenerNombreSubcategoriaProducto,
  obtenerCategoriaCompleta as obtenerCategoriaCompletaProducto,
  obtenerSubcategorias as obtenerSubcategoriasProducto,
  tieneStock,
  actualizarStock,
  obtenerProductosRelacionados,
  aplicarFiltros as aplicarFiltrosProductos
} from './productHelpers.js';

// SERVICE HELPERS - funciones que realmente existen
export {
  crearServicio,
  generarSlugServicio,
  generarPalabrasClaveServicio,
  validarCategoriaServicio,
  validarPrecioServicio,
  validarModalidad as validarModalidadServicio,
  validarHorarios as validarHorariosServicio,
  validarServicio,
  formatearPrecioServicio,
  filtrarPorCategoriaServicio,
  filtrarPorModalidad as filtrarServiciosPorModalidad,
  filtrarPorZona as filtrarServiciosPorZona,
  filtrarPorPrecioServicio,
  filtrarPorExperiencia as filtrarServiciosPorExperiencia,
  filtrarDisponibles as filtrarServiciosDisponibles,
  filtrarDestacados as filtrarServiciosDestacados,
  buscarServicios,
  ordenarServicios,
  obtenerNombreCategoriaServicio,
  obtenerNombreSubcategoriaServicio,
  obtenerCategoriaCompletaServicio,
  obtenerSubcategoriasServicio,
  obtenerTextoModalidad as obtenerTextoModalidadServicio,
  atienceEnZona,
  obtenerServiciosRelacionados,
  aplicarFiltrosServicios
} from './serviceHelpers.js';

// STORE Y USER HELPERS - estos probablemente no tienen conflictos
export * from './storeHelpers.js';
export * from './userHelpers.js';

// Funciones de utilidad general (evitando duplicar formatearPrecio)
export const formatearPrecio = (precio, moneda = '$') => {
  if (!precio && precio !== 0) return 'Precio a consultar'
  
  return `${moneda} ${parseFloat(precio).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}