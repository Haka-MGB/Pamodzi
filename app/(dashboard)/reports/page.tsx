'use client'
import { useApp } from '@/context/AppContext'
import { downloadExcelFile, downloadPdfFile, fmtK } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { FileDown, FileText, Clock, AlertCircle, Wrench } from 'lucide-react'

export default function ReportsPage() {
  const { revenueData, payments, showToast } = useApp()
  const totalCollected = payments.filter(p=>p.status==='paid').reduce((s,p)=>s+p.amount,0)

  function downloadSummaryReport() {
    const paid = payments.filter(p => p.status === 'paid')
    const pending = payments.filter(p => p.status === 'pending')
    const overdue = payments.filter(p => p.status === 'overdue')

    downloadPdfFile('pamodzi-summary-report.pdf', 'Pamodzi Summary Report', [
      `Collected: ${fmtK(totalCollected)}`,
      `Paid payments: ${paid.length}`,
      `Pending payments: ${pending.length}`,
      `Overdue payments: ${overdue.length}`,
      '',
      'Recent transactions:',
      ...payments.map(p => `- ${p.tenant}: ${fmtK(p.amount)} ${p.status} (${p.period})`),
    ])
    showToast('success', 'PDF report downloaded.')
  }

  const reportExportRows = payments.map(p => ({
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
      ...reportExportRows.map(p => `${p.tenant} | ${p.unit} | ${fmtK(Number(p.amount))} | ${p.method} | ${p.status} | ${p.reference} | ${p.date} | ${p.period}`),
    ])
    showToast('success', 'PDF export downloaded.')
  }

  const QUICK_EXPORTS = [
    { icon: FileText,    label: 'Rent roll · April 2026',       sub: 'All tenants, amounts & payment status',  color: 'var(--accent-primary)' },
    { icon: AlertCircle, label: 'Late payments summary',         sub: 'Overdue & pending confirmations',        color: '#C35D3A'               },
    { icon: Wrench,      label: 'Maintenance cost tracker',      sub: 'Open & resolved issues with costs',      color: '#4A90D9'               },
    { icon: Clock,       label: 'Lease expiry report',           sub: 'Tenants with leases expiring in 90 days',color: '#D9A13B'               },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Reports & Analytics</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Financial summaries, receipts & exports</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Generator */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Generate report</span></div>
          <div className="p-5 space-y-4">
            <div className="field">
              <label className="field-label">Report type</label>
              <select className="field-select">
                {['Monthly rent roll','Quarterly financial summary','Occupancy report','Late payments report','Maintenance cost summary'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Period</label>
              <select className="field-select">
                {['April 2026','March 2026','Q1 2026 (Jan–Mar)','Q4 2025','Full year 2025'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Property</label>
              <select className="field-select">
                {['All properties','Parklands Estate','Ndola East Residences','Lusaka CBD Apartments'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary btn flex-1" onClick={downloadSummaryReport}><FileDown size={13}/> PDF report</button>
              <button className="btn flex-1" onClick={exportReportExcel}><FileText size={13}/> Excel</button>
              <button className="btn flex-1" onClick={exportReportPdf}><FileText size={13}/> PDF</button>
            </div>
          </div>
        </div>

        {/* Quick exports */}
        <div className="panel">
          <div className="panel-header"><span className="panel-title">Quick exports</span></div>
          <div className="scroll-panel p-5 flex flex-col gap-3">
            {QUICK_EXPORTS.map(ex => (
              <div key={ex.label}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                style={{ border: '1.5px solid var(--border-light)', background: 'var(--bg-page)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'var(--accent-primary-gl)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-page)'; e.currentTarget.style.transform = 'translateY(0)' }}
                onClick={downloadSummaryReport}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ex.color}18`, color: ex.color }}>
                  <ex.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ex.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ex.sub}</p>
                </div>
                <FileDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue trend chart */}
      <div className="panel">
        <div className="panel-header"><span className="panel-title">Revenue trend by property — 2026</span></div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8F9A8E' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `K${v/1000}k`} tick={{ fontSize: 10, fill: '#8F9A8E' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`K ${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="parklands" name="Parklands Estate"      stroke="#2D6A4F" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ndola"     name="Ndola East"            stroke="#D9A13B" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cbd"       name="Lusaka CBD Apartments" stroke="#4A90D9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
