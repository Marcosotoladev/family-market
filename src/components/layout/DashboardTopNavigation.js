// src/components/layout/DashboardTopNavigation.js

'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { BarChart3, User, ChevronDown, Store, ExternalLink, House, Settings, Users, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardTopNavigation() {
  const { isAuthenticated, userData } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showConfigDropdown, setShowConfigDropdown] = useState(false)

  // Solo mostrar en rutas del dashboard
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  
  if (!isAuthenticated || !isDashboardRoute) {
    return null
  }

  const isAdmin = userData?.role === 'admin'
  const storeUrl = userData?.storeSlug

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname?.startsWith(href)
  }

  const isConfigActive = pathname?.startsWith('/dashboard/store') || pathname?.startsWith('/dashboard/profile')

  const navigateTo = (href) => {
    router.push(href)
    setShowMobileMenu(false)
    setShowConfigDropdown(false)
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
              
              {/* Inicio */}
              <button
                onClick={() => navigateTo('/')}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  isActive('/') && !isDashboardRoute
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <House className="w-5 h-5" />
                <span>Inicio</span>
              </button>

              {/* Panel */}
              <button
                onClick={() => navigateTo('/dashboard')}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  isActive('/dashboard') && pathname === '/dashboard'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-purple-600'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Panel</span>
              </button>

              {/* Admin tabs */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigateTo('/dashboard/users')}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      isActive('/dashboard/users')
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Usuarios</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/dashboard/messaging')}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      isActive('/dashboard/messaging')
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Mensajería</span>
                  </button>
                </>
              )}

              {/* Configurar con dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowConfigDropdown(!showConfigDropdown)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isConfigActive
                      ? 'border-gray-500 text-gray-700'
                      : 'border-transparent text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Configurar</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showConfigDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showConfigDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]">
                    <button
                      onClick={() => navigateTo('/dashboard/store')}
                      className={`w-full flex items-center space-x-3 p-3 text-left transition-colors ${
                        isActive('/dashboard/store')
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Tienda</span>
                    </button>
                    <button
                      onClick={() => navigateTo('/dashboard/profile')}
                      className={`w-full flex items-center space-x-3 p-3 text-left transition-colors ${
                        isActive('/dashboard/profile')
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Perfil</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ver Tienda */}
            {storeUrl && (
              <a
                href={`https://familymarket.vercel.app/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
              >
                <Store className="w-4 h-4 mr-1" />
                <span>Ver tienda</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex-1 flex items-center justify-between p-3 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">
                  {isConfigActive ? 'Configurar' : 
                   isActive('/dashboard/users') ? 'Usuarios' :
                   isActive('/dashboard/messaging') ? 'Mensajería' :
                   isActive('/dashboard') ? 'Panel' : 'Inicio'}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Ver Tienda */}
            {storeUrl && (
              <a
                href={`https://familymarket.vercel.app/tienda/${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 flex items-center px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
              >
                <Store className="w-4 h-4 mr-1" />
                <span>Ver</span>
              </a>
            )}
          </div>

          {/* Mobile dropdown */}
          {showMobileMenu && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              
              <button
                onClick={() => navigateTo('/')}
                className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <House className="w-5 h-5" />
                <span>Inicio</span>
              </button>

              <button
                onClick={() => navigateTo('/dashboard')}
                className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Panel</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => navigateTo('/dashboard/users')}
                    className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span>Usuarios</span>
                  </button>

                  <button
                    onClick={() => navigateTo('/dashboard/messaging')}
                    className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Mensajería</span>
                  </button>
                </>
              )}

              {/* Configurar section */}
              <div className="bg-gray-50">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Configurar
                </div>
                <button
                  onClick={() => navigateTo('/dashboard/store')}
                  className="w-full flex items-center space-x-3 p-4 pl-8 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>Tienda</span>
                </button>
                <button
                  onClick={() => navigateTo('/dashboard/profile')}
                  className="w-full flex items-center space-x-3 p-4 pl-8 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {(showMobileMenu || showConfigDropdown) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowMobileMenu(false)
            setShowConfigDropdown(false)
          }}
        />
      )}
    </>
  )
}