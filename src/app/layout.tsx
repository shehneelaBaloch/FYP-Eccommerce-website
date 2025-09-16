'use client'

import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import './globals.css'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // hide Navbar + Footer when inside /studio
  const isStudioRoute = pathname.startsWith('/studio')

  return (
    <html lang="en">
      <body>
        <CartProvider>
          {!isStudioRoute && <Navbar />}
          <main>{children}</main>
          {!isStudioRoute && <Footer />}
        </CartProvider>
      </body>
    </html>
  )
}
