// src/app/tienda/layout.js
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../../components/providers/ThemeProvider'
import { AuthProvider } from '../../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export default function StoreLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <div id="store-root">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}