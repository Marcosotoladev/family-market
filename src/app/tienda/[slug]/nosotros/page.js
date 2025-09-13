// src/app/tienda/[slug]/nosotros/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Heart,
  Award,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function NosotrosPage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
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
            Cargando información...
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
            <span className="text-gray-900 font-medium">Nosotros</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sobre Nosotros
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Conoce nuestra historia, valores y compromiso
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

      {/* Hero Section */}
      <div 
        className="py-16 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${storeConfig.primaryColor || '#ea580c'} 0%, ${storeConfig.secondaryColor || '#dc2626'} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                {storeData.businessName || storeData.familyName}
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Una familia dedicada a ofrecer productos y servicios de calidad, 
                con valores cristianos y compromiso con nuestra comunidad.
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">2019</div>
                  <div className="text-sm opacity-75">Fundado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm opacity-75">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm opacity-75">Artesanal</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {storeData.storeLogo ? (
                  <img 
                    src={storeData.storeLogo} 
                    alt="Logo"
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <Users className="w-32 h-32 text-white opacity-75" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nuestra Historia */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  Todo comenzó como una tradición familiar. Desde pequeños, aprendimos 
                  las recetas que se transmitían de generación en generación en nuestra familia.
                </p>
                <p>
                  Con el tiempo, decidimos compartir estos sabores auténticos con nuestra 
                  comunidad, manteniendo siempre la calidad y el amor que caracterizan 
                  nuestros productos.
                </p>
                <p>
                  Creemos firmemente en el trabajo honesto, la calidad de los ingredientes 
                  y el trato familiar que hace que cada cliente se sienta especial.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="https://via.placeholder.com/200x150/f97316/white?text=FAMILIA"
                  alt="Familia trabajando"
                  className="w-full rounded-lg shadow-sm"
                />
                <img 
                  src="https://via.placeholder.com/200x150/10b981/white?text=TRADICION"
                  alt="Tradición"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img 
                  src="https://via.placeholder.com/200x150/3b82f6/white?text=CALIDAD"
                  alt="Calidad"
                  className="w-full rounded-lg shadow-sm"
                />
                <img 
                  src="https://via.placeholder.com/200x150/8b5cf6/white?text=AMOR"
                  alt="Amor"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h3>
            <p className="text-lg text-gray-600">
              Los principios que guían nuestro trabajo diario
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Amor por lo que hacemos
              </h4>
              <p className="text-gray-600">
                Cada producto está hecho con dedicación y cariño, 
                como si fuera para nuestra propia familia.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Calidad sin compromisos
              </h4>
              <p className="text-gray-600">
                Utilizamos solo ingredientes frescos y naturales, 
                manteniendo los más altos estándares de calidad.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Compromiso con la comunidad
              </h4>
              <p className="text-gray-600">
                Trabajamos para fortalecer nuestra comunidad local 
                y apoyar a las familias de la región.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-6">
                {storeData.phone && (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: storeConfig?.primaryColor + '20' || '#ea580c20' }}
                    >
                      <Phone 
                        className="w-6 h-6"
                        style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <p className="text-gray-600">{storeData.phone}</p>
                    </div>
                  </div>
                )}
                
                {storeData.email && (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: storeConfig?.primaryColor + '20' || '#ea580c20' }}
                    >
                      <Mail 
                        className="w-6 h-6"
                        style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{storeData.email}</p>
                    </div>
                  </div>
                )}
                
                {storeData.address && (
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: storeConfig?.primaryColor + '20' || '#ea580c20' }}
                    >
                      <MapPin 
                        className="w-6 h-6"
                        style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dirección</p>
                      <p className="text-gray-600">{storeData.address}</p>
                      {storeData.city && (
                        <p className="text-gray-600">{storeData.city}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: storeConfig?.primaryColor + '20' || '#ea580c20' }}
                  >
                    <Clock 
                      className="w-6 h-6"
                      style={{ color: storeConfig?.primaryColor || '#ea580c' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Horarios</p>
                    <p className="text-gray-600">Lunes a Viernes: 9:00 - 18:00</p>
                    <p className="text-gray-600">Sábados: 9:00 - 14:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Síguenos en Redes
              </h3>
              
              {storeConfig.socialLinks && Object.values(storeConfig.socialLinks).some(link => link) ? (
                <div className="space-y-4">
                  {Object.entries(storeConfig.socialLinks).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 capitalize">
                          {platform}
                        </span>
                        <span className="text-gray-500">→</span>
                      </a>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Próximamente estaremos en redes sociales para mantenerte 
                  informado sobre nuestros productos y novedades.
                </p>
              )}
              
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  ¿Tienes alguna pregunta?
                </h4>
                <p className="text-gray-600 mb-4">
                  No dudes en contactarnos. Estamos aquí para ayudarte.
                </p>
                <button
                  className="w-full px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  Enviar WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}