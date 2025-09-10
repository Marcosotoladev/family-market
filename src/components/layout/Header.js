// src/components/layout/Header.js
'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Search, User, Moon, Sun, Plus, HelpCircle, Link } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, setTheme } = useTheme()

  const router = useRouter()

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleDashboard = () => {
    router.push('/dashboard')
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

            {/* Logo Mobile */}
            <div className="flex-1 flex items-center justify-center gap-3">
              <Image
                src="/icon.png"
                alt="Family Market Logo"
                width={32}
                height={32}
                className="w-8 h-8"
                priority
              />
              <h1 className="text-2xl font-bold">
                <span className="text-gray-600 dark:text-gray-400">Family</span>{' '}
                <span className="text-primary-500">Market</span>
              </h1>
            </div>

            {/* Botón Usuario - CORREGIDO */}
            <button
              onClick={handleDashboard}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Mi cuenta"
            >
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* CTAs móviles integrados */}
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
            {/* Logo Desktop más prominente */}
            <div className="flex items-center flex-shrink-0 gap-4">
              <Image
                src="/icon.png"
                alt="Family Market Logo"
                width={40}
                height={40}
                className="w-15 h-15"
                priority
              />
              <h1 className="text-3xl xl:text-4xl font-bold">
                <span className="text-gray-600 dark:text-gray-400">Family</span>{' '}
                <span className="text-primary-500">Market</span>
              </h1>
            </div>

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

              {/* Usuario mejorado - CORREGIDO */}
              <button 
                onClick={handleDashboard}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mi cuenta</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
