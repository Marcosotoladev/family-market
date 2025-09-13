// src/app/tienda/[slug]/servicios/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { ArrowLeft, Loader2, Wrench, Clock, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ServiciosPage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        
        // TODO: Cargar servicios reales de Firestore
        const mockServices = [
          {
            id: 1,
            name: 'Catering para Eventos',
            description: 'Servicio completo de catering para bodas, cumpleaños y eventos especiales',
            price: 'Desde $5000',
            category: 'Eventos',
            image: 'https://via.placeholder.com/300x200/10b981/white?text=CATERING',
            duration: '4-8 horas',
            availability: 'Lunes a Domingo'
          },
          {
            id: 2,
            name: 'Clases de Cocina',
            description: 'Aprende a cocinar platos tradicionales con ingredientes naturales',
            price: '$1500 por clase',
            category: 'Educación',
            image: 'https://via.placeholder.com/300x200/f59e0b/white?text=CLASES',
            duration: '2 horas',
            availability: 'Sábados'
          },
          {
            id: 3,
            name: 'Delivery de Comidas',
            description: 'Entrega a domicilio de comidas caseras preparadas diariamente',
            price: 'Desde $800',
            category: 'Delivery',
            image: 'https://via.placeholder.com/300x200/3b82f6/white?text=DELIVERY',
            duration: 'Inmediato',
            availability: 'Lunes a Viernes'
          }
        ];
        setServices(mockServices);
        
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
            Cargando servicios...
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

  const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Wrench className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">
            {service.name}
          </h3>
          <span className="text-lg font-bold text-gray-900">
            {service.price}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {service.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>Duración: {service.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span>Disponible: {service.availability}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            {service.category}
          </span>
          
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
          >
            Solicitar
          </button>
        </div>
      </div>
    </div>
  );

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
            <span className="text-gray-900 font-medium">Servicios</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuestros Servicios
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Servicios profesionales adaptados a tus necesidades
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

      {/* Contenido principal */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Grid de servicios */}
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Próximamente
              </h3>
              <p className="text-gray-600">
                Estamos preparando nuestros servicios para ti
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Cómo solicitar un servicio?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">1</span>
                </div>
                <p className="font-medium text-gray-900">Elige tu servicio</p>
                <p className="text-gray-600">Selecciona el que mejor se adapte</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">2</span>
                </div>
                <p className="font-medium text-gray-900">Contáctanos</p>
                <p className="text-gray-600">Te responderemos rápidamente</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="font-semibold text-orange-600">3</span>
                </div>
                <p className="font-medium text-gray-900">Coordinamos</p>
                <p className="text-gray-600">Agendamos fecha y detalles</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Necesitas más información?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {storeData.phone && (
                <a
                  href={`tel:${storeData.phone}`}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {storeData.phone}
                </a>
              )}
              
              <button
                className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}