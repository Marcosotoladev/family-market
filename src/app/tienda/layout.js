// src/app/tienda/layout.js
'use client'

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function StoreLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <div id="store-root" className={`${inter.className} antialiased`}>
          {children}
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}