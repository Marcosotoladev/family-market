// src/components/layout/MobileDashboardNavigation.js

'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Store, User } from 'lucide-react'

export default function MobileDashboardNavigation() {
  // TODOS LOS HOOKS PRIMERO - SIEMPRE EN EL MISMO ORDEN
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('dashboard')

  // useEffect también debe estar con los hooks
  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('home')
    } else if (pathname?.startsWith('/dashboard/store')) {
      setActiveTab('store')
    } else if (pathname?.startsWith('/dashboard/profile')) {
      setActiveTab('profile')
    } else {
      // Para otras rutas de dashboard, no marcar ninguna como activa
      setActiveTab('')
    }
  }, [pathname])

  // DESPUÉS DE LOS HOOKS, LAS CONDICIONES
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  if (!isDashboardRoute) {
    return null
  }

  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      href: '/',
      color: 'blue'
    },
    {
      id: 'store',
      label: 'Tienda',
      icon: Store,
      href: '/dashboard/store',
      color: 'orange'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      href: '/dashboard/profile',
      color: 'slate'
    }
  ]

  const handleTabClick = (item) => {
    setActiveTab(item.id)
    router.push(item.href)
  }

  const getColorClasses = (color, isActive = false) => {
    const colors = {
      blue: {
        active: 'text-blue-600 dark:text-blue-400',
        inactive: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20'
      },
      orange: {
        active: 'text-orange-600 dark:text-orange-400',
        inactive: 'text-gray-500 dark:text-gray-400', 
        bg: 'bg-orange-50 dark:bg-orange-900/20'
      },
      slate: {
        active: 'text-slate-600 dark:text-slate-300',
        inactive: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-slate-50 dark:bg-slate-800/50'
      }
    }
    
    return isActive ? colors[color].active : colors[color].inactive
  }

  return (
    <>
      {/* Navegación móvil fija para dashboard */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {/* Indicador de tab activo */}
        {activeTab && (
          <div 
            className="absolute top-0 left-0 h-0.5 bg-primary-500 transition-all duration-300 ease-out"
            style={{
              width: `${100 / navItems.length}%`,
              transform: `translateX(${navItems.findIndex(item => item.id === activeTab) * 100}%)`,
            }}
          />
        )}

        <div className="flex items-center justify-around py-3 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`
                  relative flex flex-col items-center justify-center py-2 px-4 rounded-xl min-w-0 flex-1
                  transition-all duration-200 ease-out
                  ${getColorClasses(item.color, isActive)}
                `}
                aria-label={item.label}
              >
                {isActive && (
                  <div className={`
                    absolute inset-0 rounded-xl transition-all duration-200
                    ${item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      item.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                      'bg-slate-50 dark:bg-slate-800/50'
                    }
                  `} />
                )}

                <div className="relative mb-1 z-10">
                  <Icon className={`
                    w-6 h-6 transition-all duration-200
                    ${isActive ? 'scale-110' : 'hover:scale-105'}
                  `} />
                </div>

                <span className={`
                  text-xs font-medium transition-all duration-200 z-10 relative
                  ${isActive ? 'font-semibold' : ''}
                `}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Spacer para compensar la navegación fija */}
      <div className="lg:hidden h-20" />
    </>
  )
}