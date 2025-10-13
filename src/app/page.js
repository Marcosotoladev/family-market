// src/app/page.js
import HeroCarousel from '@/components/home/HeroCarousel'
import WhatsNew from '@/components/home/WhatsNew'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FeaturedServices from '@/components/home/FeaturedServices'
import FeaturedJobs from '@/components/home/FeaturedJobs'
import RecentItems from '@/components/home/RecentItems'
import CategoriesSection from '@/components/home/CategoriesSection'
import Testimonials from '@/components/home/Testimonials'

import NotificationManager from '@/components/ui/NotificationManager'

export default function HomePage() {
  return (
    <>
      {/* Hero Carousel - Eventos de la iglesia */}
      <section className="px-4 sm:px-6 lg:px-8 pt-2 pb-4 lg:pt-2 lg:pb-4">
        <HeroCarousel />
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

      {/* Recién Publicado - Últimas 36 horas */}
      <section className="pb-2 lg:pb-4">
        <RecentItems />
      </section>
      

      {/* Sección de Categorías Populares */}
      <section className="px-4 sm:px-6 lg:px-8 pt-2 pb-4 lg:pt-2 lg:pb-4">
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