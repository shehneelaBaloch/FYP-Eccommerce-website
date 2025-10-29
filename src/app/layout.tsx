'use client'
import './globals.css'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import ChatBot from '@/components/ChatBot' // Import the chatbot

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudioRoute = pathname.startsWith('/studio')

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {!isStudioRoute && <Navbar />}
          <main>{children}</main>
          {!isStudioRoute && <Footer />}
          
        
          {!isStudioRoute && <ChatBot />}
        </SessionProvider>
      </body>
    </html>
  )
}