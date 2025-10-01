// src/components/home/HeroCarousel.js
'use client'
import { useState, useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Mock data - más adelante vendrá de Cloudinary
  const slides = [

        {
      id: 2,
      title: '',
      description: '',
      date: '',
      location: '',
      image: 'https://tomatulugar.com/wp-content/uploads/2024/10/conf-25-events.jpg',
      color: ''
    },
        {
      id: 5,
      title: '',
      description: '',
      date: '',
      location: '',
      image: 'https://tomatulugar.com/wp-content/uploads/2025/08/VivirElEvangelio.jpg',
      color: ''
    },


    {
      id: 1,
      title: 'Casa de Oración TTL',
      description: 'Únete a nosotros en un evento ecepcional',
      date: 'Miércoles y Viernes 20hs',
      location: 'TTL Iglesia',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
      color: 'from-blue-600 to-purple-600'
    },


    {
      id: 3,
      title: 'Experiencia TTL',
      description: 'Una experiencia especial de alabanza y adoración y semilla',
      date: '1º y 3º Sábados 16hs y 19hs',
      location: 'TTL Iglesia',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 4,
      title: 'Campaña Solidaria',
      description: 'Juntamos alimentos para familias necesitadas',
      date: 'A Amar Que Hace Falta',
      location: 'TTL Iglesia',
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

  return (
    <section className="relative w-full h-40 sm:h-44 md:h-52 lg:h-60 xl:h-72 overflow-hidden bg-gray-900 dark:bg-gray-950 rounded-lg sm:rounded-xl lg:rounded-2xl">
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
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-40`} />

            {/* Contenido */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 lg:px-8 w-full">
                <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl text-white">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6 opacity-90 leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Información del evento */}
                  <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{slide.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{slide.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 touch-manipulation
              ${index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75 active:bg-opacity-90'
              }
            `}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Indicador de auto-play */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`} />
      </div>
    </section>
  )
}