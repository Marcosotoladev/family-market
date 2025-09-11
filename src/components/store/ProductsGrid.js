// src/components/store/ProductsGrid.js
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';

const ProductsGrid = ({ products, storeData }) => {
  // Productos de ejemplo si no hay productos reales
  const exampleProducts = [
    {
      id: 1,
      name: 'Producto Destacado 1',
      description: 'Descripción del producto destacado',
      price: 29.99,
      image: 'https://via.placeholder.com/300x200?text=Producto+1',
      rating: 4.5,
      reviews: 23
    },
    {
      id: 2,
      name: 'Producto Destacado 2', 
      description: 'Otro producto increíble',
      price: 49.99,
      image: 'https://via.placeholder.com/300x200?text=Producto+2',
      rating: 4.8,
      reviews: 45
    },
    {
      id: 3,
      name: 'Producto Destacado 3',
      description: 'El mejor producto de la tienda',
      price: 79.99,
      image: 'https://via.placeholder.com/300x200?text=Producto+3',
      rating: 4.9,
      reviews: 67
    }
  ];

  const displayProducts = products.length > 0 ? products : exampleProducts;

  const ProductCard = ({ product }) => (
    <div 
      className="group bg-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
      style={{ 
        borderRadius: 'var(--store-border-radius, 0.5rem)',
        boxShadow: 'var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
      }}
    >
      {/* Imagen del producto */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              className="p-2 rounded-full text-white transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: 'var(--store-primary, #2563eb)' }}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-full text-white transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: 'var(--store-secondary, #64748b)' }}
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) 
                    ? 'fill-current' 
                    : 'text-gray-300'
                }`}
                style={{ 
                  color: i < Math.floor(product.rating) 
                    ? 'var(--store-primary, #2563eb)' 
                    : undefined 
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div>
            <span 
              className="text-2xl font-bold"
              style={{ color: 'var(--store-primary, #2563eb)' }}
            >
              ${product.price}
            </span>
          </div>
          
          <button 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--store-primary, #2563eb)',
              borderRadius: 'var(--store-border-radius, 0.5rem)'
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de productos de alta calidad
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Botón ver más */}
        <div className="text-center mt-12">
          <button 
            className="px-8 py-3 rounded-lg font-semibold border-2 transition-all duration-200 hover:scale-105"
            style={{ 
              borderColor: 'var(--store-primary, #2563eb)',
              color: 'var(--store-primary, #2563eb)',
              borderRadius: 'var(--store-border-radius, 0.5rem)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--store-primary, #2563eb)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--store-primary, #2563eb)';
            }}
          >
            Ver Todos los Productos
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;