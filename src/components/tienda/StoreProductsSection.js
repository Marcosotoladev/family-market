// src/components/tienda/StoreProductsSection.js
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProductCard from './productos/ProductCard';
import { CATEGORIAS_PRODUCTOS } from '@/types/categories';
import { ESTADOS_PRODUCTO } from '@/types/product';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Package,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';

export default function StoreProductsSection({
  storeId,
  storeData,
  storeConfig,
  searchQuery = '',
  showFilters = true,
  maxProducts = null,
  variant = 'grid' // 'grid' | 'list'
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filtros
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState(variant);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Configuración de paginación
  const PRODUCTS_PER_PAGE = maxProducts || 12;

  useEffect(() => {
    if (storeId) {
      loadProducts(true);
    }
  }, [storeId, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Buscar cuando cambie la query local con debounce
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        loadProducts(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const loadProducts = async (reset = false) => {
    console.log('🔍 loadProducts ejecutándose');
    console.log('🔍 storeId:', storeId);
    console.log('🔍 Consultando colección: productos');
    console.log('🔍 Filtro usuarioId ==', storeId);
    console.log('🔍 Filtro estado ==', ESTADOS_PRODUCTO.DISPONIBLE);

    try {
      if (reset) {
        setLoading(true);
        setProducts([]);
        setLastVisible(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const productsRef = collection(db, 'productos');
      let q = query(
        productsRef,
        where('usuarioId', '==', storeId),
        where('estado', '==', ESTADOS_PRODUCTO.DISPONIBLE)
      );

      // Filtro por categoría
      if (selectedCategory) {
        q = query(q, where('categoria', '==', selectedCategory));
      }

      // Ordenamiento
      const orderField = sortBy === 'precio' ? 'precio' :
        sortBy === 'ventas' ? 'totalVentas' :
          sortBy === 'titulo' ? 'titulo' : 'fechaCreacion';

      q = query(q, orderBy(orderField, sortOrder));

      // Paginación
      if (!reset && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      q = query(q, limit(PRODUCTS_PER_PAGE));

      const querySnapshot = await getDocs(q);
      console.log('🔍 Documentos encontrados:', querySnapshot.docs.length);

      const newProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('🔍 Productos obtenidos:', newProducts);

      // Filtros adicionales que no se pueden hacer en Firestore
      let filteredProducts = newProducts;

      // Filtro por búsqueda de texto
      if (localSearchQuery) {
        const searchLower = localSearchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.titulo.toLowerCase().includes(searchLower) ||
          product.descripcion.toLowerCase().includes(searchLower) ||
          product.palabrasClave?.some(keyword =>
            keyword.toLowerCase().includes(searchLower)
          ) ||
          product.etiquetas?.some(tag =>
            tag.toLowerCase().includes(searchLower)
          )
        );
      }

      // Filtro por rango de precio
      if (priceRange.min || priceRange.max) {
        filteredProducts = filteredProducts.filter(product => {
          if (product.tipoPrecio !== 'fijo') return true;
          const price = product.precio || 0;
          const min = parseFloat(priceRange.min) || 0;
          const max = parseFloat(priceRange.max) || Infinity;
          return price >= min && price <= max;
        });
      }

      console.log('🔍 Productos después de filtros locales:', filteredProducts);

      if (reset) {
        setProducts(filteredProducts);
      } else {
        setProducts(prev => [...prev, ...filteredProducts]);
      }

      // Actualizar paginación
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === PRODUCTS_PER_PAGE);

    } catch (error) {
      console.error('🔥 Error cargando productos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleProductClick = async (product) => {
    // Incrementar contador de vistas
    try {
      const productRef = doc(db, 'productos', product.id);
      await updateDoc(productRef, {
        totalVistas: increment(1)
      });
    } catch (error) {
      console.error('Error actualizando vistas:', error);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setLocalSearchQuery('');
    setSortBy('fechaCreacion');
    setSortOrder('desc');
  };

  const categories = Object.values(CATEGORIAS_PRODUCTOS);
  const hasActiveFilters = selectedCategory || priceRange.min || priceRange.max || localSearchQuery;

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando productos...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="productos" className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestros Productos
          </h2>
        </div>

        {/* Filtros y búsqueda */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-8">
            {/* Barra superior de filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Controles de vista */}
              <div className="flex items-center space-x-4">
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
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      } transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Panel de filtros expandible */}
            {showFiltersPanel && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Precio mínimo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="$0"
                    />
                  </div>

                  {/* Precio máximo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Sin límite"
                    />
                  </div>

                  {/* Ordenar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordenar por
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="fechaCreacion">Más recientes</option>
                        <option value="titulo">Nombre</option>
                        <option value="precio">Precio</option>
                        <option value="ventas">Más vendidos</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botón limpiar filtros */}
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {products.length > 0
              ? `Mostrando ${products.length} producto${products.length !== 1 ? 's' : ''}${hasActiveFilters ? ' (filtrado)' : ''}`
              : 'No se encontraron productos'
            }
          </p>
        </div>

        {/* Grid de productos */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Esta tienda aún no ha publicado productos'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-4'
            }>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeData={storeData}
                  variant={viewMode === 'grid' ? 'featured-compact' : viewMode}  // ← Usa featured-compact para grid
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>

            {/* Botón Ver todos o Cargar más */}
            {maxProducts ? (
              // Si hay límite (vista previa), mostrar botón "Ver todos"
              products.length >= maxProducts && (
                <div className="text-center mt-8">
                  <a
                    href={`/tienda/${storeData.storeSlug}/productos`}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    Ver todos los productos
                  </a>
                </div>
              )
            ) : (
              // Si no hay límite, mostrar botón "Cargar más"
              hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => loadProducts(false)}
                    disabled={loadingMore}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Cargar más productos
                      </>
                    )}
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </section>
  );
}