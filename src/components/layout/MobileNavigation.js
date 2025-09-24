// src/components/layout/MobileNavigation.js

'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Heart, Grid3X3, X, Package, Briefcase, ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_SERVICIOS, CATEGORIAS_EMPLEO } from '@/types'
import Link from 'next/link'

export default function MobileNavigation() {
  // TODOS LOS HOOKS PRIMERO - SIEMPRE EN EL MISMO ORDEN
  const { isAuthenticated, userData, signOut } = useAuth() // ← CORREGIDO: signOut en lugar de logout
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('home')
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedMainCategory, setSelectedMainCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showSubcategories, setShowSubcategories] = useState(false)

  // DESPUÉS DE LOS HOOKS, LAS CONDICIONES
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  if (isDashboardRoute) {
    return null
  }

  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      href: '/'
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: Grid3X3,
      href: '/categorias',
      hasModal: true
    },
    {
      id: 'user',
      label: isAuthenticated ? 'Cuenta' : 'Entrar',
      icon: User,
      href: isAuthenticated ? '/dashboard' : '/login',
      hasModal: isAuthenticated
    }
  ]

  const categoryGroups = [
    {
      title: 'Productos',
      categories: Object.values(CATEGORIAS_PRODUCTOS || {}),
      type: 'productos',
      icon: Package,
      description: 'Compra y vende productos'
    },
    {
      title: 'Servicios', 
      categories: Object.values(CATEGORIAS_SERVICIOS || {}),
      type: 'servicios',
      icon: Grid3X3,
      description: 'Encuentra servicios profesionales'
    },
    {
      title: 'Empleos',
      categories: Object.values(CATEGORIAS_EMPLEO || {}),
      type: 'empleos',
      icon: Briefcase,
      description: 'Busca oportunidades laborales'
    }
  ]

  const handleTabClick = (itemId) => {
    if (itemId === 'categories') {
      setShowCategoriesModal(true)
      setSelectedMainCategory(null)
      setSelectedCategory(null)
      setShowSubcategories(false)
      return
    }

    if (itemId === 'user' && isAuthenticated) {
      setShowUserModal(true)
      return
    }

    if (itemId === 'home') {
      router.push('/')
      setActiveTab(itemId)
      return
    }

    const item = navItems.find(nav => nav.id === itemId)
    if (item && item.href) {
      router.push(item.href)
    }
    setActiveTab(itemId)
  }

  const handleMainCategoryClick = (categoryGroup) => {
    setSelectedMainCategory(categoryGroup)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  const handleCategoryClick = (category) => {
    if (category.subcategorias && Object.keys(category.subcategorias).length > 0) {
      setSelectedCategory(category)
      setShowSubcategories(true)
    } else {
      // Navegar directamente si no tiene subcategorías
      handleNavigate(selectedMainCategory.type, category.id, null)
    }
  }

  const handleSubcategoryClick = (subcategoria) => {
    handleNavigate(selectedMainCategory.type, selectedCategory.id, subcategoria)
  }

  const handleNavigate = (type, categoryId, subcategoria) => {
    console.log('Navegando a:', { type, categoryId, subcategoria })
    setShowCategoriesModal(false)
    setSelectedMainCategory(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
    // Aquí irá la lógica de navegación
  }

  const handleBackToMain = () => {
    if (showSubcategories) {
      setShowSubcategories(false)
      setSelectedCategory(null)
    } else {
      setSelectedMainCategory(null)
    }
  }

  const handleCloseModal = () => {
    setShowCategoriesModal(false)
    setShowUserModal(false)
    setSelectedMainCategory(null)
    setSelectedCategory(null)
    setShowSubcategories(false)
  }

  // ← CORREGIDO: Usa signOut en lugar de logout
  const handleLogout = async () => {
    try {
      await signOut()
      setShowUserModal(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const getSubcategoryName = (subcategoriaKey) => {
    return subcategoriaKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const renderModalContent = () => {
    if (showSubcategories && selectedCategory) {
      // Vista de subcategorías
      return (
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(selectedCategory.subcategorias).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSubcategoryClick(value)}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left w-full group cursor-pointer"
            >
              <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0 group-hover:bg-primary-600"></div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-primary-700 dark:group-hover:text-primary-400">
                  {getSubcategoryName(key)}
                </h4>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
            </button>
          ))}
        </div>
      )
    }

    if (selectedMainCategory) {
      // Vista de categorías dentro de un grupo principal
      return (
        <div className="grid grid-cols-1 gap-3">
          {/* Opción "Ver todos" para el grupo principal */}
          <button
            onClick={() => handleNavigate(selectedMainCategory.type, null, null)}
            className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-all duration-200 text-left w-full group mb-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <selectedMainCategory.icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-primary-700 dark:text-primary-300 text-base leading-tight">
                Ver todos los {selectedMainCategory.title}
              </h4>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                Explorar todas las categorías
              </p>
            </div>
          </button>

          {selectedMainCategory.categories.map((category) => {
            const hasSubcategories = category.subcategorias && Object.keys(category.subcategorias).length > 0
            const subcategoriesCount = hasSubcategories ? Object.keys(category.subcategorias).length : 0
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left w-full group cursor-pointer"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50">
                  <selectedMainCategory.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-primary-700 dark:group-hover:text-primary-400">
                    {category.nombre}
                  </h4>
                  {hasSubcategories && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {subcategoriesCount} subcategorías
                    </p>
                  )}
                </div>
                {hasSubcategories && (
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                )}
              </button>
            )
          })}
        </div>
      )
    }

    // Vista principal - grupos de categorías principales
    return (
      <div className="space-y-4">
        {categoryGroups.map((group) => {
          const IconComponent = group.icon
          
          return (
            <button
              key={group.type}
              onClick={() => handleMainCategoryClick(group)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50">
                <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                  {group.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {group.description}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  {group.categories.length} categorías
                </p>
              </div>

              <div className="flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const renderUserModalContent = () => {
    return (
      <div className="space-y-3">
        {/* Información del usuario */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-primary-700 dark:text-primary-300 text-sm leading-tight">
              {userData?.firstName} {userData?.lastName}
            </h4>
            <p className="text-xs text-primary-600 dark:text-primary-400 truncate">
              {userData?.email}
            </p>
          </div>
        </div>

        {/* Opciones */}
        <Link
          href="/dashboard"
          onClick={() => setShowUserModal(false)}
          className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left w-full group cursor-pointer"
        >
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-primary-700 dark:group-hover:text-primary-400">
              Mi Cuenta
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Gestiona tu perfil y tienda
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-left w-full group cursor-pointer"
        >
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-800/50">
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-red-700 dark:group-hover:text-red-400">
              Cerrar Sesión
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Salir de tu cuenta
            </p>
          </div>
        </button>
      </div>
    )
  }

  const getModalTitle = () => {
    if (showUserModal) {
      return 'Mi Cuenta'
    }
    if (showSubcategories && selectedCategory) {
      return selectedCategory.nombre
    }
    if (selectedMainCategory) {
      return selectedMainCategory.title
    }
    return 'Categorías'
  }

  return (
    <>
      {/* Navegación móvil fija */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {activeTab !== 'categories' && activeTab !== 'user' && (
          <div className="absolute top-0 left-0 h-0.5 bg-primary-500 transition-all duration-300 ease-out"
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
                onClick={() => handleTabClick(item.id)}
                className={`
                  relative flex flex-col items-center justify-center py-2 px-4 rounded-xl min-w-0 flex-1
                  transition-all duration-200 ease-out cursor-pointer
                  ${isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                aria-label={item.label}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-900/20 transition-all duration-200" />
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

      {/* Modal de Categorías o Usuario */}
      {(showCategoriesModal || showUserModal) && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black bg-opacity-50" onClick={handleCloseModal}>
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {(selectedMainCategory || showSubcategories) && !showUserModal && (
                  <button
                    onClick={handleBackToMain}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getModalTitle()}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 pb-8">
              {showUserModal ? renderUserModalContent() : renderModalContent()}
            </div>

            {/* Safe area para dispositivos con notch */}
            <div className="h-safe-area-inset-bottom min-h-[16px]" />
          </div>
        </div>
      )}

      {/* Spacer para compensar la navegación fija */}
      <div className="lg:hidden h-20" />
    </>
  )
}