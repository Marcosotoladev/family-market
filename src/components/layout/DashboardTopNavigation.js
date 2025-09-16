// src/components/layout/DashboardTopNavigation.js

'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingBag, Wrench, Briefcase, BarChart3, User, ChevronDown, Store, ExternalLink, House } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardTopNavigation() {
  const { isAuthenticated, userData } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDropdown, setShowDropdown] = useState(false)

  // Solo mostrar en rutas del dashboard
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  
  // No mostrar si no está autenticado o no está en dashboard
  if (!isAuthenticated || !isDashboardRoute) {
    return null
  }

  const dashboardTabs = [
        {
      id: 'home',
      label: 'Inicio',
      icon: House,
      href: '/',
      color: 'blue'
    },
    {
      id: 'overview',
      label: 'Panel',
      icon: BarChart3,
      href: '/dashboard',
      color: 'purple'
    },

    {
      id: 'tienda',
      label: 'Tienda',
      icon: Store,
      href: '/dashboard/store',
      color: 'orange'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      href: '/dashboard/profile',
      color: 'green' // Cambiado de 'gray' a 'slate' para mejor visibilidad
    }
  ]

  // Detectar tab activo basado en la URL actual
  useEffect(() => {
    const currentTab = dashboardTabs.find(tab => {
      if (tab.href === '/dashboard') {
        return pathname === '/dashboard'
      }
      return pathname?.startsWith(tab.href)
    })
    
    if (currentTab) {
      setActiveTab(currentTab.id)
    }
  }, [pathname])

  const handleTabClick = (tab) => {
    setActiveTab(tab.id)
    router.push(tab.href)
    setShowDropdown(false)
  }

  const getColorClasses = (color, isActive = false) => {
    const colors = {
      blue: {
        active: 'text-blue-600 dark:text-blue-400 border-blue-500',
        inactive: 'text-gray-600 dark:text-gray-400 border-transparent hover:text-blue-600 dark:hover:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20'
      },
      green: {
        active: 'text-green-600 dark:text-green-400 border-green-500',
        inactive: 'text-gray-600 dark:text-gray-400 border-transparent hover:text-green-600 dark:hover:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20'
      },
      purple: {
        active: 'text-purple-600 dark:text-purple-400 border-purple-500',
        inactive: 'text-gray-600 dark:text-gray-400 border-transparent hover:text-purple-600 dark:hover:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20'
      },
      orange: {
        active: 'text-orange-600 dark:text-orange-400 border-orange-500',
        inactive: 'text-gray-600 dark:text-gray-400 border-transparent hover:text-orange-600 dark:hover:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20'
      },
      slate: {
        active: 'text-slate-600 dark:text-slate-300 border-slate-500',
        inactive: 'text-gray-600 dark:text-gray-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300',
        bg: 'bg-slate-50 dark:bg-slate-800/50'
      }
    }
    
    return isActive ? colors[color].active : colors[color].inactive
  }

  const activeTabData = dashboardTabs.find(tab => tab.id === activeTab)
  const storeUrl = userData?.storeSlug ? userData.storeSlug : null

  return (
    <>
      {/* DESKTOP: Tabs horizontales */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {dashboardTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`
                      flex items-center space-x-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer
                      ${getColorClasses(tab.color, isActive)}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
            
            {/* Botón Ver Tienda - Desktop */}
            {storeUrl && (
              <div className="flex-shrink-0 ml-6">
                <a
                  href={`https://familymarket.vercel.app/tienda/${storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                >
                  <Store className="w-4 h-4 mr-1" />
                  <span>Ver tienda</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE: Dropdown selector */}
      <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex-1 relative">
              {/* Botón dropdown */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${showDropdown 
                    ? `border-${activeTabData?.color}-500 ${getColorClasses(activeTabData?.color || 'blue', true).split(' ')[0]} bg-${activeTabData?.color === 'slate' ? 'slate' : activeTabData?.color}-50 dark:bg-${activeTabData?.color === 'slate' ? 'slate' : activeTabData?.color}-${activeTabData?.color === 'slate' ? '800/50' : '900/20'}` 
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {activeTabData && (
                    <>
                      <activeTabData.icon className="w-5 h-5" />
                      <span className="font-medium">{activeTabData.label}</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                  {dashboardTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`
                          w-full flex items-center space-x-3 p-4 text-left transition-colors duration-200 cursor-pointer
                          ${isActive 
                            ? `${getColorClasses(tab.color, true).split(' ')[0]} bg-${tab.color}-50 dark:bg-${tab.color}-900/20` 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                        {isActive && (
                          <div className={`ml-auto w-2 h-2 rounded-full bg-${tab.color}-500`} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Botón Ver Tienda - Mobile */}
            {storeUrl && (
              <div className="flex-shrink-0">
                <a
                  href={`https://familymarket.vercel.app/tienda/${storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <Store className="w-4 h-4 mr-1" />
                  <span>Ver</span>
                </a>
              </div>
            )}
          </div>

          {/* Overlay para cerrar dropdown */}
          {showDropdown && (
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Estilos para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}