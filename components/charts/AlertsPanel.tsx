'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'

export default function AlertsPanel() {
  const { payments, issues, router: _r } = useApp() as any
  const router = useRouter()
  const { payments: pays, issues: isss } = useApp()
  const openIssues = isss.filter((i: any) => i.status !== 'resolved').length
  const pending    = pays.filter((p: any) => p.status === 'pending').length

  const alerts = [
    { dot: 'bg-red-500',   title: 'Rent overdue — Tenant E',        sub: 'A5 Parklands · 9 days late · K2,200',        time: '9d',   link: '/payments' },
    { dot: 'bg-amber-500', title: `${pending} bank transfers pending`,     sub: 'Tenant C & Tenant D awaiting confirm', time: 'Today',link: '/payments' },
    { dot: 'bg-red-500',   title: 'Urgent repair — Roof leak',             sub: 'D2 Ndola East · Tenant G',                time: '4d',   link: '/maintenance' },
    { dot: 'bg-amber-500', title: 'Lease expiring soon',                   sub: 'Tenant E · A5 Parklands · May 2026',   time: '30d',  link: '/tenants' },
  ]

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Active alerts</span>
        <span className="badge badge-overdue">{openIssues + pending} items</span>
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
