// src/app/admin/servicios/page.js
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, startAfter, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Wrench, Search, Filter, MoreVertical, Edit, Trash2, 
  List, Grid, Calendar, Store, Tag, MapPin, Home, 
  Monitor, Globe, Image
} from 'lucide-react';
import EditServiceModal from '@/components/admin/EditServiceModal';

const ITEMS_PER_PAGE = 20;

export default function AdminServicios() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterModalidad, setFilterModalidad] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadServices();
  }, [filterCategory]);

  const loadServices = async (loadMore = false) => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'servicios'),
        orderBy('fechaCreacion', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (filterCategory !== 'all') {
        q = query(
          collection(db, 'servicios'),
          where('categoria', '==', filterCategory),
          orderBy('fechaCreacion', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }

      if (loadMore && lastDoc) {
        q = query(
          collection(db, 'servicios'),
          orderBy('fechaCreacion', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (loadMore) {
        setServices(prev => [...prev, ...servicesData]);
      } else {
        setServices(servicesData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = (
        service.titulo?.toLowerCase().includes(searchLower) ||
        service.descripcion?.toLowerCase().includes(searchLower) ||
        service.tiendaId?.toLowerCase().includes(searchLower) ||
        service.categoria?.toLowerCase().includes(searchLower)
      );
      if (!matchSearch) return false;
    }

    if (filterModalidad !== 'all' && service.modalidad !== filterModalidad) {
      return false;
    }

    return true;
  });

  const handleDeleteService = async (serviceId) => {
    if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'servicios', serviceId));
      setServices(prev => prev.filter(s => s.id !== serviceId));
      alert('Servicio eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      alert('Error al eliminar servicio');
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleServiceUpdated = (updatedService) => {
    setServices(prev => prev.map(s => 
      s.id === updatedService.id ? { ...s, ...updatedService } : s
    ));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getModalidadIcon = (modalidad) => {
    switch (modalidad) {
      case 'presencial': return MapPin;
      case 'domicilio': return Home;
      case 'virtual': return Monitor;
      case 'hibrido': return Globe;
      default: return MapPin;
    }
  };

  const getModalidadText = (modalidad) => {
    switch (modalidad) {
      case 'presencial': return 'Presencial';
      case 'domicilio': return 'A domicilio';
      case 'virtual': return 'Virtual';
      case 'hibrido': return 'Híbrido';
      default: return modalidad;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Servicios
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Administra todos los servicios publicados en la plataforma
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, descripción o tienda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="belleza_y_bienestar">Belleza y Bienestar</option>
                  <option value="salud_y_medicina">Salud y Medicina</option>
                  <option value="educacion_y_capacitacion">Educación</option>
                  <option value="tecnologia_e_informatica">Tecnología</option>
                  <option value="hogar_y_mantenimiento">Hogar</option>
                  <option value="automotriz">Automotriz</option>
                  <option value="eventos_y_celebraciones">Eventos</option>
                  <option value="deportes_y_fitness">Deportes</option>
                  <option value="mascotas">Mascotas</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modalidad
                </label>
                <select
                  value={filterModalidad}
                  onChange={(e) => setFilterModalidad(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las modalidades</option>
                  <option value="presencial">Presencial</option>
                  <option value="domicilio">A domicilio</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredServices.length} de {services.length} servicios
      </div>

      {/* Loading */}
      {loading && services.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando servicios...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No se encontraron servicios</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(service => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                  getModalidadIcon={getModalidadIcon}
                  getModalidadText={getModalidadText}
                />
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Servicio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Tienda
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Modalidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Publicado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredServices.map(service => (
                      <ServiceRow 
                        key={service.id} 
                        service={service} 
                        onEdit={handleEditService}
                        onDelete={handleDeleteService}
                        formatDate={formatDate}
                        formatPrice={formatPrice}
                        getModalidadIcon={getModalidadIcon}
                        getModalidadText={getModalidadText}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadServices(true)}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Cargando...' : 'Cargar más servicios'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de edición */}
      <EditServiceModal
        service={selectedService}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedService(null);
        }}
        onServiceUpdated={handleServiceUpdated}
      />
    </div>
  );
}

function ServiceCard({ service, onEdit, onDelete, formatDate, formatPrice, getModalidadIcon, getModalidadText }) {
  const [showMenu, setShowMenu] = useState(false);
  const ModalidadIcon = getModalidadIcon(service.modalidad);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {service.imagenes && service.imagenes.length > 0 ? (
          <img 
            src={service.imagenes[0]} 
            alt={service.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(service);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar servicio
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(service.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar servicio
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {service.titulo}
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(service.precio)}
            </span>
            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              <ModalidadIcon className="w-3 h-3" />
              {getModalidadText(service.modalidad)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Store className="w-4 h-4" />
            <span className="truncate">{service.tiendaId || 'Sin tienda'}</span>
          </div>

          {service.categoria && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Tag className="w-4 h-4" />
              <span className="truncate capitalize">{service.categoria.replace(/_/g, ' ')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(service.fechaCreacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ service, onEdit, onDelete, formatDate, formatPrice, getModalidadIcon, getModalidadText }) {
  const ModalidadIcon = getModalidadIcon(service.modalidad);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            {service.imagenes && service.imagenes.length > 0 ? (
              <img 
                src={service.imagenes[0]} 
                alt={service.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
              {service.titulo}
            </p>
            {service.descripcion && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {service.descripcion}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {service.tiendaId || 'Sin tienda'}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
          <ModalidadIcon className="w-3 h-3" />
          {getModalidadText(service.modalidad)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full capitalize">
          {service.categoria?.replace(/_/g, ' ') || 'Sin categoría'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
        {formatPrice(service.precio)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(service.fechaCreacion)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              onEdit(service);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
}