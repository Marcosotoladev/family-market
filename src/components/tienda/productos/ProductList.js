// src/components/tienda/productos/ProductList.js
'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Package,
  TrendingUp,
  AlertTriangle,
  Star,
  Copy,
  Play,
  Pause,
  Grid3X3,
  List
} from 'lucide-react';
import { 
  ESTADOS_PRODUCTO, 
  TIPOS_PRECIO, 
  formatearPrecio, 
  obtenerEstadoBadge 
} from '@/types/product';
import { CATEGORIAS_PRODUCTOS } from '@/types/categories';

export default function ProductList({ 
  products = [], 
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
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
      const matchesStatus = !selectedStatus || product.estado === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'titulo':
          aValue = (a.titulo || a.nombre || '').toLowerCase();
          bValue = (b.titulo || b.nombre || '').toLowerCase();
          break;
        case 'precio':
          aValue = a.precio || 0;
          bValue = b.precio || 0;
          break;
        case 'stock':
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        case 'ventas':
          aValue = a.totalVentas || 0;
          bValue = b.totalVentas || 0;
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

  const getStockStatus = (product) => {
    if (product.gestionStock === 'ilimitado') return null;
    if (product.stock === 0) return 'agotado';
    if (product.stock <= product.stockMinimo) return 'bajo';
    return 'normal';
  };

  const categories = Object.values(CATEGORIAS_PRODUCTOS);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {products.filter(p => p.estado === ESTADOS_PRODUCTO.DISPONIBLE).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {products.filter(p => getStockStatus(p) === 'bajo').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agotados</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {products.filter(p => p.estado === ESTADOS_PRODUCTO.AGOTADO || getStockStatus(p) === 'agotado').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
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
                placeholder="Buscar productos..."
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
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value={ESTADOS_PRODUCTO.DISPONIBLE}>Disponible</option>
              <option value={ESTADOS_PRODUCTO.AGOTADO}>Agotado</option>
              <option value={ESTADOS_PRODUCTO.PAUSADO}>Pausado</option>
              <option value={ESTADOS_PRODUCTO.INACTIVO}>Inactivo</option>
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
                <option value="ventas">Ventas</option>
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

            {/* Nuevo producto */}
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Lista/Grid de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory || selectedStatus 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza agregando tu primer producto'
            }
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear primer producto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Vista en tarjetas
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} onDuplicate={onDuplicate} onView={onView} />
          ))}
        </div>
      ) : (
        // Vista de tabla simplificada
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <ProductTableRow key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} onDuplicate={onDuplicate} onView={onView} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para tarjeta de producto en vista grid
function ProductCard({ product, onEdit, onDelete, onToggleStatus, onDuplicate, onView }) {
  const estadoBadge = obtenerEstadoBadge(product.estado);
  const categoryName = CATEGORIAS_PRODUCTOS[product.categoria]?.nombre || 'Sin categoría';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {product.imagenes && product.imagenes.length > 0 ? (
          <img
            src={product.imagenes[0]}
            alt={product.titulo || product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
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
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {product.titulo || product.nombre}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {categoryName}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-orange-600 dark:text-orange-400">
            {product.tipoPrecio === TIPOS_PRECIO.FIJO ? 
              formatearPrecio(product.precio) : 
              product.tipoPrecio?.replace('_', ' ') || 'Precio a consultar'
            }
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {product.totalVentas || 0} ventas
          </span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(product)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Ver"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center justify-center"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(product)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            title={product.estado === ESTADOS_PRODUCTO.DISPONIBLE ? 'Pausar' : 'Activar'}
          >
            {product.estado === ESTADOS_PRODUCTO.DISPONIBLE ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onDuplicate(product)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Duplicar"
          >
            <Copy className="w-4 h-4 mr-1" />
            Duplicar
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para fila de tabla
function ProductTableRow({ product, onEdit, onDelete, onToggleStatus, onDuplicate, onView }) {
  const estadoBadge = obtenerEstadoBadge(product.estado);
  const categoryName = CATEGORIAS_PRODUCTOS[product.categoria]?.nombre || 'Sin categoría';

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            {product.imagenes && product.imagenes.length > 0 ? (
              <img
                src={product.imagenes[0]}
                alt={product.titulo || product.nombre}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {product.titulo || product.nombre}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {categoryName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {product.tipoPrecio === TIPOS_PRECIO.FIJO ? 
            formatearPrecio(product.precio) : 
            product.tipoPrecio?.replace('_', ' ') || 'Precio a consultar'
          }
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
        {product.totalVentas || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(product)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Ver"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(product)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={product.estado === ESTADOS_PRODUCTO.DISPONIBLE ? 'Pausar' : 'Activar'}
          >
            {product.estado === ESTADOS_PRODUCTO.DISPONIBLE ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDuplicate(product)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
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