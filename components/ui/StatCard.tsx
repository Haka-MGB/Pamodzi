import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  trend?: string
  trendUp?: boolean
  onClick?: () => void
  accentColor?: string
}

export default function StatCard({ icon, value, label, trend, trendUp = true, onClick, accentColor }: StatCardProps) {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-card-icon"
           style={{ '--icon-color': accentColor ?? 'var(--accent-primary)' } as React.CSSProperties}>
        {icon}
      </div>
      <div className="text-[1.75rem] font-extrabold leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {trend && (
        <div className={cn('flex items-center gap-1 text-[11px] font-semibold mt-1.5', trendUp ? 'text-status-paid' : 'text-status-overdue')}>
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trend}
        </div>
      )}
    </div>
  )
}
