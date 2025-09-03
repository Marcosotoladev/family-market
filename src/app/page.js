// src/app/page.js
import MainLayout from '@/components/layout/MainLayout'
import HeroCarousel from '@/components/home/HeroCarousel'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import NewestProducts from '@/components/home/NewestProducts'

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Carousel - Eventos de la iglesia */}
      <section className="pt-8 pb-12 lg:pt-12 lg:pb-16">
        <HeroCarousel />
      </section>

      {/* Productos Destacados */}
      <section className="py-12 lg:py-16">
        <FeaturedProducts />
      </section>

      {/* Productos Más Nuevos */}
      <section className="py-12 lg:py-16">
        <NewestProducts />
      </section>

      {/* Sección de Categorías Populares */}
      <section className="py-16 lg:py-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-16 lg:py-20 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Explora por Categorías
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Descubre lo que tu comunidad tiene para ofrecer
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
              {[
                { name: 'Repostería', icon: '🧁', count: 45, color: 'from-pink-400 to-red-400' },
                { name: 'Artesanías', icon: '🎨', count: 32, color: 'from-purple-400 to-indigo-400' },
                { name: 'Servicios', icon: '🛠️', count: 28, color: 'from-blue-400 to-cyan-400' },
                { name: 'Alimentos', icon: '🍞', count: 38, color: 'from-green-400 to-teal-400' },
                { name: 'Educación', icon: '📚', count: 15, color: 'from-yellow-400 to-orange-400' },
                { name: 'Empleos', icon: '💼', count: 22, color: 'from-gray-400 to-gray-600' }
              ].map((category) => (
                <div 
                  key={category.name}
                  className="group bg-white dark:bg-gray-700 p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center hover:-translate-y-1 border border-gray-100 dark:border-gray-600"
                >
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center text-xl lg:text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 group-hover:text-primary-600 transition-colors text-sm lg:text-base">
                    {category.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                    {category.count} productos
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="py-16 lg:py-20">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Lo que dice nuestra comunidad
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Historias reales de hermanos que han encontrado bendición a través de Family Market
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              name: 'María González',
              role: 'Repostera',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616c04c1a01?w=64&h=64&fit=crop&crop=face',
              testimonial: 'Gracias a Family Market pude expandir mi negocio de tortas. La comunidad TTL me apoyó desde el primer día.',
              rating: 5
            },
            {
              name: 'Carlos Mendoza',
              role: 'Desarrollador',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
              testimonial: 'Encontré mi primer cliente para servicios web aquí. Es hermoso ver cómo Dios bendice cuando servimos a nuestros hermanos.',
              rating: 5
            },
            {
              name: 'Ana Rodríguez',
              role: 'Compradora frecuente',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
              testimonial: 'Siempre encuentro productos únicos y de calidad. Además, cada compra fortalece nuestra comunidad de fe.',
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "{testimonial.testimonial}"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final - Full width */}
      <section className="py-16 lg:py-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="bg-gradient-to-r from-primary-500 to-orange-500 px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Únete a nuestra comunidad y comparte tus dones con la familia de la fe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-10 rounded-lg transition-all duration-200 transform hover:scale-105">
                Crear mi tienda
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-10 rounded-lg transition-all duration-200">
                Explorar productos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer con versículo */}
      <footer className="py-16 lg:py-20 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="bg-gray-900 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-white transition-colors">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-lg lg:text-xl italic mb-6 text-gray-200 dark:text-gray-300">
              "Así que, según tengamos oportunidad, hagamos bien a todos, 
              y mayormente a los de la familia de la fe."
            </blockquote>
            <cite className="text-primary-400 font-medium">
              Gálatas 6:10
            </cite>
            
            <div className="mt-12 pt-8 border-t border-gray-700 dark:border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    Family <span className="text-primary-400">Market</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
                  <a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Términos</a>
                  <a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Ayuda</a>
                  <a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Contacto</a>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-600">
                © 2024 Family Market - Iglesia Toma Tu Lugar
              </div>
            </div>
          </div>
        </div>
      </footer>
    </MainLayout>
  )
}