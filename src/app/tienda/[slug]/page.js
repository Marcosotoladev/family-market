// src/app/tienda/[slug]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreHeader from '@/components/store/StoreHeader';
import StoreHero from '@/components/store/StoreHero';
import ProductsGrid from '@/components/store/ProductsGrid';
import ServicesSection from '@/components/store/ServicesSection';
import ContactSection from '@/components/store/ContactSection';
import StoreFooter from '@/components/store/StoreFooter';
import { Store } from 'lucide-react';

export default function StorePage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar la tienda por slug
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        console.log('Buscando tienda con slug:', slug);
        setLoading(true);
        
        // Buscar usuario por storeSlug
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('storeSlug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        console.log('Resultados encontrados:', querySnapshot.size);
        
        if (querySnapshot.empty) {
          console.log('No se encontró tienda con slug:', slug);
          setError('Tienda no encontrada');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        console.log('Datos de usuario encontrado:', userData);
        
        // Verificar que la cuenta esté aprobada
        if (userData.accountStatus !== 'approved' && userData.accountStatus !== 'true') {
          console.log('Cuenta no aprobada:', userData.accountStatus);
          setError('Esta tienda no está disponible');
          return;
        }
        
        // Obtener configuración de la tienda con valores por defecto
        const storeConfig = await getPublicStoreConfig(userData.id);
        
        setStoreData({ ...userData, storeConfig });
        
        // Buscar productos si están habilitados
        if (storeConfig.showProducts) {
          // TODO: Implementar búsqueda de productos
          // const productsRef = collection(db, 'products');
          // const productsQuery = query(productsRef, where('userId', '==', userData.id));
          // const productsSnapshot = await getDocs(productsQuery);
          // setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        
        // Buscar servicios si están habilitados
        if (storeConfig.showServices) {
          // TODO: Implementar búsqueda de servicios
          // const servicesRef = collection(db, 'services');
          // const servicesQuery = query(servicesRef, where('userId', '==', userData.id));
          // const servicesSnapshot = await getDocs(servicesQuery);
          // setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        
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

  // Aplicar tema dinámico y colores personalizados
  useEffect(() => {
    if (storeData?.storeConfig) {
      const { theme, primaryColor, secondaryColor } = storeData.storeConfig;
      
      // Aplicar variables CSS dinámicas
      const root = document.documentElement;
      root.style.setProperty('--store-primary', primaryColor);
      root.style.setProperty('--store-secondary', secondaryColor);
      
      // Aplicar configuraciones específicas del tema
      switch (theme) {
        case 'modern':
          root.style.setProperty('--store-border-radius', '0.5rem');
          root.style.setProperty('--store-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
          break;
        case 'classic':
          root.style.setProperty('--store-border-radius', '0.25rem');
          root.style.setProperty('--store-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)');
          break;
        case 'minimal':
          root.style.setProperty('--store-border-radius', '0');
          root.style.setProperty('--store-shadow', 'none');
          break;
        case 'colorful':
          root.style.setProperty('--store-border-radius', '1rem');
          root.style.setProperty('--store-shadow', '0 8px 25px -8px rgba(0, 0, 0, 0.2)');
          break;
        default:
          break;
      }
      
      // Aplicar clase de tema al body para estilos específicos
      document.body.className = `store-theme-${theme}`;
    }
    
    // Limpiar al desmontar
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary');
      root.style.removeProperty('--store-secondary');
      root.style.removeProperty('--store-border-radius');
      root.style.removeProperty('--store-shadow');
      
      const storeRoot = document.getElementById('store-root');
      if (storeRoot) {
        storeRoot.className = '';
      }
    };
  }, [storeData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Tienda no encontrada</h1>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
          <a 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Explorar Family Market
          </a>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return null;
  }

  const { storeConfig } = storeData;

  return (
    <div className="min-h-screen bg-white">
      {/* Inyectar estilos dinámicos */}
      <style jsx global>{`
        .store-container {
          border-radius: var(--store-border-radius, 0.5rem);
          box-shadow: var(--store-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }
        
        .store-primary-bg {
          background-color: var(--store-primary, #2563eb);
        }
        
        .store-primary-text {
          color: var(--store-primary, #2563eb);
        }
        
        .store-primary-border {
          border-color: var(--store-primary, #2563eb);
        }
        
        .store-secondary-bg {
          background-color: var(--store-secondary, #64748b);
        }
        
        .store-secondary-text {
          color: var(--store-secondary, #64748b);
        }
        
        .store-theme-colorful {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>

      <StoreHeader storeData={storeData} />
      
      <main>
        <StoreHero storeData={storeData} />
        
        {/* Productos - solo si están habilitados */}
        {storeConfig.showProducts && (
          <ProductsGrid 
            products={products} 
            storeData={storeData}
          />
        )}
        
        {/* Servicios - solo si están habilitados */}
        {storeConfig.showServices && (
          <ServicesSection 
            services={services} 
            storeData={storeData}
          />
        )}
        
        {/* Empleos - solo si están habilitados */}
        {storeConfig.showJobs && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Oportunidades de Empleo
                </h2>
                <p className="text-lg text-gray-600">
                  Únete a nuestro equipo y forma parte de algo increíble
                </p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Próximamente: sección de empleos disponibles
                </p>
              </div>
            </div>
          </section>
        )}
        
        {/* Galería - solo si está habilitada */}
        {storeConfig.showGallery && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Galería
                </h2>
                <p className="text-lg text-gray-600">
                  Conoce más sobre nosotros a través de imágenes
                </p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Próximamente: galería de fotos
                </p>
              </div>
            </div>
          </section>
        )}
        
        {/* Testimonios - solo si están habilitados */}
        {storeConfig.showTestimonials && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Lo que dicen nuestros clientes
                </h2>
                <p className="text-lg text-gray-600">
                  Testimonios de personas que confían en nosotros
                </p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Próximamente: testimonios de clientes
                </p>
              </div>
            </div>
          </section>
        )}
        
        {/* Contacto - siempre visible, pero configuración aplicable */}
        <ContactSection storeData={storeData} />
      </main>
      
      <StoreFooter storeData={storeData} />
    </div>
  );
}