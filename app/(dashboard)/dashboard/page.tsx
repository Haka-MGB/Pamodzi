'use client'
import { useState } from 'react'
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
  const { payments, tenants, issues, properties, revenueData, showToast } = useApp()
  const router = useRouter()
  const [revenuePeriod, setRevenuePeriod] = useState('')
  
  const paid = payments.filter(p => p.status === 'paid')
  const totalCollected = paid.reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending').length
  const openIssues = issues.filter(i => i.status !== 'resolved').length
  const totalUnits = properties.reduce((s, p) => s + p.totalUnits, 0)
  const occupiedUnits = properties.reduce((s, p) => s + p.occupiedUnits, 0)
  const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
  
  // Get current month and year
  const now = new Date()
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Count new tenants this month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const newTenantsThisMonth = tenants.filter(t => {
    if (!t.leaseStart) return false
    const leaseStartDate = new Date(t.leaseStart)
    return leaseStartDate >= currentMonthStart
  }).length
  
  // Count urgent issues
  const urgentIssues = issues.filter(i => i.priority === 'urgent' && i.status !== 'resolved').length
  
  // Get the period value - parse from formatted string or use all data if empty
  const getPeriodMonths = (value: string): number | null => {
    if (!value) return null // Show all data
    const match = value.match(/\d+/)
    if (match) return parseInt(match[0])
    if (!isNaN(Number(value))) return parseInt(value)
    return null
  }
  
  const effectiveMonths = getPeriodMonths(revenuePeriod)
  
  // Filter revenue data based on selected period
  const filteredRevenueData = effectiveMonths ? revenueData.slice(-effectiveMonths) : revenueData

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Your portfolio at a glance · {currentMonth}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={() => showToast('info', 'Refreshing data…')}><RefreshCw size={13} /> Refresh</button>
          <button className="btn-primary btn" onClick={() => router.push('/payments')}><Plus size={13} /> Record payment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={<Wallet size={18} />} 
          value={fmtK(totalCollected)} 
          label={`Collected · ${currentMonth}`} 
          trend={paid.length > 0 ? `${paid.length} payment${paid.length !== 1 ? 's' : ''}` : undefined}
          onClick={() => router.push('/payments')} 
        />
        <StatCard 
          icon={<Users size={18} />} 
          value={String(tenants.filter(t => t.status === 'active').length)} 
          label={`Active tenants${pending > 0 ? ` · ${pending} pending` : ''}`} 
          trend={newTenantsThisMonth > 0 ? `${newTenantsThisMonth} new this month` : undefined}
          trendUp={newTenantsThisMonth > 0}
          onClick={() => router.push('/tenants')} 
        />
        <StatCard 
          icon={<Wrench size={18} />} 
          value={String(openIssues)} 
          label="Open maintenance issues" 
          trend={urgentIssues > 0 ? `${urgentIssues} urgent` : undefined}
          trendUp={false} 
          accentColor="#C35D3A" 
          onClick={() => router.push('/maintenance')} 
        />
        <StatCard 
          icon={<Building2 size={18} />} 
          value={totalUnits > 0 ? `${occupancy}%` : 'N/A'} 
          label={`Occupancy${totalUnits > 0 ? ` · ${occupiedUnits}/${totalUnits} units` : ''}`} 
          trend={totalUnits > 0 && occupancy >= 90 ? 'High occupancy' : undefined}
          trendUp={occupancy >= 90}
          onClick={() => router.push('/properties')} 
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Revenue trend</span>
            <select 
              className="field-select text-xs px-2 py-1"
              style={{ width: 'auto', fontSize: '0.75rem' }}
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
            >
              <option value="">All time</option>
              <option value="last Month">last Month</option>
              <option value="last 4 Months">last 4 Months</option>
              <option value="last 6 Months">last 6 Months</option>
              <option value="last 12 Months">last 12 Months</option>
            </select>
          </div>
          <div className="p-3 sm:p-5">
            {filteredRevenueData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-page)' }}>
                  <Wallet size={32} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No revenue data yet</p>
                <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Revenue trends will appear here once you start recording payments from your tenants.
                </p>
              </div>
            ) : (
              <RevenueChart data={filteredRevenueData} properties={properties} />
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Payment status breakdown</span>
          </div>
          <div className="px-5 pt-3 pb-2">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Distribution of all payment records by their current status
            </p>
          </div>
          <div className="p-3 sm:p-5 pt-2 flex items-center justify-center" style={{ minHeight: '320px' }}>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-page)' }}>
                  <Wallet size={32} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No payments yet</p>
                <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Payment status breakdown will show here once you record your first payment.
                </p>
              </div>
            ) : (
              <StatusDonut paid={paid.length} pending={pending} overdue={payments.filter(p=>p.status==='overdue').length} />
            )}
          </div>
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AlertsPanel />
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Recent activity</span></div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
