// src/app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/providers/ThemeProvider'
import { AuthProvider } from '../contexts/AuthContext'  // ← Solo agregar esto
import Header from '../components/layout/Header'
import DesktopNavigation from '../components/layout/DesktopNavigation'
import MobileNavigation from '../components/layout/MobileNavigation'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Family Market',
  description: 'Tu mercado familiar en línea',
  manifest: '/manifest.json',
  applicationName: 'Family Market',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Family Market'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Family Market" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Family Market" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="screen-orientation" content="any" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>  {/* ← Solo wrappear con esto */}
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
              
              {/* Navegación Mobile condicional */}
                <MobileNavigation />

                <Footer />
            </div>
          </AuthProvider>  {/* ← Cerrar aquí */}
        </ThemeProvider>
        
        {/* Script actualizado para registrar ambos Service Workers */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', async () => {
                try {
                  // Registrar el Service Worker principal
                  const swRegistration = await navigator.serviceWorker.register('/sw.js');
                  console.log('SW principal registered:', swRegistration);
                  
                  // Registrar el Service Worker de Firebase Messaging
                  const msgRegistration = await navigator.serviceWorker.register('/api/firebase-messaging-sw');
                  console.log('Firebase SW registered:', msgRegistration);
                  
                } catch (error) {
                  console.log('SW registration failed:', error);
                }
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
