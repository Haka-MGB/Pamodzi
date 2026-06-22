'use client'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import { Wallet, Users, Wrench, Building2, RefreshCw, Plus } from 'lucide-react'
import { fmtK } from '@/lib/utils'
import RevenueChart from '@/components/charts/RevenueChart'
import StatusDonut from '@/components/charts/StatusDonut'
import ActivityFeed from '@/components/charts/ActivityFeed'
import AlertsPanel from '@/components/charts/AlertsPanel'

export default function DashboardPage() {
  const { payments, tenants, issues, properties, showToast } = useApp()
  const router = useRouter()
  const paid = payments.filter(p => p.status === 'paid')
  const totalCollected = paid.reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending').length
  const openIssues = issues.filter(i => i.status !== 'resolved').length
  const totalUnits = properties.reduce((s, p) => s + p.totalUnits, 0)
  const occupiedUnits = properties.reduce((s, p) => s + p.occupiedUnits, 0)
  const occupancy = Math.round((occupiedUnits / totalUnits) * 100)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Your portfolio at a glance · April 2026</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={() => showToast('info', 'Refreshing data…')}><RefreshCw size={13} /> Refresh</button>
          <button className="btn-primary btn" onClick={() => router.push('/payments')}><Plus size={13} /> Record payment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Wallet size={18} />} value={fmtK(totalCollected)} label={`Collected · April 2026`} trend="8% vs March" trendUp onClick={() => router.push('/payments')} />
        <StatCard icon={<Users size={18} />} value={String(tenants.filter(t => t.status === 'active').length)} label={`Active tenants · ${pending} pending`} trend="1 new this month" trendUp onClick={() => router.push('/tenants')} />
        <StatCard icon={<Wrench size={18} />} value={String(openIssues)} label="Open maintenance issues" trend="1 urgent needs action" trendUp={false} accentColor="#C35D3A" onClick={() => router.push('/maintenance')} />
        <StatCard icon={<Building2 size={18} />} value={`${occupancy}%`} label={`Occupancy · ${occupiedUnits}/${totalUnits} units`} trend="2 units above last month" trendUp onClick={() => router.push('/properties')} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Revenue — last 6 months</span></div>
          <div className="p-5"><RevenueChart /></div>
        </div>
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Payment status breakdown</span></div>
          <div className="p-5"><StatusDonut paid={paid.length} pending={pending} overdue={payments.filter(p=>p.status==='overdue').length} /></div>
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <AlertsPanel />
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Recent activity</span></div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
