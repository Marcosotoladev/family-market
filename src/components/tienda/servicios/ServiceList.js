// src/components/tienda/servicios/ServiceList.js
'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Star,
  Copy,
  Play,
  Pause,
  Grid3X3,
  List,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { 
  ESTADOS_SERVICIO, 
  TIPOS_PRECIO_SERVICIO, 
  MODALIDAD_SERVICIO,
  CATEGORIAS_SERVICIOS,
  formatearPrecioServicio, 
  obtenerEstadoBadgeServicio,
  formatearModalidad,
  formatearCategoria,
  formatearDuracion
} from '../../../types/services';

export default function ServiceList({ 
  services = [], 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onDuplicate,
  onView,
  onCreateNew,
  isLoading = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModalidad, setSelectedModalidad] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filtrar y ordenar servicios
  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || service.categoria === selectedCategory;
      const matchesModalidad = !selectedModalidad || service.modalidad === selectedModalidad;
      const matchesStatus = !selectedStatus || service.estado === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesModalidad && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'titulo':
          aValue = (a.titulo || '').toLowerCase();
          bValue = (b.titulo || '').toLowerCase();
          break;
        case 'precio':
          aValue = a.precio || 0;
          bValue = b.precio || 0;
          break;
        case 'modalidad':
          aValue = a.modalidad || '';
          bValue = b.modalidad || '';
          break;
        case 'reservas':
          aValue = a.totalReservas || 0;
          bValue = b.totalReservas || 0;
          break;
        default:
          aValue = new Date(a.fechaCreacion || 0);
          bValue = new Date(b.fechaCreacion || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getCuposStatus = (service) => {
    if (service.gestionCupos === 'ilimitado') return null;
    if (service.gestionCupos === 'unico') return service.estado === 'disponible' ? 'disponible' : 'agotado';
    if (service.cuposDisponibles === 0) return 'agotado';
    if (service.cuposDisponibles <= 5) return 'bajo';
    return 'normal';
  };

  const categories = Object.values(CATEGORIAS_SERVICIOS);
  const modalidades = Object.values(MODALIDAD_SERVICIO);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{services.length}</p>
            </div>
            <Briefcase className="w-5 h-5 md:w-8 md:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Disponibles</p>
              <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                {services.filter(s => s.estado === ESTADOS_SERVICIO.DISPONIBLE).length}
              </p>
            </div>
            <Star className="w-5 h-5 md:w-8 md:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Cupos Bajos</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {services.filter(s => getCuposStatus(s) === 'bajo').length}
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 md:w-8 md:h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Sin Cupos</p>
              <p className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400">
                {services.filter(s => s.estado === ESTADOS_SERVICIO.AGOTADO || getCuposStatus(s) === 'agotado').length}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filtros */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{formatearCategoria(cat)}</option>
              ))}
            </select>

            <select
              value={selectedModalidad}
              onChange={(e) => setSelectedModalidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas las modalidades</option>
              {modalidades.map(mod => (
                <option key={mod} value={mod}>{formatearModalidad(mod)}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value={ESTADOS_SERVICIO.DISPONIBLE}>Disponible</option>
              <option value={ESTADOS_SERVICIO.AGOTADO}>Sin cupos</option>
              <option value={ESTADOS_SERVICIO.PAUSADO}>Pausado</option>
              <option value={ESTADOS_SERVICIO.INACTIVO}>Inactivo</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Ordenar */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="fechaCreacion">Fecha</option>
                <option value="titulo">Nombre</option>
                <option value="precio">Precio</option>
                <option value="modalidad">Modalidad</option>
                <option value="reservas">Reservas</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Vista */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Nuevo servicio */}
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista/Grid de servicios */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory || selectedModalidad || selectedStatus 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza agregando tu primer servicio'
            }
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear primer servicio
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Vista en tarjetas
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} onDuplicate={onDuplicate} onView={onView} />
          ))}
        </div>
      ) : (
        // Vista de tabla
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reservas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.map((service) => (
                  <ServiceTableRow key={service.id} service={service} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} onDuplicate={onDuplicate} onView={onView} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para tarjeta de servicio en vista grid
function ServiceCard({ service, onEdit, onDelete, onToggleStatus, onDuplicate, onView }) {
  const estadoBadge = obtenerEstadoBadgeServicio(service.estado);
  const categoryName = formatearCategoria(service.categoria);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {service.imagenes && service.imagenes.length > 0 ? (
          <img
            src={service.imagenes[0]}
            alt={service.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Badge de estado */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            estadoBadge.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            estadoBadge.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            estadoBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {estadoBadge.texto}
          </span>
        </div>

        {/* Badge de modalidad */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
            {formatearModalidad(service.modalidad)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {service.titulo}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {categoryName}
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {service.descripcion}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
            {formatearPrecioServicio(service.precio, service.tipoPrecio)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {service.totalReservas || 0} reservas
          </span>
        </div>

        {/* Información adicional */}
        <div className="flex flex-wrap gap-1 mb-4">
          {service.duracion && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {formatearDuracion(service.duracion, service.duracionPersonalizada)}
            </span>
          )}
          {service.gestionCupos === 'limitado' && service.cuposDisponibles !== null && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
              <Users className="w-3 h-3 mr-1" />
              {service.cuposDisponibles} cupos
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          {/* Primera fila de botones */}
          <div className="flex gap-2">
            <button
              onClick={() => onView(service)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(service)}
              className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center justify-center"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleStatus(service)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title={service.estado === ESTADOS_SERVICIO.DISPONIBLE ? 'Pausar' : 'Activar'}
            >
              {service.estado === ESTADOS_SERVICIO.DISPONIBLE ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Segunda fila de botones */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDuplicate(service)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Duplicar</span>
            </button>
            <button
              onClick={() => onDelete(service.id)}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para fila de tabla
function ServiceTableRow({ service, onEdit, onDelete, onToggleStatus, onDuplicate, onView }) {
  const estadoBadge = obtenerEstadoBadgeServicio(service.estado);
  const categoryName = formatearCategoria(service.categoria);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            {service.imagenes && service.imagenes.length > 0 ? (
              <img
                src={service.imagenes[0]}
                alt={service.titulo}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {service.titulo}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {categoryName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm text-gray-900 dark:text-white">
            {formatearModalidad(service.modalidad)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatearPrecioServicio(service.precio, service.tipoPrecio)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          estadoBadge.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          estadoBadge.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          estadoBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {estadoBadge.texto}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {service.totalReservas || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(service)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Ver"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(service)}
            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(service)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={service.estado === ESTADOS_SERVICIO.DISPONIBLE ? 'Pausar' : 'Activar'}
          >
            {service.estado === ESTADOS_SERVICIO.DISPONIBLE ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDuplicate(service)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}