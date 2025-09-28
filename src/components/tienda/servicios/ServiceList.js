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
  onFeature,
  isLoading = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModalidad, setSelectedModalidad] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // CAMBIADO: Vista por defecto es tabla (lista)

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

  const categories = Object.keys(CATEGORIAS_SERVICIOS);
  const modalidades = Object.keys(MODALIDAD_SERVICIO);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
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
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Destacados</p>
              <p className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {services.filter(s => {
                  if (!s.featured || !s.featuredUntil) return false;
                  const now = new Date();
                  const featuredUntil = s.featuredUntil.toDate ? 
                    s.featuredUntil.toDate() : 
                    new Date(s.featuredUntil);
                  return now < featuredUntil;
                }).length}
              </p>
            </div>
            <Star className="w-5 h-5 md:w-8 md:h-8 text-blue-500 fill-current" />
          </div>
        </div>
      </div>

      {/* Controles MEJORADOS */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* NUEVO: Botón + prominente en móvil */}
        <div className="flex justify-between items-start mb-4 sm:hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Servicios</h3>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </button>
        </div>

        {/* Controles principales */}
        <div className="space-y-4">
          {/* Primera fila: Búsqueda */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Segunda fila: Filtros en grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{formatearCategoria(cat)}</option>
              ))}
            </select>

            <select
              value={selectedModalidad}
              onChange={(e) => setSelectedModalidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Todas las modalidades</option>
              {modalidades.map(mod => (
                <option key={mod} value={mod}>{formatearModalidad(mod)}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Todos los estados</option>
              <option value={ESTADOS_SERVICIO.DISPONIBLE}>Disponible</option>
              <option value={ESTADOS_SERVICIO.AGOTADO}>Sin cupos</option>
              <option value={ESTADOS_SERVICIO.PAUSADO}>Pausado</option>
              <option value={ESTADOS_SERVICIO.INACTIVO}>Inactivo</option>
            </select>

            {/* Ordenar combinado en un solo select para móvil */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="fechaCreacion_desc">Más recientes</option>
              <option value="fechaCreacion_asc">Más antiguos</option>
              <option value="titulo_asc">A-Z (Nombre)</option>
              <option value="titulo_desc">Z-A (Nombre)</option>
              <option value="precio_asc">Precio menor</option>
              <option value="precio_desc">Precio mayor</option>
              <option value="reservas_desc">Más reservas</option>
              <option value="reservas_asc">Menos reservas</option>
            </select>
          </div>

          {/* Tercera fila: Vista y botón para desktop */}
          <div className="flex justify-between items-center">
            {/* Toggle de vista */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors flex items-center`}
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                } transition-colors flex items-center`}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Tarjetas
              </button>
            </div>

            {/* Botón + para desktop */}
            <div className="hidden sm:block">
              <button
                onClick={onCreateNew}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </button>
            </div>
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
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear primer servicio
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Vista en tarjetas
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onToggleStatus={onToggleStatus} 
              onDuplicate={onDuplicate} 
              onView={onView}
              onFeature={onFeature}
            />
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
                  <ServiceTableRow 
                    key={service.id} 
                    service={service} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onToggleStatus={onToggleStatus} 
                    onDuplicate={onDuplicate} 
                    onView={onView}
                    onFeature={onFeature}
                  />
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
function ServiceCard({ service, onEdit, onDelete, onToggleStatus, onDuplicate, onView, onFeature }) {
  const estadoBadge = obtenerEstadoBadgeServicio(service.estado);
  const categoryName = formatearCategoria(service.categoria);

  const isFeatureActive = () => {
    if (!service.featured) return false;
    if (!service.featuredUntil) return false;
    
    const now = new Date();
    const featuredUntil = service.featuredUntil.toDate ? 
      service.featuredUntil.toDate() : 
      new Date(service.featuredUntil);
    
    return now < featuredUntil;
  };

  const getRemainingDays = () => {
    if (!isFeatureActive()) return 0;
    
    const now = new Date();
    const featuredUntil = service.featuredUntil.toDate ? 
      service.featuredUntil.toDate() : 
      new Date(service.featuredUntil);
    
    const diffTime = featuredUntil - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

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

        {/* Badge de destacado */}
        {isFeatureActive() && (
          <div className="absolute top-12 right-2">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <Star className="w-3 h-3 fill-current" />
              <span>DESTACADO</span>
            </div>
          </div>
        )}
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
          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
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

        {/* Información de destacado */}
        {isFeatureActive() && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">Destacado por {getRemainingDays()} días más</span>
            </div>
          </div>
        )}

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
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
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
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onDuplicate(service)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Duplicar</span>
            </button>

            <button
              onClick={() => onFeature && onFeature(service)}
              className={`px-3 py-2 text-sm rounded transition-colors flex items-center justify-center gap-1 ${
                isFeatureActive()
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'
                  : 'border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              title={isFeatureActive() ? 'Ya destacado' : 'Destacar servicio'}
            >
              <Star className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">
                {isFeatureActive() ? 'Destacado' : 'Destacar'}
              </span>
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
function ServiceTableRow({ service, onEdit, onDelete, onToggleStatus, onDuplicate, onView, onFeature }) {
  const estadoBadge = obtenerEstadoBadgeServicio(service.estado);
  const categoryName = formatearCategoria(service.categoria);

  const isFeatureActive = () => {
    if (!service.featured) return false;
    if (!service.featuredUntil) return false;
    
    const now = new Date();
    const featuredUntil = service.featuredUntil.toDate ? 
      service.featuredUntil.toDate() : 
      new Date(service.featuredUntil);
    
    return now < featuredUntil;
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 relative">
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
            {isFeatureActive() && (
              <div className="absolute -top-1 -right-1">
                <Star className="w-4 h-4 text-blue-500 fill-current" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              {service.titulo}
              {isFeatureActive() && (
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs rounded-full">
                  DESTACADO
                </span>
              )}
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
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
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
            onClick={() => onFeature && onFeature(service)}
            className={`${
              isFeatureActive()
                ? 'text-blue-500'
                : 'text-blue-600 dark:text-blue-400'
            } hover:text-blue-700 dark:hover:text-blue-300`}
            title={isFeatureActive() ? 'Ya destacado' : 'Destacar servicio'}
          >
            <Star className={`w-4 h-4 ${isFeatureActive() ? 'fill-current' : ''}`} />
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