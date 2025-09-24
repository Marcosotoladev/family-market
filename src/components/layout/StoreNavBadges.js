// src/components/layout/StoreNavBadges.js
'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Briefcase, 
  Users, 
  ImageIcon, 
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const StoreNavBadges = () => {
  const pathname = usePathname();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const navItems = [
    {
      name: 'Productos',
      href: '/dashboard/tienda/productos',
      icon: Package,
      color: 'blue',
      description: 'Gestiona tu catálogo'
    },
    {
      name: 'Servicios',
      href: '/dashboard/tienda/servicios',
      icon: Briefcase,
      color: 'green',
      description: 'Administra servicios'
    },
    {
      name: 'Empleos',
      href: '/dashboard/tienda/empleos',
      icon: Users,
      color: 'purple',
      description: 'Publicar ofertas'
    },
    {
      name: 'Galería',
      href: '/dashboard/tienda/galeria',
      icon: ImageIcon,
      color: 'orange',
      description: 'Fotos y videos'
    },
    {
      name: 'Testimonios',
      href: '/dashboard/tienda/testimonios',
      icon: MessageSquare,
      color: 'pink',
      description: 'Reseñas de clientes'
    }
  ];

  const getColorClasses = (color, isActive) => {
    const colorMap = {
      blue: {
        active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 border-2 border-blue-300',
        inactive: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/30 dark:text-blue-300 dark:hover:from-blue-900/40 dark:hover:to-blue-800/50 border-2 border-blue-200 hover:border-blue-300 dark:border-blue-700'
      },
      green: {
        active: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/50 border-2 border-green-300',
        inactive: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 dark:from-green-900/20 dark:to-green-800/30 dark:text-green-300 dark:hover:from-green-900/40 dark:hover:to-green-800/50 border-2 border-green-200 hover:border-green-300 dark:border-green-700'
      },
      purple: {
        active: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/50 border-2 border-purple-300',
        inactive: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 dark:from-purple-900/20 dark:to-purple-800/30 dark:text-purple-300 dark:hover:from-purple-900/40 dark:hover:to-purple-800/50 border-2 border-purple-200 hover:border-purple-300 dark:border-purple-700'
      },
      orange: {
        active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50 border-2 border-orange-300',
        inactive: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 hover:from-orange-100 hover:to-orange-200 dark:from-orange-900/20 dark:to-orange-800/30 dark:text-orange-300 dark:hover:from-orange-900/40 dark:hover:to-orange-800/50 border-2 border-orange-200 hover:border-orange-300 dark:border-orange-700'
      },
      pink: {
        active: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/50 border-2 border-pink-300',
        inactive: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 hover:from-pink-100 hover:to-pink-200 dark:from-pink-900/20 dark:to-pink-800/30 dark:text-pink-300 dark:hover:from-pink-900/40 dark:hover:to-pink-800/50 border-2 border-pink-200 hover:border-pink-300 dark:border-pink-700'
      }
    };
    
    return isActive ? colorMap[color].active : colorMap[color].inactive;
  };

  // Función para verificar si se puede hacer scroll
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Funciones para navegar
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile: Horizontal scroll con indicadores y navegación */}
        <div className="relative md:hidden">
          {/* Botón scroll izquierda */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Botón scroll derecha */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Container scrolleable */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide py-3 gap-2 px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[95px] text-center font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer
                    ${getColorClasses(item.color, isActive)}
                  `}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-semibold whitespace-nowrap">{item.name}</span>
                  <span className={`text-xs mt-0.5 opacity-75 whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Indicadores de puntos */}
          <div className="flex justify-center mt-2 pb-3 gap-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <div
                  key={item.name}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary-500 w-6' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Desktop: Badges más compactos centrados */}
        <div className="hidden md:flex justify-center py-4 gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex flex-col items-center p-4 rounded-xl min-w-[110px] text-center font-medium transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 cursor-pointer
                  ${getColorClasses(item.color, isActive)}
                `}
              >
                <Icon className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold mb-1">{item.name}</span>
                <span className={`text-xs opacity-75 ${isActive ? 'font-medium' : ''}`}>
                  {item.description}
                </span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-white rounded-full mt-1.5 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Tablet: Grid más compacto */}
        <div className="hidden sm:grid md:hidden grid-cols-2 gap-3 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center p-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer
                  ${getColorClasses(item.color, isActive)}
                `}
              >
                <Icon className={`w-5 h-5 mr-2.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{item.name}</span>
                  <span className={`text-xs opacity-75 ${isActive ? 'font-medium' : ''}`}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoreNavBadges;