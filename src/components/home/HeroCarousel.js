// src/components/home/HeroCarousel.js
'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react'

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Mock data - más adelante vendrá de Cloudinary
  const slides = [
    {
      id: 1,
      title: 'Retiro Espiritual de Jóvenes',
      description: 'Únete a nosotros en un fin de semana de crecimiento espiritual',
      date: '15-17 Nov 2024',
      location: 'Villa Carlos Paz',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 2,
      title: 'Feria de Emprendedores TTL',
      description: 'Muestra tu negocio y conecta con la comunidad',
      date: '25 Nov 2024',
      location: 'Salón Principal TTL',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 3,
      title: 'Noche de Adoración',
      description: 'Una noche especial de alabanza y adoración',
      date: '2 Dic 2024',
      location: 'Iglesia TTL',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 4,
      title: 'Campaña Solidaria',
      description: 'Juntamos alimentos para familias necesitadas',
      date: '10-20 Dic 2024',
      location: 'Toda la ciudad',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop',
      color: 'from-green-500 to-teal-500'
    }
  ]

  // Auto-play del carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Reactivar auto-play después de 10s
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden bg-gray-900 dark:bg-gray-950 rounded-xl lg:rounded-2xl mx-4 lg:mx-0">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`
              absolute inset-0 transition-all duration-700 ease-in-out
              ${index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-110'
              }
            `}
          >
            {/* Imagen de fondo */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Overlay gradiente */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-80`} />
            
            {/* Contenido */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-white">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-6 opacity-90">
                    {slide.description}
                  </p>
                  
                  {/* Información del evento */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <Calendar className="w-4 h-4" />
                      <span>{slide.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <MapPin className="w-4 h-4" />
                      <span>{slide.location}</span>
                    </div>
                  </div>
                  
                  <button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                    Más información
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }
            `}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Indicador de auto-play */}
      <div className="absolute top-4 right-4">
        <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`} />
      </div>
    </section>
  )
}