// src/app/tienda/[slug]/testimonios/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getPublicStoreConfig } from '@/lib/storeConfigUtils';
import StoreLayout from '@/components/tienda/StoreLayout';
import { ArrowLeft, Loader2, MessageCircle, Star, Quote } from 'lucide-react';
import Link from 'next/link';

export default function TestimoniosPage() {
  const params = useParams();
  const { slug } = params;
  
  const [storeData, setStoreData] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
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
        
        // TODO: Cargar testimonios reales de Firestore
        const mockTestimonials = [
          {
            id: 1,
            name: 'María González',
            rating: 5,
            comment: 'Excelente calidad en todos sus productos. Las empanadas son deliciosas y el dulce de leche es como el que hacía mi abuela. Muy recomendable.',
            date: '2024-01-20',
            product: 'Empanadas y Dulce de Leche',
            avatar: 'https://via.placeholder.com/60x60/f472b6/white?text=MG'
          },
          {
            id: 2,
            name: 'Carlos Rodríguez',
            rating: 5,
            comment: 'Siempre compro aquí para los eventos familiares. La atención es excelente y los productos frescos. Los precios son muy justos.',
            date: '2024-01-18',
            product: 'Catering para evento',
            avatar: 'https://via.placeholder.com/60x60/3b82f6/white?text=CR'
          },
          {
            id: 3,
            name: 'Ana Martínez',
            rating: 4,
            comment: 'Me encantan las mermeladas caseras. Se nota que están hechas con ingredientes naturales. Mi familia las adora.',
            date: '2024-01-15',
            product: 'Mermeladas artesanales',
            avatar: 'https://via.placeholder.com/60x60/10b981/white?text=AM'
          },
          {
            id: 4,
            name: 'Pedro Fernández',
            rating: 5,
            comment: 'El pan casero es buenísimo, siempre fresco. Hago pedidos semanales y nunca me han fallado con la entrega.',
            date: '2024-01-12',
            product: 'Pan artesanal',
            avatar: 'https://via.placeholder.com/60x60/f59e0b/white?text=PF'
          },
          {
            id: 5,
            name: 'Lucía Torres',
            rating: 5,
            comment: 'La mejor miel que he probado en años. Pura y natural, se nota la diferencia. Además, el trato familiar es excelente.',
            date: '2024-01-10',
            product: 'Miel natural',
            avatar: 'https://via.placeholder.com/60x60/8b5cf6/white?text=LT'
          },
          {
            id: 6,
            name: 'Javier Morales',
            rating: 4,
            comment: 'Productos de muy buena calidad. El queso de cabra es espectacular. Precios accesibles y entrega puntual.',
            date: '2024-01-08',
            product: 'Queso de cabra',
            avatar: 'https://via.placeholder.com/60x60/ef4444/white?text=JM'
          }
        ];
        setTestimonials(mockTestimonials);
        
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando testimonios...
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

  const TestimonialCard = ({ testimonial }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {testimonial.name}
            </h3>
            <div className="flex items-center space-x-1">
              {renderStars(testimonial.rating)}
            </div>
          </div>
          
          <div className="relative">
            <Quote className="w-6 h-6 text-gray-300 absolute -top-2 -left-2" />
            <p className="text-gray-700 mb-3 relative z-10 pl-4">
              {testimonial.comment}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Producto: {testimonial.product}</span>
            <span>{formatDate(testimonial.date)}</span>
          </div>
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
            <span className="text-gray-900 font-medium">Testimonios</span>
          </nav>
        </div>
      </div>

      {/* Header de página */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Lo que dicen nuestros clientes
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Testimonios reales de personas que confían en nosotros
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

      {/* Estadísticas */}
      {testimonials.length > 0 && (
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {testimonials.length}
                </div>
                <div className="text-gray-600">Testimonios</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-900 mr-2">
                    {averageRating}
                  </span>
                  <div className="flex items-center">
                    {renderStars(Math.round(parseFloat(averageRating)))}
                  </div>
                </div>
                <div className="text-gray-600">Calificación promedio</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {Math.round((testimonials.filter(t => t.rating >= 4).length / testimonials.length) * 100)}%
                </div>
                <div className="text-gray-600">Clientes satisfechos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {testimonials.length > 0 ? (
            <div className="space-y-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aún no hay testimonios
              </h3>
              <p className="text-gray-600 mb-6">
                Sé el primero en compartir tu experiencia con nosotros
              </p>
              <button
                className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
              >
                Dejar un testimonio
              </button>
            </div>
          )}

          {/* Formulario para nuevo testimonio */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Comparte tu experiencia
            </h3>
            
            <form className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                    style={{ '--tw-ring-color': storeConfig?.primaryColor || '#ea580c' }}
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Producto/Servicio
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                    style={{ '--tw-ring-color': storeConfig?.primaryColor || '#ea580c' }}
                    placeholder="¿Qué compraste?"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu testimonio
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white resize-none"
                  style={{ '--tw-ring-color': storeConfig?.primaryColor || '#ea580c' }}
                  placeholder="Cuéntanos sobre tu experiencia..."
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  style={{ backgroundColor: storeConfig?.primaryColor || '#ea580c' }}
                >
                  Enviar testimonio
                </button>
              </div>
            </form>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Tu testimonio será revisado antes de publicarse
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}