// src/components/layout/DesktopNavigation.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation' 
import { ChevronDown, ChevronRight, Package, Briefcase, Store, Heart, Grid3X3, House } from 'lucide-react'
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_SERVICIOS, CATEGORIAS_EMPLEO } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function DesktopNavigation() {
  // TODOS LOS HOOKS PRIMERO - SIEMPRE EN EL MISMO ORDEN
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [showSubcategories, setShowSubcategories] = useState(false)
  const dropdownRef = useRef(null)

  // useEffect también debe estar con los hooks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
        setActiveCategory(null)
        setShowSubcategories(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // DESPUÉS DE LOS HOOKS, LAS CONDICIONES
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  if (isDashboardRoute) {
    return null
  }

  // Transformar las categorías importadas al formato que necesita el componente
  const getProductCategories = () => {
    return Object.values(CATEGORIAS_PRODUCTOS).map(categoria => ({
      id: categoria.id,
      nombre: categoria.nombre,
      subcategorias: categoria.subcategorias,
      subcategoriasCount: Object.keys(categoria.subcategorias).length
    }))
  }

  const getServiceCategories = () => {
    return Object.values(CATEGORIAS_SERVICIOS).map(categoria => ({
      id: categoria.id,
      nombre: categoria.nombre,
      subcategorias: categoria.subcategorias || {},
      subcategoriasCount: Object.keys(categoria.subcategorias || {}).length
    }))
  }

  const getJobCategories = () => {
    return Object.values(CATEGORIAS_EMPLEO).map(categoria => ({
      id: categoria.id,
      nombre: categoria.nombre,
      subcategorias: categoria.subcategorias || {},
      subcategoriasCount: Object.keys(categoria.subcategorias || {}).length
    }))
  }

  const navItems = [

    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      href: '/productos',
      hasDropdown: true,
      categories: getProductCategories()
    },
    {
      id: 'services',
      label: 'Servicios',
      icon: Grid3X3,
      href: '/servicios',
      hasDropdown: true,
      categories: getServiceCategories()
    },
    {
      id: 'jobs',
      label: 'Empleos',
      icon: Briefcase,
      href: '/empleos',
      hasDropdown: true,
      categories: getJobCategories()
    },
    {
      id: 'stores',
      label: 'Tiendas',
      icon: Store,
      href: '/tiendas',
      hasDropdown: false
    }
  ]

  // Manejar click en items del nav
  const handleNavClick = (itemId) => {
    const item = navItems.find(item => item.id === itemId)
    
    if (item?.hasDropdown) {
      // Si ya está activo, lo cerramos; si no, lo abrimos
      setActiveDropdown(activeDropdown === itemId ? null : itemId)
      setActiveCategory(null)
      setShowSubcategories(false)
    } else {
      // Para items sin dropdown, navegar directamente
      console.log('Navegando a:', item.href)
      setActiveDropdown(null)
    }
  }

  // Manejar click en categorías
  const handleCategoryClick = (category, subcategoria = null, forceNavigate = false) => {
    if (subcategoria) {
      console.log('Navegando a:', { 
        type: category.type || 'productos',
        category: category.id, 
        subcategoria 
      })
      setActiveDropdown(null)
      setActiveCategory(null)
      setShowSubcategories(false)
      return
    }

    if (forceNavigate) {
      console.log('Navegando a:', { 
        type: category.type || 'productos',
        category: category.id
      })
      setActiveDropdown(null)
      setActiveCategory(null)
      setShowSubcategories(false)
      return
    }

    if (category.subcategoriasCount && category.subcategoriasCount > 0) {
      const isSameCategory = activeCategory?.id === category.id
      const isSubcategoriesOpen = showSubcategories

      if (isSameCategory && isSubcategoriesOpen) {
        setShowSubcategories(false)
        setActiveCategory(null)
      } else {
        setActiveCategory(category)
        setShowSubcategories(true)
      }
      return
    }

    console.log('Navegando a:', { 
      type: category.type || 'productos',
      category: category.id
    })
    setActiveDropdown(null)
    setActiveCategory(null)
    setShowSubcategories(false)
  }

  const getSubcategoryName = (subcategoriaKey) => {
    // Convertir snake_case a formato legible
    return subcategoriaKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <nav className="hidden lg:block w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors" ref={dropdownRef}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Navegación principal */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeDropdown === item.id
              
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      flex items-center gap-2 py-4 px-2 text-m font-medium transition-all duration-200 relative cursor-pointer
                      ${isActive 
                        ? 'text-primary-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown className={`
                        w-4 h-4 transition-transform duration-200
                        ${isActive ? 'rotate-180' : ''}
                      `} />
                    )}
                    
                    {/* Underline hover effect */}
                    <div className={`
                      absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 transition-all duration-300
                      ${isActive ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'}
                    `}></div>
                  </button>

                  {/* Dropdown principal */}
                  {item.hasDropdown && isActive && (
                    <div className="absolute top-full left-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mt-1 p-6 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                          {item.label}
                        </h3>
                        <button 
                          onClick={() => handleCategoryClick({ id: 'todos', nombre: `Todos los ${item.label}` }, null, true)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                        >
                          Ver todos
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {item.categories?.slice(0, 8).map((category) => (
                          <div key={category.id}>
                            <button
                              onClick={() => handleCategoryClick(category)}
                              className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                                  <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm group-hover:text-primary-700 dark:group-hover:text-primary-400">
                                    {category.nombre}
                                  </h4>
                                  {category.subcategoriasCount > 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {category.subcategoriasCount} subcategorías
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {category.subcategoriasCount > 0 && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        ))}
                        
                        {item.categories?.length > 8 && (
                          <button 
                            onClick={() => handleCategoryClick({ id: 'todas', nombre: 'Todas las categorías' }, null, true)}
                            className="w-full text-center py-3 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 cursor-pointer"
                          >
                            Ver todas las categorías ({item.categories.length})
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submenu de subcategorías */}
                  {isActive && showSubcategories && activeCategory && (
                    <div className="absolute top-full left-80 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mt-1 p-6 z-50 ml-2">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                          {activeCategory.nombre}
                        </h4>
                        <button 
                          onClick={() => handleCategoryClick(activeCategory, null, true)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                        >
                          Ver todos
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {Object.entries(activeCategory.subcategorias).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => handleCategoryClick(activeCategory, value)}
                            className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer"
                          >
                            <div className="w-2 h-2 bg-primary-400 rounded-full group-hover:bg-primary-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                              {getSubcategoryName(key)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA Desktop - SOLO para usuarios NO autenticados */}
          {!isAuthenticated && !loading && (
            <div className="flex items-center gap-4">
              <Link 
                href='/register'
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors font-medium"
              >
                ¿Eres nuevo?
              </Link>
              <Link 
                href='/register'
                className="border-2 border-primary-500 text-primary-500 hover:text-white bg-transparent hover:bg-primary-500 font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Crear tienda
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}