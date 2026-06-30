import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { ToastContainer } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Pamodzi | Property Management Platform',
  description: 'Professional property management for Zambian landlords',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  )
}
