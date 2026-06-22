'use client'
import { useApp } from '@/context/AppContext'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
}
const COLORS = {
  success: 'text-green-400',
  error:   'text-red-400',
  info:    'text-blue-400',
  warning: 'text-amber-400',
}

export function ToastContainer() {
  const { toasts } = useApp()
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse gap-2.5 pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.type]
        return (
          <div key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-w-[240px] max-w-sm pointer-events-auto animate-toast-in"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-surface)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
            <Icon size={16} className={COLORS[t.type]} />
            <span className="flex-1">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
