'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import Sidebar from '@/components/layout/Sidebar'
import Topnav  from '@/components/layout/Topnav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login')
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topnav />
        <main className="flex-1 overflow-y-auto p-7 content-fade" id="mainContent">
          {children}
        </main>
      </div>
    </div>
  )
}
