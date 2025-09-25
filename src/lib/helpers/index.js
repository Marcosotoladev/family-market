// SERVICE HELPERS - solo funciones que existen
export {
  crearServicio,
  generarPalabrasClaveServicio,
  validarCategoriaServicio,
  validarPrecioServicio,
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