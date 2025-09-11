// src/app/tienda/[slug]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import StoreHeader from '@/components/store/StoreHeader';
import StoreHero from '@/components/store/StoreHero';
import ProductsGrid from '@/components/store/ProductsGrid';
import ServicesSection from '@/components/store/ServicesSection';
import ContactSection from '@/components/store/ContactSection';
import StoreFooter from '@/components/store/StoreFooter';

export default function StorePage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuración predeterminada de la tienda
  const defaultStoreConfig = {
    showProducts: true,
    showServices: true,
    showJobs: false,
    showAbout: true,
    showTestimonials: false,
    showGallery: false,
    theme: 'modern', // modern, classic, minimal, colorful
    primaryColor: '#2563eb', // azul por defecto
    secondaryColor: '#64748b' // gris por defecto
  };

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
        
        // Combinar configuración predeterminada con configuración del usuario
        const storeConfig = {
          ...defaultStoreConfig,
          ...(userData.storeConfig || {})
        };
        
        setStoreData({ ...userData, storeConfig });
        
        // Buscar productos si están habilitados
        if (storeConfig.showProducts) {
          // const productsRef = collection(db, 'products');
          // const productsQuery = query(productsRef, where('userId', '==', userData.id));
          // const productsSnapshot = await getDocs(productsQuery);
          // setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        
        // Buscar servicios si están habilitados
        if (storeConfig.showServices) {
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

  // Aplicar tema dinámico
  useEffect(() => {
    if (storeData?.storeConfig) {
      const { primaryColor, secondaryColor } = storeData.storeConfig;
      
      // Aplicar variables CSS dinámicas
      document.documentElement.style.setProperty('--store-primary', primaryColor);
      document.documentElement.style.setProperty('--store-secondary', secondaryColor);
    }
    
    // Limpiar al desmontar
    return () => {
      document.documentElement.style.removeProperty('--store-primary');
      document.documentElement.style.removeProperty('--store-secondary');
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
              <span className="text-2xl">🏪</span>
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
        
        {/* Contacto - siempre visible */}
        <ContactSection storeData={storeData} />
      </main>
      
      <StoreFooter storeData={storeData} />
    </div>
  );
}