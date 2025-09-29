'use client'

import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import './globals.css'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // hide Navbar + Footer when inside /studio
  const isStudioRoute = pathname.startsWith('/studio')

  return (
    <html lang="en">
      <body>
        {/* ✅ Only keep SessionProvider now */}
        <SessionProvider>
          {!isStudioRoute && <Navbar />}
          <main>{children}</main>
          {!isStudioRoute && <Footer />}
        </SessionProvider>
      </body>
    </html>
  )
}
