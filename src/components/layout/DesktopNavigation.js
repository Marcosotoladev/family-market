// src/components/layout/DesktopNavigation.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  ChevronDown, ChevronRight, Package, Briefcase, Store, Heart,
  Grid3X3, House, User, Settings, MessageSquare, Users,
  ShoppingBag, Star, LogOut, LayoutDashboard
} from 'lucide-react'
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_SERVICIOS, CATEGORIAS_EMPLEO } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DesktopNavigation() {
  // TODOS LOS HOOKS PRIMERO - SIEMPRE EN EL MISMO ORDEN
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, loading, user, userData, signOut } = useAuth()
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [showSubcategories, setShowSubcategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef(null)
  const userMenuRef = useRef(null)

  // useEffect para cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
        setActiveCategory(null)
        setShowSubcategories(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
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
      id: 'home',
      label: 'Inicio',
      icon: House,
      href: '/',
      hasDropdown: false,
      categories: getProductCategories()
    },
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

  // Opciones del menú de usuario
  const userMenuItems = [
    {
      section: 'Dashboard',
      items: [
        {
          id: 'dashboard',
          label: 'Mi Cuenta',
          icon: LayoutDashboard,
          href: '/dashboard',
          description: 'Vista general'
        }
      ]
    },
    {
      section: 'Personal',
      items: [
        {
          id: 'profile',
          label: 'Perfil',
          icon: User,
          href: '/dashboard/profile',
          description: 'Información personal'
        },
        {
          id: 'favorites',
          label: 'Favoritos',
          icon: Heart,
          href: '/dashboard/favorites',
          description: 'Tus productos guardados'
        },
        {
          id: 'reviews',
          label: 'Reseñas',
          icon: Star,
          href: '/dashboard/reviews',
          description: 'Tus comentarios'
        }
      ]
    },
    {
      section: 'Tienda',
      items: [
        {
          id: 'store',
          label: 'Mi Tienda',
          icon: Store,
          href: '/dashboard/store',
          description: 'Gestiona tu negocio'
        },
        {
          id: 'products',
          label: 'Productos',
          icon: ShoppingBag,
          href: '/dashboard/store/products',
          description: 'Administrar productos'
        }
      ]
    }
  ]

  // Opciones adicionales para admin
  const adminMenuItems = {
    section: 'Administración',
    items: [
      {
        id: 'users',
        label: 'Usuarios',
        icon: Users,
        href: '/dashboard/users',
        description: 'Gestionar usuarios'
      },
      {
        id: 'messaging',
        label: 'Mensajería',
        icon: MessageSquare,
        href: '/dashboard/messaging',
        description: 'Notificaciones masivas'
      }
    ]
  }

  // Si es admin, agregar opciones de admin
  const finalUserMenuItems = userData?.role === 'admin'
    ? [...userMenuItems, adminMenuItems]
    : userMenuItems

  // Manejar logout
  const handleLogout = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }


  // Manejar click en items del nav
  const handleNavClick = (itemId) => {
    const item = navItems.find(item => item.id === itemId)

    if (item?.hasDropdown) {
      setActiveDropdown(activeDropdown === itemId ? null : itemId)
      setActiveCategory(null)
      setShowSubcategories(false)
    } else {
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
    return subcategoriaKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
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

          {/* CTA Desktop */}
          <div className="flex items-center gap-4">
            {!isAuthenticated && !loading && (
              <>
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
              </>
            )}

            {isAuthenticated && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {userData?.firstName || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userData?.role === 'admin' ? 'Administrador' : 'Mi cuenta'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Header del menú */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {userData?.firstName} {userData?.lastName}
                          </p>
                          <p className="text-xs text-white/80">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-2 max-h-96 overflow-y-auto">
                      {finalUserMenuItems.map((section, idx) => (
                        <div key={idx} className={idx > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}>
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {section.section}
                            </p>
                          </div>
                          {section.items.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                                  <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Footer con logout */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group rounded-lg"
                      >
                        <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Cerrar sesión
                          </p>
                          <p className="text-xs text-red-500 dark:text-red-500">
                            Salir de tu cuenta
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}