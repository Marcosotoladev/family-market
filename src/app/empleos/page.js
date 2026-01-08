//app/empleos/page.js
'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, Filter, Grid, List, Briefcase } from 'lucide-react'
import { CATEGORIAS_EMPLEO, TIPOS_EMPLEO } from '@/types/employment'
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import OfertaEmpleoCard from '@/components/tienda/empleos/OfertaEmpleoCard'
import BusquedaEmpleoCard from '@/components/tienda/empleos/BusquedaEmpleoCard'
import ServicioProfesionalCard from '@/components/tienda/empleos/ServicioProfesionalCard'

import { useSearchParams } from 'next/navigation'

function EmpleosContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('categoria')

  const [empleos, setEmpleos] = useState([])
  const [loading, setLoading] = useState(true)
  const [vistaGrid, setVistaGrid] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: categoryParam || '',
    tipoEmpleo: '',
    tipoPublicacion: 'todos',
    ordenar: 'recientes'
  })

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cargar empleos desde Firebase
  useEffect(() => {
    cargarEmpleos()
  }, [filtros.tipoPublicacion])

  const cargarEmpleos = async () => {
    try {
      setLoading(true)

      const empleosQuery = query(
        collection(db, 'empleos'),
        orderBy('fechaCreacion', 'desc'),
        limit(50)
      )

      const snapshot = await getDocs(empleosQuery)
      console.log('📊 Empleos encontrados:', snapshot.size)

      const empleosData = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log('🔍 Empleo:', doc.id, data)
        return {
          id: doc.id,
          ...data,
          tipoPublicacion: data.tipo || data.tipoPublicacion || 'oferta'
        }
      })

      // Filtrar por activo
      let empleosFiltrados = empleosData.filter(e =>
        e.activo === true ||
        e.estado === 'activo' ||
        !e.hasOwnProperty('activo')
      )

      // Filtrar por tipo de publicación
      if (filtros.tipoPublicacion !== 'todos') {
        empleosFiltrados = empleosFiltrados.filter(e => {
          const tipo = e.tipoPublicacion || e.tipo
          if (filtros.tipoPublicacion === 'ofertas') {
            return tipo === 'oferta' || tipo === 'oferta_empleo'
          }
          if (filtros.tipoPublicacion === 'busquedas') {
            return tipo === 'busqueda' || tipo === 'busqueda_empleo'
          }
          if (filtros.tipoPublicacion === 'profesionales') {
            return tipo === 'servicio_profesional'
          }
          return true
        })
      }

      console.log('✅ Empleos filtrados:', empleosFiltrados.length)
      setEmpleos(empleosFiltrados)
    } catch (error) {
      console.error('Error cargando empleos:', error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = (todosEmpleos) => {
    let resultado = [...todosEmpleos]

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(e =>
        (e.titulo && e.titulo.toLowerCase().includes(busquedaLower)) ||
        (e.puesto && e.puesto.toLowerCase().includes(busquedaLower)) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(busquedaLower)) ||
        (e.empresa && e.empresa.toLowerCase().includes(busquedaLower))
      )
    }

    if (filtros.categoria) {
      resultado = resultado.filter(e => e.categoria === filtros.categoria)
    }

    if (filtros.tipoEmpleo) {
      resultado = resultado.filter(e => e.tipoEmpleo === filtros.tipoEmpleo)
    }

    switch (filtros.ordenar) {
      case 'populares':
        resultado.sort((a, b) => (b.vistas || 0) - (a.vistas || 0))
        break
      case 'recientes':
      default:
        resultado.sort((a, b) => {
          const dateA = a.fechaCreacion?.toDate?.() || new Date(0)
          const dateB = b.fechaCreacion?.toDate?.() || new Date(0)
          return dateB - dateA
        })
        break
    }

    return resultado
  }

  const empleosFiltrados = aplicarFiltros(empleos)

  const renderEmpleoCard = (empleo) => {
    const baseProps = {
      storeData: null,
      showContactInfo: true,
      showStoreInfo: true,
      variant: vistaGrid ? (isMobile ? 'featured-compact' : 'grid') : 'grid',
      onClick: () => window.location.href = `/tienda/${empleo.tiendaInfo?.slug}/empleo/${empleo.id}`
    }

    const tipo = empleo.tipoPublicacion || empleo.tipo

    console.log('🎨 Renderizando card:', empleo.id, 'tipo:', tipo, 'variant:', baseProps.variant)

    if (tipo === 'busqueda' || tipo === 'busqueda_empleo') {
      return <BusquedaEmpleoCard key={empleo.id} {...baseProps} busqueda={empleo} />
    }

    if (tipo === 'servicio_profesional') {
      return <ServicioProfesionalCard key={empleo.id} {...baseProps} servicio={empleo} />
    }

    return <OfertaEmpleoCard key={empleo.id} {...baseProps} oferta={empleo} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleos, profesionales..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setVistaGrid(true)}
                  className={`p-2 ${vistaGrid ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setVistaGrid(false)}
                  className={`p-2 ${!vistaGrid ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {[
              { value: 'todos', label: 'Todos' },
              { value: 'ofertas', label: 'Ofertas' },
              { value: 'busquedas', label: 'Busco empleo' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFiltros({ ...filtros, tipoPublicacion: tab.value })}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filtros.tipoPublicacion === tab.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FiltersSidebar filtros={filtros} setFiltros={setFiltros} mostrar={mostrarFiltros} />

          <div className="flex-1">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400">
                {empleosFiltrados.length} publicaciones encontradas
              </p>

              <select
                value={filtros.ordenar}
                onChange={(e) => setFiltros({ ...filtros, ordenar: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="recientes">Más recientes</option>
                <option value="populares">Más populares</option>
              </select>
            </div>

            {loading ? (
              <LoadingSkeleton vistaGrid={vistaGrid} />
            ) : empleosFiltrados.length === 0 ? (
              <EmptyState />
            ) : (
              <div className={vistaGrid
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'flex flex-col gap-4'
              }>
                {empleosFiltrados.map(empleo => renderEmpleoCard(empleo))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FiltersSidebar({ filtros, setFiltros, mostrar }) {
  if (!mostrar) return null

  return (
    <div className="lg:w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-fit lg:sticky lg:top-24">
      <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Filtros</h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoría
        </label>
        <select
          value={filtros.categoria}
          onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          {Object.values(CATEGORIAS_EMPLEO).map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de empleo
        </label>
        <select
          value={filtros.tipoEmpleo}
          onChange={(e) => setFiltros({ ...filtros, tipoEmpleo: e.target.value })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los tipos</option>
          {Object.values(TIPOS_EMPLEO).map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setFiltros({
          busqueda: '',
          categoria: '',
          tipoEmpleo: '',
          tipoPublicacion: 'todos',
          ordenar: 'recientes'
        })}
        className="w-full py-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

function LoadingSkeleton({ vistaGrid }) {
  return (
    <div className={vistaGrid ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'flex flex-col gap-4'}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Briefcase className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No se encontraron publicaciones
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Intenta ajustar los filtros o buscar algo diferente
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Ver todas las publicaciones
      </button>
    </div>
  )
}

export default function EmpleosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900"><LoadingSkeleton vistaGrid={true} /></div>}>
      <EmpleosContent />
    </Suspense>
  )
}