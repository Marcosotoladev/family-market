// src/app/tienda/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import StoreProductsSection from '@/components/tienda/StoreProductsSection';
import { Store, Loader2 } from 'lucide-react';

export default function StorePage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar datos de la tienda
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        console.log('Buscando tienda con slug:', slug);
        setLoading(true);
        
        // Buscar usuario por storeSlug
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('storeSlug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Tienda no encontrada');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        // Verificar que la cuenta esté aprobada
        if (userData.accountStatus !== 'approved' && userData.accountStatus !== 'true') {
          setError('Esta tienda no está disponible');
          return;
        }
        
        // Obtener configuración de la tienda
        const config = await getPublicStoreConfig(userData.id);
        
        setStoreData(userData);
        setStoreConfig(config);
        
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando tienda...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos preparando todo para ti
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Tienda no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  if (!storeData || !storeConfig) {
    return null;
  }

  const heroGradient = storeConfig.primaryColor && storeConfig.secondaryColor 
    ? `linear-gradient(135deg, ${storeConfig.primaryColor} 0%, ${storeConfig.secondaryColor} 100%)`
    : 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)';

  return (
    <div>
      <StoreLayout
        storeData={storeData}
        storeConfig={storeConfig}
        onSearch={handleSearch}
      >
        {/* Hero Section */}
        <section 
          className="text-white py-12 lg:py-16"
          style={{ background: heroGradient }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Bienvenidos a {storeData.businessName || storeData.familyName}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Productos y servicios de calidad, hechos con amor para tu familia
            </p>
          </div>
        </section>

        {/* Productos */}
        {storeConfig.showProducts && (
          <StoreProductsSection
            storeId={storeData.id}
            storeData={storeData}
            storeConfig={storeConfig}
            searchQuery={searchQuery}
            showFilters={false}
            maxProducts={6}
            variant="grid"
          />
        )}

        {/* Servicios */}
        {storeConfig.showServices && (
          <section id="servicios" className="py-8 lg:py-12 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nuestros Servicios
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Próximamente...
              </p>
            </div>
          </section>
        )}

        {/* Empleos */}
        {storeConfig.showJobs && (
          <section id="empleos" className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Oportunidades de Empleo
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Únete a nuestro equipo
              </p>
            </div>
          </section>
        )}

        {/* Galería */}
        {storeConfig.showGallery && (
          <section id="galeria" className="py-8 lg:py-12 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Galería
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Conoce más sobre nosotros
              </p>
            </div>
          </section>
        )}

        {/* Testimonios */}
        {storeConfig.showTestimonials && (
          <section id="testimonios" className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Testimonios
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Lo que dicen nuestros clientes
              </p>
            </div>
          </section>
        )}

        {/* Nosotros - Resumen */}
        <section className="py-8 lg:py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Sobre Nosotros
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Conoce nuestra historia, valores y compromiso
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Nuestra Historia
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Somos una familia dedicada a ofrecer productos y servicios de calidad, 
                  con valores cristianos y compromiso con nuestra comunidad.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Todo lo que hacemos está elaborado con ingredientes frescos y mucho amor.
                </p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Información de Contacto
                </h4>
                
                <div className="space-y-3 text-sm">
                  {storeData.phone && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Teléfono:</span>
                      <span className="text-gray-600 dark:text-gray-400">{storeData.phone}</span>
                    </div>
                  )}
                  
                  {storeData.email && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <span className="text-gray-600 dark:text-gray-400">{storeData.email}</span>
                    </div>
                  )}
                  
                  {storeData.address && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Dirección:</span>
                      <span className="text-gray-600 dark:text-gray-400">{storeData.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <a
                href={`/tienda/${slug}/nosotros`}
                className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                Conocer más sobre nosotros
              </a>
            </div>
          </div>
        </section>
      </StoreLayout>
    </div>
  );
}