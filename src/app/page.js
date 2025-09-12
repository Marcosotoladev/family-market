// src/app/page.js
import HeroCarousel from '@/components/home/HeroCarousel'
import WhatsNew from '@/components/home/WhatsNew'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FeaturedServices from '@/components/home/FeaturedServices'
import FeaturedJobs from '@/components/home/FeaturedJobs'
import CategoriesSection from '@/components/home/CategoriesSection'
import Testimonials from '@/components/home/Testimonials'

import NotificationManager from '@/components/ui/NotificationManager'

export default function HomePage() {
  return (
    <>
      {/* Hero Carousel - Eventos de la iglesia */}
      <section className="pt-2 pb-4 lg:pt-2 lg:pb-4">
        <HeroCarousel />
      </section>

      {/* Sección de What's New */}
      <section className="pb-2 lg:pb-4">
        <WhatsNew />
      </section>

      {/* Productos Destacados */}
      <section className="pb-2 lg:pb-4">
        <FeaturedProducts />
      </section>

      {/* Servicios Destacados */}
      <section className="pb-2 lg:pb-4">
        <FeaturedServices />
      </section>

      {/* Empleos Destacados */}
      <section className="pb-2 lg:pb-4">
        <FeaturedJobs />
      </section>

      {/* Sección de Categorías Populares */}
      <section className="pb-2 lg:pb-4">
        <CategoriesSection />
      </section>

      {/* Sección de Testimonios */}
      <section className="pb-2 lg:pb-4">
        <Testimonials />
      </section>

      {/* Footer */}

      <NotificationManager />
      </>
  )
}