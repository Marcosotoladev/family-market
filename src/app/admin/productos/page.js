// src/app/admin/productos/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Grid, 
  List,
  MoreVertical,
  Edit,
  Trash2,
  Store,
  DollarSign,
  Tag,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, startAfter, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import EditProductModal from '@/components/admin/EditProductModal';

export default function AdminProductos() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const ITEMS_PER_PAGE = 12;

  // Cargar productos
  const loadProducts = async (loadMore = false) => {
    try {
      setLoading(true);
      
      let q = query(
        collection(db, 'productos'),
        orderBy('fechaCreacion', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      // Filtrar por categoría si no es 'all'
      if (filterCategory !== 'all') {
        q = query(
          collection(db, 'productos'),
          where('categoria', '==', filterCategory),
          orderBy('fechaCreacion', 'desc'),
          limit(ITEMS_PER_PAGE)
        );
      }

      // Paginación
      if (loadMore && lastDoc) {
        q = query(
          collection(db, 'productos'),
          orderBy('fechaCreacion', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (loadMore) {
        setProducts(prev => [...prev, ...productsData]);
      } else {
        setProducts(productsData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filterCategory]);

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true; // Si no hay término de búsqueda, mostrar todos
    
    const searchLower = searchTerm.toLowerCase();
    return (
      product.nombre?.toLowerCase().includes(searchLower) ||
      product.descripcion?.toLowerCase().includes(searchLower) ||
      product.tiendaId?.toLowerCase().includes(searchLower) ||
      product.categoria?.toLowerCase().includes(searchLower)
    );
  });

  // Eliminar producto
  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'productos', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar producto');
    }
  };

  // Abrir modal de edición
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Actualizar producto en la lista después de editar
  const handleProductUpdated = (updatedProduct) => {
    setProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
    ));
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Formatear precio
  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Productos
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Administra todos los productos publicados en la plataforma
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o tienda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtros y Vista */}
          <div className="flex gap-2">
            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {/* Toggle vista */}
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Vista de tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Vista de tarjetas"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel de filtros expandible */}
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="electronics">Electrónica</option>
                  <option value="clothing">Ropa y Accesorios</option>
                  <option value="home">Hogar y Jardín</option>
                  <option value="sports">Deportes</option>
                  <option value="toys">Juguetes</option>
                  <option value="books">Libros</option>
                  <option value="beauty">Belleza</option>
                  <option value="food">Alimentos</option>
                  <option value="automotive">Automotriz</option>
                  <option value="pets">Mascotas</option>
                  <option value="other">Otros</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>

      {/* Loading */}
      {loading && products.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No se encontraron productos</p>
        </div>
      ) : (
        <>
          {/* Vista Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Tienda
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Publicado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map(product => (
                      <ProductRow 
                        key={product.id} 
                        product={product} 
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        formatDate={formatDate}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botón cargar más */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadProducts(true)}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Cargando...' : 'Cargar más productos'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de edición */}
      <EditProductModal
        product={selectedProduct}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}

// Componente de tarjeta de producto
function ProductCard({ product, onEdit, onDelete, formatDate, formatPrice }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {product.imagenes && product.imagenes.length > 0 ? (
          <img 
            src={product.imagenes[0]} 
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Menú de acciones */}
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
                    onEdit(product);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar producto
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(product.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar producto
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.nombre}
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(product.precio)}
            </span>
            {product.stock !== undefined && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.stock > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                Stock: {product.stock}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Store className="w-4 h-4" />
            <span className="truncate">{product.tiendaId || 'Sin tienda'}</span>
          </div>

          {product.categoria && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Tag className="w-4 h-4" />
              <span className="truncate capitalize">{product.categoria}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(product.fechaCreacion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de fila de producto (vista lista)
function ProductRow({ product, onEdit, onDelete, formatDate, formatPrice }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
            {product.imagenes && product.imagenes.length > 0 ? (
              <img 
                src={product.imagenes[0]} 
                alt={product.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
              {product.nombre}
            </p>
            {product.descripcion && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {product.descripcion}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {product.tiendaId || 'Sin tienda'}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full capitalize">
          {product.categoria || 'Sin categoría'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
        {formatPrice(product.precio)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
          product.stock > 0 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {product.stock !== undefined ? product.stock : 'N/A'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(product.fechaCreacion)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
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