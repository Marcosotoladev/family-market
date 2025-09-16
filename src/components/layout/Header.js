// src/components/layout/Header.js
'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Search, User, Moon, Sun, Plus, HelpCircle, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, userData, loading, signOut } = useAuth()

  const router = useRouter()

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false)
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Buscando:', searchQuery)
    }
  }

  const handleCreateStore = () => {
    router.push('/register')
  }

  const handleNewUser = () => {
    router.push('/register')
  }

  // Función inteligente para el botón de usuario
  const handleUserAction = () => {
    if (loading) return

    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu)
    } else {
      router.push('/login')
    }
  }

  // Función para manejar logout
  const handleLogout = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Función para ir al dashboard
  const handleDashboard = () => {
    setShowUserMenu(false)
    router.push('/dashboard')
  }

  // Función para obtener el texto del botón de usuario
  const getUserButtonText = () => {
    if (loading) return 'Cargando...'
    if (isAuthenticated) {
      return userData?.firstName ? `Hola, ${userData.firstName}` : 'Mi cuenta'
    }
    return 'Mi cuenta'
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Header Mobile */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Botón Dark/Light Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cambiar modo"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-primary-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-primary-500" />
              )}
            </button>

            {/* Logo Mobile con enlace */}
            <Link href="/about" className="flex-1 flex items-center justify-center gap-3 group">
              <Image
                src="/icon.png"
                alt="Family Market Logo"
                width={32}
                height={32}
                className="w-8 h-8 transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <h1 className="text-2xl font-bold transition-colors duration-200">
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">Family</span>{' '}
                <span className="text-primary-500 group-hover:text-primary-600">Market</span>
              </h1>
            </Link>

            {/* Botón Usuario con menú dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUserAction()
                }}
                disabled={loading}
                className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative ${
                  isAuthenticated ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={getUserButtonText()}
              >
                <User className={`w-5 h-5 ${
                  isAuthenticated 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
                {isAuthenticated && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </button>

              {/* Dropdown menú para usuarios autenticados */}
              {isAuthenticated && showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userData?.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDashboard}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Mi cuenta
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CTAs móviles integrados - Solo para usuarios no autenticados */}
          {!isAuthenticated && !loading && (
            <div className="flex items-center justify-between mb-4 px-1">
              <button
                onClick={handleNewUser}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                ¿Eres nuevo?
              </button>

              <button
                onClick={handleCreateStore}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Crear tienda
              </button>
            </div>
          )}

          {/* Barra de búsqueda móvil más prominente */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué estás buscando?"
              className="w-full h-12 pl-12 pr-16 bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-gray-900 dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-8">
            {/* Logo Desktop con enlace */}
            <Link href="/about" className="flex items-center flex-shrink-0 gap-4 group">
              <Image
                src="/icon.png"
                alt="Family Market Logo"
                width={40}
                height={40}
                className="w-15 h-15 transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <h1 className="text-3xl xl:text-4xl font-bold transition-colors duration-200">
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">Family</span>{' '}
                <span className="text-primary-500 group-hover:text-primary-600">Market</span>
              </h1>
            </Link>

            {/* Barra de búsqueda desktop mejorada */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, servicios o empleos..."
                  className="w-full h-14 pl-14 pr-32 border border-gray-200 dark:border-gray-700 rounded-2xl text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm"
                >
                  Buscar
                </button>
              </form>
            </div>

            {/* Acciones Desktop mejoradas */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Dark Mode Toggle mejorado */}
              <button
                onClick={toggleDarkMode}
                className="p-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                aria-label="Cambiar modo"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500 transition-all duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500 transition-all duration-300" />
                )}
              </button>

              {/* Botón Usuario con menú dropdown Desktop */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUserAction()
                  }}
                  disabled={loading}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative ${
                    isAuthenticated ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <User className={`w-5 h-5 ${
                    isAuthenticated 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isAuthenticated 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {getUserButtonText()}
                  </span>
                  {isAuthenticated && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  )}
                </button>

                {/* Dropdown menú para usuarios autenticados Desktop */}
                {isAuthenticated && showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userData?.email}
                      </p>
                      {userData?.businessName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {userData.businessName}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleDashboard}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      Mi cuenta
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}