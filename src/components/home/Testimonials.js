// src/components/home/Testimonials.js
'use client'
import { Star, Quote } from 'lucide-react'

export default function Testimonials({ 
  title = "Lo que dice nuestra comunidad",
  subtitle = "Historias reales de hermanos que han encontrado bendición a través de Family Market",
  testimonials = null 
}) {
  
  // Testimonios por defecto si no se pasan como prop
  const defaultTestimonials = [
    {
      id: 1,
      name: 'María González',
      role: 'Repostera',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c04c1a01?w=64&h=64&fit=crop&crop=face',
      testimonial: 'Gracias a Family Market pude expandir mi negocio de tortas. La comunidad TTL me apoyó desde el primer día.',
      rating: 5,
      featured: true
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      role: 'Desarrollador',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      testimonial: 'Encontré mi primer cliente para servicios web aquí. Es hermoso ver cómo Dios bendice cuando servimos a nuestros hermanos.',
      rating: 5,
      featured: true
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      role: 'Compradora frecuente',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
      testimonial: 'Siempre encuentro productos únicos y de calidad. Además, cada compra fortalece nuestra comunidad de fe.',
      rating: 5,
      featured: false
    },
    {
      id: 4,
      name: 'Roberto Silva',
      role: 'Profesor de Inglés',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
      testimonial: 'A través de esta plataforma conseguí varios estudiantes para mis clases online. La bendición ha sido mutua.',
      rating: 5,
      featured: false
    },
    {
      id: 5,
      name: 'Elena Castro',
      role: 'Artesana',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
      testimonial: 'Mis tejidos ahora llegan a toda la comunidad. Es maravilloso ver cómo nuestros talentos pueden servir a otros hermanos.',
      rating: 5,
      featured: true
    },
    {
      id: 6,
      name: 'José Fernández',
      role: 'Plomero',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face',
      testimonial: 'Como profesional independiente, Family Market me conectó con familias que necesitaban mis servicios. Dios multiplica cuando damos lo mejor.',
      rating: 5,
      featured: false
    }
  ]

  const testimonialsToShow = testimonials || defaultTestimonials

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  return (
    <section className="pb-2 lg:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonialsToShow.map((testimonial, index) => (
            <div 
              key={testimonial.id || index} 
              className={`bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${
                testimonial.featured ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''
              }`}
            >
              {/* Icono de comillas decorativo */}
              <div className="absolute -top-2 -right-2 w-16 h-16 text-primary-100 dark:text-primary-900/30">
                <Quote className="w-full h-full" />
              </div>

              {/* Badge de destacado */}
              {testimonial.featured && (
                <div className="absolute top-4 right-4 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Destacado
                </div>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 relative z-10">
                {renderStars(testimonial.rating)}
              </div>
              
              {/* Testimonial */}
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed relative z-10">
                "{testimonial.testimonial}"
              </blockquote>
              
              {/* Autor */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  {testimonial.featured && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Llamada a la acción */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-8 lg:p-12">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ¿Quieres formar parte de estas historias?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              Únete a nuestra comunidad y comparte tus talentos con la familia de la fe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                Crear mi tienda
              </button>
              <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium rounded-lg transition-all duration-200">
                Explorar servicios
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}