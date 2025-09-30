// src/components/tienda/StoreTestimonialsSection.js
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Star, Quote, Loader2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StoreTestimonialsSection({ 
  storeId,
  storeData,
  maxTestimonials = null
}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (storeId) {
      loadTestimonials();
    }
  }, [storeId]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      
      // Buscar testimonios/comentarios del usuario
      const testimonialsRef = collection(db, 'testimonios');
      let q = query(
        testimonialsRef,
        where('tiendaId', '==', storeId),
        where('visible', '==', true),
        orderBy('fechaCreacion', 'desc')
      );

      if (maxTestimonials) {
        q = query(q, limit(maxTestimonials));
      }

      const querySnapshot = await getDocs(q);
      const testimonialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error cargando testimonios:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando testimonios...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Testimonios
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Lo que dicen nuestros clientes
            </p>
          </div>
          
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay testimonios disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Esta tienda aún no tiene testimonios de clientes
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonios" className="py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Testimonios
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Lo que dicen nuestros clientes sobre nosotros
          </p>
        </div>

        {/* Testimonios Carousel (para 3 o menos testimonios) */}
        {testimonials.length <= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-200 dark:text-blue-900/30" />
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.valoracion || 5)}
                </div>

                {/* Comentario */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.comentario || testimonial.contenido}"
                </p>

                {/* Autor */}
                <div className="flex items-center">
                  {testimonial.usuario?.avatar ? (
                    <img
                      src={testimonial.usuario.avatar}
                      alt={testimonial.usuario.nombre}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg mr-4">
                      {testimonial.usuario?.nombre?.[0]?.toUpperCase() || 'C'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.usuario?.nombre || testimonial.nombreCliente || 'Cliente'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.fechaCreacion?.toDate?.()?.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) || ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Carousel para más de 3 testimonios
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 md:p-12 relative">
                      <Quote className="absolute top-8 right-8 w-16 h-16 text-blue-100 dark:text-blue-900/20" />
                      
                      {/* Rating */}
                      <div className="flex items-center justify-center mb-6">
                        {renderStars(testimonial.valoracion || 5)}
                      </div>

                      {/* Comentario */}
                      <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 text-center italic">
                        "{testimonial.comentario || testimonial.contenido}"
                      </p>

                      {/* Autor */}
                      <div className="flex items-center justify-center">
                        {testimonial.usuario?.avatar ? (
                          <img
                            src={testimonial.usuario.avatar}
                            alt={testimonial.usuario.nombre}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl mr-4">
                            {testimonial.usuario?.nombre?.[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div className="text-left">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {testimonial.usuario?.nombre || testimonial.nombreCliente || 'Cliente'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.fechaCreacion?.toDate?.()?.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controles del Carousel */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Botón Ver más */}
        {maxTestimonials && testimonials.length >= maxTestimonials && (
          <div className="text-center mt-8">
            <a
              href={`/tienda/${storeData.storeSlug}/testimonios`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Ver todos los testimonios
            </a>
          </div>
        )}
      </div>
    </section>
  );
}