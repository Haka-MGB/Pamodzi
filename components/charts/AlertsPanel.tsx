'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useMemo } from 'react'

interface Alert {
  dot: string
  title: string
  sub: string
  time: string
  link: string
}

export default function AlertsPanel() {
  const { payments, issues, tenants } = useApp()
  const router = useRouter()
  
  // Generate alerts from real data
  const alerts = useMemo(() => {
    const result: Alert[] = []
    
    // Overdue payments
    const overduePayments = payments.filter(p => p.status === 'overdue')
    overduePayments.slice(0, 2).forEach(p => {
      result.push({
        dot: 'bg-red-500',
        title: `Rent overdue — ${p.tenant}`,
        sub: `${p.unit} · ${p.period} · ${p.amount.toLocaleString('en-US', { style: 'currency', currency: 'ZMW' })}`,
        time: p.date,
        link: '/payments'
      })
    })
    
    // Pending payments
    const pendingPayments = payments.filter(p => p.status === 'pending')
    if (pendingPayments.length > 0) {
      const count = pendingPayments.length
      const names = pendingPayments.slice(0, 2).map(p => p.tenant).join(' & ')
      result.push({
        dot: 'bg-amber-500',
        title: `${count} payment${count !== 1 ? 's' : ''} pending confirmation`,
        sub: names + (count > 2 ? ` and ${count - 2} more` : '') + ' awaiting confirm',
        time: 'Today',
        link: '/payments'
      })
    }
    
    // Urgent issues
    const urgentIssues = issues.filter(i => i.priority === 'urgent' && i.status !== 'resolved')
    urgentIssues.slice(0, 2).forEach(i => {
      result.push({
        dot: 'bg-red-500',
        title: `Urgent repair — ${i.title}`,
        sub: `${i.unit} · ${i.tenant}`,
        time: i.date,
        link: '/maintenance'
      })
    })
    
    // Leases expiring soon (within 60 days)
    const now = new Date()
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    tenants.forEach(t => {
      if (!t.leaseEnd) return
      const leaseEnd = new Date(t.leaseEnd)
      if (leaseEnd > now && leaseEnd <= sixtyDaysFromNow) {
        const daysUntil = Math.ceil((leaseEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        result.push({
          dot: 'bg-amber-500',
          title: 'Lease expiring soon',
          sub: `${t.name} · ${t.unit} · ${t.leaseEnd}`,
          time: `${daysUntil}d`,
          link: '/tenants'
        })
      }
    })
    
    // If no alerts, show a placeholder
    if (result.length === 0) {
      result.push({
        dot: 'bg-green-500',
        title: 'All clear',
        sub: 'No urgent alerts at this time',
        time: 'Now',
        link: '/dashboard'
      })
    }
    
    return result.slice(0, 4) // Show max 4 alerts
  }, [payments, issues, tenants])
  
  const totalAlertCount = 
    payments.filter(p => p.status === 'overdue' || p.status === 'pending').length +
    issues.filter(i => i.status !== 'resolved').length

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Active alerts</span>
        {totalAlertCount > 0 && (
          <span className="badge badge-overdue">{totalAlertCount} item{totalAlertCount !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="scroll-panel">
        {alerts.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-all"
            style={{ borderBottom: '1px solid var(--border-light)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-page)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => router.push(a.link)}>
            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.sub}</p>
            </div>
            <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
