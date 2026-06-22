'use client'
import { useApp } from '@/context/AppContext'
import { CheckCircle, AlertTriangle, Wrench, Clock } from 'lucide-react'

const ICONS: Record<string, React.ElementType> = {
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'wrench': Wrench,
  'clock': Clock,
}
const COLORS: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  info:    'bg-blue-100  text-blue-700',
  error:   'bg-red-100   text-red-700',
}

export default function ActivityFeed() {
  const { activity } = useApp()
  return (
    <div className="scroll-panel">
      {activity.map(a => {
        const Icon = ICONS[a.icon] ?? CheckCircle
        return (
          <div key={a.id} className="flex gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${COLORS[a.type]}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}
                 dangerouslySetInnerHTML={{ __html: a.text }} />
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
