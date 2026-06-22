'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'

export default function RootPage() {
  const { isLoggedIn } = useApp()
  const router = useRouter()
  useEffect(() => {
    router.replace(isLoggedIn ? '/dashboard' : '/login')
  }, [isLoggedIn, router])
  return null
}
