// src/app/tienda/[slug]/productos/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import StoreProductsSection from '@/components/tienda/StoreProductsSection';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductosPage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar datos de la tienda (mismo código que en la página principal)
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('storeSlug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Tienda no encontrada');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        if (userData.accountStatus !== 'approved' && userData.accountStatus !== 'true') {
          setError('Esta tienda no está disponible');
          return;
        }
        
        const config = await getPublicStoreConfig(userData.id);
        
        setStoreData(userData);
        setStoreConfig(config);
        
        // TODO: Cargar productos reales de Firestore
        const mockProducts = [
          {
            id: 1,
            name: 'Dulce de Leche Artesanal',
            description: 'Dulce de leche casero elaborado con leche fresca de la región',
            price: 850,
            category: 'Dulces',
            image: 'https://via.placeholder.com/300x300/f97316/white?text=DULCE',
            status: 'Disponible'
          },
          {
            id: 2,
            name: 'Empanadas Criollas',
            description: 'Empanadas caseras con carne, pollo, jamón y queso',
            price: 200,
            category: 'Comidas',
            image: 'https://via.placeholder.com/300x300/059669/white?text=EMPANADAS',
            status: 'Disponible'
          },
          {
            id: 3,
            name: 'Mermelada de Durazno',
            description: 'Mermelada casera elaborada con duraznos de temporada',
            price: 650,
            category: 'Dulces',
            image: 'https://via.placeholder.com/300x300/dc2626/white?text=MERMELADA'
          },
          {
            id: 4,
            name: 'Pan Casero',
            description: 'Pan artesanal horneado diariamente',
            price: 450,
            category: 'Panadería',
            image: 'https://via.placeholder.com/300x300/92400e/white?text=PAN'
          }
        ];
        setProducts(mockProducts);
        
      } catch (error) {
        console.error('Error al cargar la tienda:', error);
        setError('Error al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  // Aplicar colores personalizados
  useEffect(() => {
    if (storeConfig) {
      const root = document.documentElement;
      
      if (storeConfig.primaryColor) {
        root.style.setProperty('--store-primary-color', storeConfig.primaryColor);
      }
      if (storeConfig.secondaryColor) {
        root.style.setProperty('--store-secondary-color', storeConfig.secondaryColor);
      }
    }
    
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary-color');
      root.style.removeProperty('--store-secondary-color');
    };
  }, [storeConfig]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando productos...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !storeData || !storeConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {error || 'Página no encontrada'}
          </h2>
          <Link
            href={`/tienda/${slug}`}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StoreLayout
      storeData={storeData}
      storeConfig={storeConfig}
      onSearch={handleSearch}
    >
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href={`/tienda/${slug}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {storeData.businessName || storeData.familyName}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Productos</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuestros Productos
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Descubre nuestra selección completa de productos artesanales
              </p>
            </div>
            
            <Link
              href={`/tienda/${slug}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Sección de productos completa */}
      <StoreProductsSection
        products={products}
        storeConfig={storeConfig}
        searchQuery={searchQuery}
      />
    </StoreLayout>
  );
}