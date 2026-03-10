import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Botshelo',
  description: 'Photography by Botshelo — Johannesburg',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-white text-black">
        {/* Nav hides itself on /admin routes via pathname check */}
        <Nav />
        {children}
      </body>
    </html>
  )
}
