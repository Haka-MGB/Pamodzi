'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { downloadExcelFile, downloadPdfFile, fmtK } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'
import { FileDown, FileText, Clock, AlertCircle, Wrench, Plus } from 'lucide-react'

export default function ReportsPage() {
  const { revenueData, payments, properties, showToast } = useApp()
  const [revenuePeriod, setRevenuePeriod] = useState('')
  const totalCollected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  
  // Get current month and year
  const now = new Date()
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
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

  function downloadSummaryReport() {
    const paid = payments.filter((p) => p.status === 'paid')
    const pending = payments.filter((p) => p.status === 'pending')
    const overdue = payments.filter((p) => p.status === 'overdue')

    downloadPdfFile('pamodzi-summary-report.pdf', 'Pamodzi Summary Report', [
      `Collected: ${fmtK(totalCollected)}`,
      `Paid payments: ${paid.length}`,
      `Pending payments: ${pending.length}`,
      `Overdue payments: ${overdue.length}`,
      '',
      'Recent transactions:',
      ...payments.map((p) => `- ${p.tenant}: ${fmtK(p.amount)} ${p.status} (${p.period})`),
    ])
    showToast('success', 'PDF report downloaded.')
  }

  const reportExportRows = payments.map((p) => ({
    tenant: p.tenant,
    unit: p.unit,
    amount: p.amount,
    method: p.method,
    status: p.status,
    reference: p.ref,
    date: p.date,
    period: p.period,
  }))

  function exportReportExcel() {
    downloadExcelFile('pamodzi-report.xls', reportExportRows)
    showToast('success', 'Excel export downloaded.')
  }

  function exportReportPdf() {
    downloadPdfFile('pamodzi-report.pdf', 'Pamodzi Report Export', [
      'Tenant | Unit | Amount | Method | Status | Reference | Date | Period',
      ...reportExportRows.map(
        (p) =>
          `${p.tenant} | ${p.unit} | ${fmtK(Number(p.amount))} | ${p.method} | ${p.status} | ${p.reference} | ${p.date} | ${p.period}`
      ),
    ])
    showToast('success', 'PDF export downloaded.')
  }

  const QUICK_EXPORTS = [
    {
      icon: FileText,
      label: `Rent roll · ${currentMonth}`,
      sub: 'All tenants, amounts & payment status',
      color: 'var(--accent-primary)',
    },
    {
      icon: AlertCircle,
      label: 'Late payments summary',
      sub: 'Overdue & pending confirmations',
      color: '#C35D3A',
    },
    {
      icon: Wrench,
      label: 'Maintenance cost tracker',
      sub: 'Open & resolved issues with costs',
      color: '#4A90D9',
    },
    {
      icon: Clock,
      label: 'Lease expiry report',
      sub: 'Tenants with leases expiring in 90 days',
      color: '#D9A13B',
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Reports & Analytics
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Financial summaries, receipts & exports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Generator */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Generate report</span>
          </div>
          <div className="p-3 sm:p-5 space-y-4">
            <div className="field">
              <label className="field-label">Report type</label>
              <select className="field-select">
                {[
                  'Monthly rent roll',
                  'Quarterly financial summary',
                  'Occupancy report',
                  'Late payments report',
                  'Maintenance cost summary',
                ].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Period</label>
              <select className="field-select">
                <option>{currentMonth}</option>
                <option>{new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
                <option>{new Date(now.getFullYear(), now.getMonth() - 2, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
                <option>Q{Math.ceil((now.getMonth() + 1) / 3)} {now.getFullYear()}</option>
                <option>Full year {now.getFullYear()}</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Property</label>
              <select className="field-select">
                <option>All properties</option>
                {properties.map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary btn flex-1" onClick={downloadSummaryReport}>
                <FileDown size={13} /> PDF report
              </button>
              <button className="btn flex-1" onClick={exportReportExcel}>
                <FileText size={13} /> Excel
              </button>
              <button className="btn flex-1" onClick={exportReportPdf}>
                <FileText size={13} /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Quick exports */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Quick exports</span>
          </div>
          <div className="scroll-panel p-3 sm:p-5 flex flex-col gap-3">
            {QUICK_EXPORTS.map((ex) => (
              <div
                key={ex.label}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                style={{ border: '1.5px solid var(--border-light)', background: 'var(--bg-page)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)'
                  e.currentTarget.style.background = 'var(--accent-primary-gl)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.background = 'var(--bg-page)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                onClick={downloadSummaryReport}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${ex.color}18`, color: ex.color }}
                >
                  <ex.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {ex.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {ex.sub}
                  </p>
                </div>
                <FileDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue trend chart */}
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
                <FileText size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No revenue data yet</p>
              <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                Revenue trends will appear here once you start recording payments from your tenants.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={filteredRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#8F9A8E' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => {
                    const num = typeof value === 'number' ? value : 0
                    return `K${num / 1000}k`
                  }}
                  tick={{ fontSize: 10, fill: '#8F9A8E' }}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return [`K ${value.toLocaleString()}`, '']
                    }
                    return [String(value ?? ''), '']
                  }}
                  contentStyle={{
                    background: 'var(--bg-page)',
                    borderColor: 'var(--border-light)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {properties.length > 0 ? (
                  properties.slice(0, 5).map((prop, index) => {
                    const colors = ['#2D6A4F', '#D9A13B', '#4A90D9', '#C35D3A', '#8F9A8E']
                    const propKey = prop.id
                    return (
                      <Line
                        key={propKey}
                        type="monotone"
                        dataKey={propKey}
                        name={prop.name}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    )
                  })
                ) : (
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Revenue"
                    stroke="#2D6A4F"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}