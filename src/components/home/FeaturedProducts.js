// src/components/home/FeaturedProducts.js
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProductCard from '@/components/ui/ProductCard';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      
      // Obtener productos destacados activos
      const now = new Date();
      const productsRef = collection(db, 'productos');
      const q = query(
        productsRef,
        where('featured', '==', true),
        where('featuredUntil', '>', now),
        where('estado', '==', 'disponible'),
        orderBy('featuredUntil', 'desc'),
        orderBy('fechaDestacado', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      // Obtener datos de cada producto con información de la tienda
      for (const docSnapshot of querySnapshot.docs) {
        const productData = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Obtener datos de la tienda/usuario
        try {
          const userDoc = await getDoc(doc(db, 'users', productData.usuarioId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            productData.tiendaInfo = {
              nombre: userData.businessName || userData.familyName || `${userData.firstName} ${userData.lastName}`.trim(),
              slug: userData.storeSlug,
              email: userData.email,
              phone: userData.phone,
              businessName: userData.businessName,
              familyName: userData.familyName
            };
          }
        } catch (error) {
          console.error('Error loading store data for product:', productData.id, error);
          productData.tiendaInfo = {
            nombre: 'Tienda Family Market',
            slug: '',
            email: '',
            phone: ''
          };
        }
        
        products.push(productData);
      }

      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  // No mostrar la sección si no hay productos destacados
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Productos Destacados
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Descubre los productos que nuestros emprendedores han elegido destacar especialmente para ti
          </p>
          
          {/* Contador de productos */}
          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-md">
              <Star className="w-4 h-4 text-yellow-500 mr-2 fill-current" />
              {featuredProducts.length} {featuredProducts.length === 1 ? 'producto destacado' : 'productos destacados'}
            </span>
          </div>
        </div>

        {/* Grid de productos destacados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <div key={product.id} className="relative group">
              {/* Badge de destacado */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 animate-bounce">
                  <Star className="w-3 h-3 fill-current" />
                  <span>DESTACADO</span>
                </div>
              </div>
              
              {/* Badge de posición para los primeros 3 */}
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              )}
              
              {/* Efecto de hover mejorado */}
              <div className="transform group-hover:scale-105 transition-transform duration-300">
                <ProductCard
                  product={product}
                  storeData={product.tiendaInfo}
                  variant="featured"
                  showStoreInfo={true}
                  showContactInfo={true}
                />
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
                  <Star className="w-8 h-8 text-white fill-current" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Quieres destacar tu producto?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Con una contribución voluntaria desde $1000, puedes hacer que tu producto aparezca 
                en esta sección especial por 7 días completos y llegue a más personas de la comunidad TTL.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Mayor Visibilidad</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tu producto aparece en la sección principal del home
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Badge Especial</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Distintivo de "DESTACADO" que llama la atención
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Más Contactos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aumenta significativamente las consultas por tu producto
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard/tienda/productos"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Destacar mi producto
                </Link>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Contribución sugerida: $5000 • Duración: 7 días
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Las contribuciones ayudan a mantener Family Market funcionando para toda la comunidad TTL
          </p>
        </div>
      </div>
    </section>
  );
}



