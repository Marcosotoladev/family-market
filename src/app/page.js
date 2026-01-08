
'use client'
import { useRouter } from 'next/navigation'
import HeroCarousel from '@/components/home/HeroCarousel'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FeaturedServices from '@/components/home/FeaturedServices'
import FeaturedJobs from '@/components/home/FeaturedJobs'
import RecentItems from '@/components/home/RecentItems'
import CategoriesSection from '@/components/home/CategoriesSection'
import Testimonials from '@/components/home/Testimonials'

import NotificationManager from '@/components/ui/NotificationManager'
import ActivateStoreButton from '@/components/tienda/ActivateStoreButton'

export default function HomePage() {
  const router = useRouter()

  const handleCategoryClick = (category) => {
    // Si se hizo clic en "Ver todas", category es un objeto con { showAll: true, type: '...' }
    if (category.showAll) {
      if (category.type === 'productos') router.push('/productos')
      else if (category.type === 'servicios') router.push('/servicios')
      else if (category.type === 'empleos') router.push('/empleos')
      return
    }

    // Navegar según el tipo de categoría
    const type = category.type
    const id = category.id

    if (type === 'productos') {
      router.push(`/productos?categoria=${id}`)
    } else if (type === 'servicios') {
      router.push(`/servicios?categoria=${id}`)
    } else if (type === 'empleos') {
      router.push(`/empleos?categoria=${id}`)
    }
  }

  return (
    <>
      {/* Hero Carousel - Eventos de la iglesia */}
      <section className="px-4 sm:px-6 lg:px-8 pt-2 pb-4 lg:pt-2 lg:pb-4">
        <HeroCarousel />
      </section>

      {/* Activa tu Tienda */}
      <section className="pb-2 lg:pb-4">
        <ActivateStoreButton />
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
        <CategoriesSection onCategoryClick={handleCategoryClick} />
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