// src/app/admin/empleos/page.js
'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, startAfter, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Briefcase, Search, Filter, MoreVertical, Edit, Trash2, 
  List, Grid, Calendar, Store, Tag, MapPin, DollarSign,
  Clock, Users, Eye, Building2, UserSearch
} from 'lucide-react';
import EditOfertaModal from '@/components/admin/EditOfertaModal';
import EditBusquedaModal from '@/components/admin/EditBusquedaModal';

const ITEMS_PER_PAGE = 20;

export default function AdminEmpleos() {
  const [empleos, setEmpleos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all'); // 'all', 'ofertas', 'busquedas'
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null); // 'oferta' o 'busqueda'

  useEffect(() => {
    loadEmpleos();
  }, [filterTipo, filterCategory]);

  const loadEmpleos = async (loadMore = false) => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'empleos'),
        orderBy('fechaCreacion', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      // Aplicar filtro de categoría si es necesario
      if (filterCategory !== 'all') {
        q = query(
          collection(db, 'empleos'),
          where('categoria', '==', filterCategory),
          orderBy('fechaCreacion', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      let empleosData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Determinar el tipo basado en tipoPublicacion
        let tipo = 'oferta'; // Por defecto
        if (data.tipoPublicacion === 'busqueda_empleo') {
          tipo = 'busqueda';
        } else if (data.tipoPublicacion === 'oferta_empleo') {
          tipo = 'oferta';
        }
        
        return {
          ...data,
          id: doc.id,
          tipo: tipo
        };
      });

      // Filtrar por tipo si es necesario
      if (filterTipo === 'ofertas') {
        empleosData = empleosData.filter(e => e.tipo === 'oferta');
      } else if (filterTipo === 'busquedas') {
        empleosData = empleosData.filter(e => e.tipo === 'busqueda');
      }

      setEmpleos(empleosData);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error cargando empleos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpleos = empleos.filter(empleo => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      empleo.titulo?.toLowerCase().includes(searchLower) ||
      empleo.nombre?.toLowerCase().includes(searchLower) ||
      empleo.descripcion?.toLowerCase().includes(searchLower) ||
      empleo.categoria?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (item) => {
    const tipoTexto = item.tipo === 'oferta' ? 'oferta de empleo' : 'búsqueda de empleo';
    
    if (!confirm(`¿Estás seguro de eliminar esta ${tipoTexto}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Todos los documentos están en la colección 'empleos'
      await deleteDoc(doc(db, 'empleos', item.id));
      setEmpleos(prev => prev.filter(e => e.id !== item.id));
      alert(`${tipoTexto.charAt(0).toUpperCase() + tipoTexto.slice(1)} eliminada correctamente`);
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error al eliminar');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditType(item.tipo);
    setShowEditModal(true);
  };

  const handleItemUpdated = (updatedItem) => {
    setEmpleos(prev => prev.map(e => 
      e.id === updatedItem.id ? { ...e, ...updatedItem } : e
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

  const formatSalary = (salario) => {
    if (!salario) return 'No especificado';
    if (salario.tipo === 'A_CONVENIR') return 'A convenir';
    
    const min = salario.minimo ? `$${salario.minimo.toLocaleString('es-AR')}` : '';
    const max = salario.maximo ? `$${salario.maximo.toLocaleString('es-AR')}` : '';
    
    if (min && max) return `${min} - ${max}`;
    if (min) return `Desde ${min}`;
    if (max) return `Hasta ${max}`;
    return 'No especificado';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Empleos
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Administra ofertas de empleo y búsquedas de trabajo publicadas en la plataforma
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400'
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
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
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
                  Tipo
                </label>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="ofertas">Ofertas de empleo</option>
                  <option value="busquedas">Búsquedas de empleo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="ventas_comercio">Ventas y Comercio</option>
                  <option value="gastronomia_turismo">Gastronomía y Turismo</option>
                  <option value="administracion_finanzas">Administración</option>
                  <option value="tecnologia_sistemas">Tecnología</option>
                  <option value="salud_cuidado">Salud</option>
                  <option value="construccion_mantenimiento">Construcción</option>
                  <option value="educacion_capacitacion">Educación</option>
                  <option value="transporte_logistica">Transporte</option>
                  <option value="limpieza_servicios">Limpieza</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredEmpleos.length} resultados
      </div>

      {/* Loading */}
      {loading && empleos.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando empleos...</p>
        </div>
      ) : filteredEmpleos.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No se encontraron empleos</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmpleos.map(empleo => (
                <EmpleoCard 
                  key={`${empleo.tipo}-${empleo.id}`}
                  empleo={empleo} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  formatSalary={formatSalary}
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
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Título
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Salario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Ubicación
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
                    {filteredEmpleos.map(empleo => (
                      <EmpleoRow 
                        key={`${empleo.tipo}-${empleo.id}`}
                        empleo={empleo} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        formatSalary={formatSalary}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales de edición */}
      {editType === 'oferta' && (
        <EditOfertaModal
          oferta={selectedItem}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
            setEditType(null);
          }}
          onOfertaUpdated={handleItemUpdated}
        />
      )}

      {editType === 'busqueda' && (
        <EditBusquedaModal
          busqueda={selectedItem}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
            setEditType(null);
          }}
          onBusquedaUpdated={handleItemUpdated}
        />
      )}
    </div>
  );
}

function EmpleoCard({ empleo, onEdit, onDelete, formatDate, formatSalary }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOferta = empleo.tipo === 'oferta';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Tipo badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isOferta 
              ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
              : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
          }`}>
            {isOferta ? <Building2 className="w-3 h-3" /> : <UserSearch className="w-3 h-3" />}
            {isOferta ? 'Oferta' : 'Búsqueda'}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                      onEdit(empleo);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(empleo);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {empleo.titulo || empleo.nombre}
        </h3>
        
        <div className="space-y-2 text-sm">
          {empleo.categoria && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Tag className="w-4 h-4" />
              <span className="truncate capitalize">{empleo.categoria.replace(/_/g, ' ')}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4" />
            <span className="truncate">
              {formatSalary(isOferta ? empleo.salario : empleo.pretensionSalarial)}
            </span>
          </div>

          {empleo.ubicacion?.ciudad && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{empleo.ubicacion.ciudad}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(empleo.fechaCreacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpleoRow({ empleo, onEdit, onDelete, formatDate, formatSalary }) {
  const isOferta = empleo.tipo === 'oferta';

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isOferta 
            ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
            : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
        }`}>
          {isOferta ? <Building2 className="w-3 h-3" /> : <UserSearch className="w-3 h-3" />}
          {isOferta ? 'Oferta' : 'Búsqueda'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {empleo.titulo || empleo.nombre}
          </p>
          {empleo.descripcion && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {empleo.descripcion}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full capitalize">
          {empleo.categoria?.replace(/_/g, ' ') || 'Sin categoría'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatSalary(isOferta ? empleo.salario : empleo.pretensionSalarial)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {empleo.ubicacion?.ciudad || 'N/A'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(empleo.fechaCreacion)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(empleo)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(empleo)}
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