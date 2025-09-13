// src/components/tienda/StoreProductsSection.js
'use client';

import { useState, useEffect } from 'react';
import { Package, Filter, Grid, List, Search } from 'lucide-react';

const StoreProductsSection = ({ 
  products = [], 
  storeConfig,
  searchQuery 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtrar productos basado en búsqueda y categoría
  const filterProducts = () => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Filtrar por búsqueda
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  // Ejecutar filtros cuando cambien las dependencias
  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  // Obtener categorías únicas
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Imagen del producto */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Badge de estado */}
        {product.status && (
          <div className="absolute top-2 right-2">
            <span 
              className="px-2 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
            >
              {product.status}
            </span>
          </div>
        )}
      </div>
      
      {/* Información del producto */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {product.price && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${product.price}
            </span>
          )}
          
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        
        {/* Imagen pequeña */}
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
              {product.description}
            </p>
          )}
          
          {product.category && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {product.category}
            </span>
          )}
        </div>
        
        {/* Precio y acción */}
        <div className="flex flex-col items-end space-y-2">
          {product.price && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${product.price}
            </span>
          )}
          
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section id="productos" className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header de la sección */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Descubre nuestra selección de productos de calidad
          </p>
        </div>

        {/* Filtros y controles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          
          {/* Filtros de categoría */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category 
                      ? storeConfig?.primaryColor || '#ea580c'
                      : undefined
                  }}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Controles de vista */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} productos
            </span>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-900 dark:text-blue-100">
                Resultados para: <strong>"{searchQuery}"</strong>
              </span>
              <span className="text-blue-700 dark:text-blue-300">
                ({filteredProducts.length} encontrados)
              </span>
            </div>
          </div>
        )}

        {/* Grid/Lista de productos */}
        {filteredProducts.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductListItem key={product.id} product={product} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `No hay productos que coincidan con "${searchQuery}"`
                : selectedCategory !== 'all'
                  ? `No hay productos en la categoría "${selectedCategory}"`
                  : 'Aún no hay productos disponibles'
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreProductsSection;