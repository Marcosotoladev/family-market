// src/components/store/ProductsGrid.js
'use client';

import { ShoppingBag, Package, ArrowRight } from 'lucide-react';

export default function ProductsGrid({ products, storeData }) {
  return (
    <section id="productos" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre la variedad de productos de calidad que ofrecemos para ti y tu familia
          </p>
        </div>

        {/* Contenido */}
        {products.length > 0 ? (
          <>
            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Imagen del producto */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Información del producto */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        ${product.price}
                      </span>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ver más productos */}
            <div className="text-center">
              <button className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                Ver todos los productos
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </>
        ) : (
          // Estado vacío - cuando no hay productos
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Próximamente productos disponibles
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {storeData.businessName} está preparando un catálogo de productos especialmente para ti.
            </p>
            <div className="inline-flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              Mantente atento a las novedades
            </div>
          </div>
        )}
      </div>
    </section>
  );
}