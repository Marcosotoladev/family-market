// src/app/tienda/[slug]/producto/[productId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ProductCard from '@/components/tienda/productos/ProductCard';
import ProductRatingsAndComments from '@/components/tienda/productos/ProductRatingsAndComments';
import { ArrowLeft, Share2, Heart, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const { slug, productId } = params;
  
  const [product, setProduct] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Params recibidos:', params);
    console.log('ProductId:', productId);
    console.log('Slug:', slug);
    
    if (productId && slug) {
      loadProductAndStore();
    } else {
      setError('Parámetros de URL inválidos');
      setLoading(false);
    }
  }, [productId, slug, params]);

  const loadProductAndStore = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando cargar producto con ID:', productId);
      
      // Validar que productId existe y es string
      if (!productId || typeof productId !== 'string') {
        throw new Error('ID de producto inválido');
      }
      
      // Cargar producto
      const productDoc = await getDoc(doc(db, 'productos', productId));
      if (!productDoc.exists()) {
        setError('Producto no encontrado');
        return;
      }
      
      const productData = { id: productDoc.id, ...productDoc.data() };
      console.log('Producto cargado:', productData);
      setProduct(productData);
      
      // Cargar datos de la tienda
      if (productData.usuarioId) {
        const storeDoc = await getDoc(doc(db, 'users', productData.usuarioId));
        if (storeDoc.exists()) {
          setStoreData(storeDoc.data());
          console.log('Datos de tienda cargados:', storeDoc.data());
        }
      }
      
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError(`Error al cargar el producto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingUpdate = () => {
    // Recargar el producto para obtener las valoraciones actualizadas
    loadProductAndStore();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando producto...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            ID: {productId || 'No disponible'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Producto no encontrado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ID buscado: {productId || 'No disponible'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Slug: {slug || 'No disponible'}
          </p>
          <Link 
            href={slug ? `/tienda/${slug}` : '/'}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {slug ? 'Volver a la tienda' : 'Ir al inicio'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link 
            href="/"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Inicio
          </Link>
          <span>/</span>
          <Link 
            href={`/tienda/${slug}`}
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            {storeData?.businessName || storeData?.familyName || 'Tienda'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {product.titulo || product.nombre}
          </span>
        </nav>

        {/* Header con botón de volver */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/tienda/${slug}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.titulo || product.nombre,
                    text: product.descripcion,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Enlace copiado al portapapeles');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda - Detalles del producto */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tarjeta del producto */}
            <div className="max-w-md">
              <ProductCard
                product={product}
                storeData={storeData}
                variant="grid"
                showContactInfo={true}
                showStoreInfo={true}
              />
            </div>
            
            {/* Descripción completa */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Descripción del Producto
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.descripcion}
                </p>
              </div>
              
              {/* Información adicional */}
              {(product.categoria || product.etiquetas?.length > 0 || product.palabrasClave?.length > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {product.categoria && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categoría</h4>
                        <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                          {product.categoria}
                        </span>
                      </div>
                    )}
                    
                    {product.etiquetas?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Etiquetas</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.etiquetas.map((etiqueta, index) => (
                            <span 
                              key={index}
                              className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm"
                            >
                              {etiqueta.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Columna derecha - Valoraciones y comentarios */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProductRatingsAndComments 
                product={product}
                onRatingUpdate={handleRatingUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}