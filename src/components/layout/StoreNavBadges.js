// src/components/layout/StoreNavBadges.js
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Briefcase, 
  Users, 
  ImageIcon, 
  MessageSquare 
} from 'lucide-react';

const StoreNavBadges = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Productos',
      href: '/dashboard/tienda/productos',
      icon: Package,
      color: 'blue'
    },
    {
      name: 'Servicios',
      href: '/dashboard/tienda/servicios',
      icon: Briefcase,
      color: 'green'
    },
    {
      name: 'Empleos',
      href: '/dashboard/tienda/empleos',
      icon: Users,
      color: 'purple'
    },
    {
      name: 'Galería',
      href: '/dashboard/tienda/galeria',
      icon: ImageIcon,
      color: 'orange'
    },
    {
      name: 'Testimonios',
      href: '/dashboard/tienda/testimonios',
      icon: MessageSquare,
      color: 'pink'
    }
  ];

  const getColorClasses = (color, isActive) => {
    const colorMap = {
      blue: {
        active: 'bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50',
        inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40'
      },
      green: {
        active: 'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/50',
        inactive: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40'
      },
      purple: {
        active: 'bg-purple-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/50',
        inactive: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40'
      },
      orange: {
        active: 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50',
        inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40'
      },
      pink: {
        active: 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/50',
        inactive: 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/40'
      }
    };
    
    return isActive ? colorMap[color].active : colorMap[color].inactive;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Horizontal scroll */}
        <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2 md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex-shrink-0 flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105
                  ${getColorClasses(item.color, isActive)}
                `}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Desktop: Centered badges */}
        <div className="hidden md:flex justify-center py-4 gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5
                  ${getColorClasses(item.color, isActive)}
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Tablet: Grid layout for better space usage */}
        <div className="hidden sm:grid md:hidden grid-cols-3 gap-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105
                  ${getColorClasses(item.color, isActive)}
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoreNavBadges;