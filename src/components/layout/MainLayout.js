// src/components/layout/MainLayout.js
'use client'
import Header from './Header'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <Header />
      
      {/* Navegación Desktop - Con su propio container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DesktopNavigation />
      </div>
      
      {/* Contenido principal */}
      <main className="pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Navegación Mobile */}
      <MobileNavigation />
    </div>
  )
}