// src/app/tiendas/page.js
'use client'

import { useState, useEffect } from 'react'
import { Search, Store, MapPin, Clock, ExternalLink, Loader2 } from 'lucide-react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import Link from 'next/link'

export default function TiendasPage() {
  const [tiendas, setTiendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargarTiendas()
  }, [])

  const cargarTiendas = async () => {
    try {
      setLoading(true)
      
      // Query: solo usuarios aprobados con tiendas activas
      const usersQuery = query(
        collection(db, 'users'),
        where('accountStatus', 'in', ['approved', 'true'])
      )

      const snapshot = await getDocs(usersQuery)
      const tiendasData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.storeSlug) // Solo usuarios con slug de tienda
        .sort((a, b) => {
          // Ordenar alfabéticamente por nombre de negocio
          const nombreA = (a.businessName || a.familyName || '').toLowerCase()
          const nombreB = (b.businessName || b.familyName || '').toLowerCase()
          return nombreA.localeCompare(nombreB)
        })

      setTiendas(tiendasData)
    } catch (error) {
      console.error('Error cargando tiendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const tiendasFiltradas = tiendas.filter(tienda => {
    if (!busqueda) return true
    const busquedaLower = busqueda.toLowerCase()
    return (
      (tienda.businessName?.toLowerCase().includes(busquedaLower)) ||
      (tienda.familyName?.toLowerCase().includes(busquedaLower)) ||
      (tienda.slogan?.toLowerCase().includes(busquedaLower)) ||
      (tienda.address?.toLowerCase().includes(busquedaLower))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barra de búsqueda - igual a productos */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tiendas por nombre, ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Contador */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Cargando...' : `${tiendasFiltradas.length} ${tiendasFiltradas.length === 1 ? 'tienda encontrada' : 'tiendas encontradas'}`}
          </p>
        </div>

        {/* Grid de tiendas */}
        {loading ? (
          <LoadingSkeleton />
        ) : tiendasFiltradas.length === 0 ? (
          <EmptyState busqueda={busqueda} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {tiendasFiltradas.map(tienda => (
              <TiendaCard key={tienda.id} tienda={tienda} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Card de tienda
function TiendaCard({ tienda }) {
  const nombre = tienda.businessName || tienda.familyName || 'Tienda sin nombre'
  const [imageError, setImageError] = useState(false)
  
  return (
    <Link 
      href={`/tienda/${tienda.storeSlug}`}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-200 group flex flex-col h-full"
    >
      {/* Logo/Imagen */}
      <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 relative flex items-center justify-center p-4">
        {tienda.storeLogo && !imageError ? (
          <img
            src={tienda.storeLogo}
            alt={nombre}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <Store className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors text-sm leading-tight min-h-[2.5rem]">
          {nombre}
        </h3>
        
        {tienda.slogan && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 flex-1">
            {tienda.slogan}
          </p>
        )}

        {tienda.address && (
          <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-500 mt-auto">
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{tienda.address}</span>
          </div>
        )}
      </div>

      {/* Indicador de visita */}
      <div className="px-3 pb-3 pt-0">
        <div className="flex items-center justify-center text-xs text-orange-600 dark:text-orange-400 font-medium group-hover:underline">
          Ver tienda
          <ExternalLink className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Estado vacío
function EmptyState({ busqueda }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-full flex items-center justify-center">
        <Store className="w-12 h-12 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {busqueda ? 'No se encontraron tiendas' : 'No hay tiendas disponibles'}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {busqueda 
          ? 'Intenta buscar con otros términos o ajusta los filtros'
          : 'Pronto habrá más tiendas familiares disponibles en la plataforma'
        }
      </p>
      {busqueda && (
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Ver todas las tiendas
        </button>
      )}
    </div>
  )
}