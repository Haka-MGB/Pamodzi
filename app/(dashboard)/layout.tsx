'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Sidebar from '@/components/layout/Sidebar'
import Topnav  from '@/components/layout/Topnav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useApp()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace('/login')
  }, [isLoading, isLoggedIn, router])

  useEffect(() => {
    const main = document.getElementById('mainContent')
    if (main) main.scrollTop = 0
    setMobileNavOpen(false)
  }, [pathname])

  if (isLoading || !isLoggedIn) return null

  return (
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-page">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden content-fade">
        <Topnav onMenuClick={() => setMobileNavOpen(true)} />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7" id="mainContent"
          style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
