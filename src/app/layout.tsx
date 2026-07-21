import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegister } from './_components/service-worker-register'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Local-first Point of Sale System',
}

export const viewport: Viewport = {
  themeColor: '#CC785C',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <main id="content" className="flex-1">
          {children}
        </main>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
