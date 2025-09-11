// src/components/layout/DashboardTopNavigation.js

'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingBag, Wrench, Briefcase, BarChart3, User, ChevronDown } from 'lucide-react'
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
      id: 'overview',
      label: 'Panel',
      icon: BarChart3,
      href: '/dashboard',
      color: 'blue'
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: ShoppingBag,
      href: '/dashboard/productos',
      color: 'blue'
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: Wrench,
      href: '/dashboard/servicios',
      color: 'green'
    },
    {
      id: 'empleos',
      label: 'Empleos',
      icon: Briefcase,
      href: '/dashboard/empleos',
      color: 'purple'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      href: '/dashboard/perfil',
      color: 'gray'
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
      gray: {
        active: 'text-gray-700 dark:text-gray-300 border-gray-500',
        inactive: 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300',
        bg: 'bg-gray-50 dark:bg-gray-800'
      }
    }
    
    return isActive ? colors[color].active : colors[color].inactive
  }

  const activeTabData = dashboardTabs.find(tab => tab.id === activeTab)

  return (
    <>
      {/* DESKTOP: Tabs horizontales */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {dashboardTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`
                    flex items-center space-x-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200
                    ${getColorClasses(tab.color, isActive)}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* MOBILE: Dropdown selector */}
      <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="relative">
            {/* Botón dropdown */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200
                ${showDropdown 
                  ? `border-${activeTabData?.color}-500 ${getColorClasses(activeTabData?.color || 'blue', true).split(' ')[0]} bg-${activeTabData?.color}-50 dark:bg-${activeTabData?.color}-900/20` 
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                {dashboardTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`
                        w-full flex items-center space-x-3 p-4 text-left transition-colors duration-200
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
        </div>

        {/* Overlay para cerrar dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowDropdown(false)}
          />
        )}
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