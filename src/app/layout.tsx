import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegister } from './_components/service-worker-register'

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Local-first Point of Sale System',
}

export const viewport: Viewport = {
  themeColor: '#0066cc',
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
    <html lang="en" className="h-full antialiased">
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
