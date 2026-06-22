'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { downloadExcelFile, downloadPdfFile, downloadTextFile, fmtK } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Download, Plus, Search, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  const { payments, tenants, confirmPayment, addPayment, showToast } = useApp()
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [confirmId,    setConfirmId]    = useState<string | null>(null)
  const [addOpen,      setAddOpen]      = useState(false)
  const [form, setForm] = useState({ tenantId: '', tenantName: '', method: 'Airtel Money', ref: '', date: '', period: 'May 2026' })

  const filtered = payments.filter(p => {
    const matchSearch = p.tenant.toLowerCase().includes(search.toLowerCase()) ||
                        p.unit.toLowerCase().includes(search.toLowerCase()) ||
                        p.ref.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const paid    = payments.filter(p => p.status === 'paid')
  const pending = payments.filter(p => p.status === 'pending')
  const overdue = payments.filter(p => p.status === 'overdue')
  const totalCollected = paid.reduce((s, p) => s + p.amount, 0)

  const confirmingPayment = payments.find(p => p.id === confirmId)

  const paymentExportRows = payments.map(p => ({
      tenant: p.tenant,
      unit: p.unit,
      amount: p.amount,
      method: p.method,
      status: p.status,
      reference: p.ref,
      date: p.date,
      period: p.period,
  }))

  function exportPaymentsExcel() {
    downloadExcelFile('pamodzi-payments.xls', paymentExportRows)
    showToast('success', 'Excel export downloaded.')
  }

  function exportPaymentsPdf() {
    downloadPdfFile('pamodzi-payments.pdf', 'Pamodzi Payments', [
      'Tenant | Unit | Amount | Method | Status | Reference | Date | Period',
      ...paymentExportRows.map(p => `${p.tenant} | ${p.unit} | ${fmtK(Number(p.amount))} | ${p.method} | ${p.status} | ${p.reference} | ${p.date} | ${p.period}`),
    ])
    showToast('success', 'PDF export downloaded.')
  }

  function downloadReceipt(paymentId: string) {
    const payment = payments.find(p => p.id === paymentId)
    if (!payment) return

    downloadTextFile(`receipt-${payment.ref}.txt`, [
      'PAMODZI PAYMENT RECEIPT',
      '',
      `Tenant: ${payment.tenant}`,
      `Unit: ${payment.unit}`,
      `Amount: ${fmtK(payment.amount)}`,
      `Method: ${payment.method}`,
      `Reference: ${payment.ref}`,
      `Period: ${payment.period}`,
      `Date: ${payment.date}`,
      `Status: ${payment.status}`,
    ].join('\n'))
    showToast('success', 'Receipt downloaded.')
  }

  function handleConfirm() {
    if (!confirmId) return
    confirmPayment(confirmId)
    showToast('success', `Payment from ${confirmingPayment?.tenant} confirmed!`)
    setConfirmId(null)
  }

  function handleAdd() {
    const tenant = tenants.find(t => t.id === form.tenantId) ||
      tenants.find(t => t.name.toLowerCase() === form.tenantName.trim().toLowerCase())
    if (!tenant || !form.ref) { showToast('error', 'Please fill all required fields'); return }
    addPayment({
      tenantId: tenant.id, tenant: tenant.name, unit: `${tenant.unit} · ${tenant.propertyName}`,
      amount: tenant.rent, method: form.method, ref: form.ref,
      status: 'pending', date: form.date || 'Today', period: form.period,
    })
    showToast('success', 'Payment recorded successfully.')
    setAddOpen(false)
    setForm({ tenantId: '', tenantName: '', method: 'Airtel Money', ref: '', date: '', period: 'May 2026' })
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Payments</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Track, confirm & export transactions · April 2026</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={exportPaymentsExcel}><Download size={13} /> Excel</button>
          <button className="btn" onClick={exportPaymentsPdf}><Download size={13} /> PDF</button>
          <button className="btn-primary btn" onClick={() => setAddOpen(true)}><Plus size={13} /> Record payment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CheckCircle size={18} />} value={fmtK(totalCollected)} label={`Collected · ${paid.length} payments`} trend="8% vs March" trendUp />
        <StatCard icon={<Clock size={18} />} value={String(pending.length)} label="Awaiting confirmation" accentColor="#D9A13B" />
        <StatCard icon={<AlertTriangle size={18} />} value={String(overdue.length)} label="Overdue · Action needed" accentColor="#C35D3A" />
      </div>

      {/* Table */}
      <div className="panel">
        <div className="panel-header flex-wrap gap-2">
          <span className="panel-title">All transactions</span>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Status filter pills */}
            {['all','paid','pending','overdue'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all border ${statusFilter === s ? 'border-transparent text-white' : 'border-[var(--border-light)] text-[var(--text-secondary)]'}`}
                style={{ background: statusFilter === s ? 'var(--accent-primary)' : 'transparent' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="search-box">
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" />
            </div>
          </div>
        </div>
        <div className="scroll-panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th><th>Unit</th><th>Amount</th><th>Method</th>
                <th>Status</th><th>Reference</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No payments match your search.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="font-semibold">{p.tenant}</span></td>
                  <td><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.unit}</span></td>
                  <td><span className="font-bold">{fmtK(p.amount)}</span></td>
                  <td><span style={{ fontSize: '0.82rem' }}>{p.method}</span></td>
                  <td><Badge status={p.status} /></td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.ref}</span></td>
                  <td><span style={{ fontSize: '0.82rem' }}>{p.date}</span></td>
                  <td>
                    {p.status === 'pending' ? (
                      <button className="btn btn-sm btn-primary" onClick={() => setConfirmId(p.id)}>Confirm</button>
                    ) : p.status === 'overdue' ? (
                      <button className="btn btn-sm" onClick={() => showToast('info', `Reminder sent to ${p.tenant}`)}>Remind</button>
                    ) : (
                      <button className="btn btn-sm" onClick={() => downloadReceipt(p.id)}>Receipt</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Confirm Payment"
        footer={<><button className="btn" onClick={() => setConfirmId(null)}>Cancel</button><button className="btn-primary btn" onClick={handleConfirm}>Confirm payment</button></>}>
        {confirmingPayment && (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(45,106,79,0.1)' }}>
              <CheckCircle size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Confirm payment from</p>
            <p className="text-lg font-bold">{confirmingPayment.tenant}</p>
            <p className="text-2xl font-extrabold mt-1 mb-1" style={{ color: 'var(--accent-primary)' }}>{fmtK(confirmingPayment.amount)}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{confirmingPayment.unit} · {confirmingPayment.method} · {confirmingPayment.ref}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>A receipt will be logged and the tenant notified.</p>
          </div>
        )}
      </Modal>

      {/* Add Payment Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Payment"
        footer={<><button className="btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary btn" onClick={handleAdd}>Save payment</button></>}>
        <div className="space-y-4">
          <div className="field">
            <label className="field-label">Tenant *</label>
            <input
              className="field-input"
              list="payment-tenants"
              placeholder="Search or type tenant name..."
              value={form.tenantName}
              onChange={e => {
                const tenantName = e.target.value
                const tenant = tenants.find(t => `${t.name} - ${t.unit}` === tenantName || t.name.toLowerCase() === tenantName.trim().toLowerCase())
                setForm(f => ({ ...f, tenantName, tenantId: tenant?.id ?? '' }))
              }}
            />
            <datalist id="payment-tenants">
              {tenants.map(t => <option key={t.id} value={`${t.name} - ${t.unit}`} />)}
            </datalist>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>Start typing to search, or choose a tenant from the suggestions.</p>
          </div>
          <div className="field">
            <label className="field-label">Payment method</label>
            <select className="field-select" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
              {['Airtel Money','MTN MoMo','Bank Transfer','Cash','Direct Deposit'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="field-label">Reference *</label>
              <input className="field-input" placeholder="e.g. CM-APR26" value={form.ref} onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Period</label>
              <input className="field-input" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
