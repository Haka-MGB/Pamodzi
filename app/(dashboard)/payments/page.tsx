'use client'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { downloadExcelFile, downloadPdfFile, downloadTextFile, fmtK } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Download, Plus, Search, CheckCircle, Clock, AlertTriangle, ChevronDown } from 'lucide-react'

export default function PaymentsPage() {
  const router = useRouter()
  const { payments, tenants, confirmPayment, addPayment, deletePayment, showToast } = useApp()
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [confirmId,    setConfirmId]    = useState<string | null>(null)
  const [addOpen,      setAddOpen]      = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  
  // Get current month and year for default period
  const now = new Date()
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
  
  const [form, setForm] = useState({ 
    tenantId: '', 
    tenantName: '', 
    method: 'Airtel Money', 
    ref: '', 
    date: currentDate, 
    period: currentMonth 
  })
  const [tenantPickerOpen, setTenantPickerOpen] = useState(false)
  const [activeTenantIndex, setActiveTenantIndex] = useState(0)
  const tenantPickerRef = useRef<HTMLDivElement>(null)

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
  const tenantQuery = form.tenantName.trim().toLowerCase()
  const filteredTenants = useMemo(() => {
    const matches = tenantQuery.length === 0
      ? tenants
      : tenants.filter(t =>
          t.name.toLowerCase().includes(tenantQuery) ||
          t.unit.toLowerCase().includes(tenantQuery) ||
          t.propertyName.toLowerCase().includes(tenantQuery)
        )

    return matches.slice(0, 8)
  }, [tenantQuery, tenants])

  useEffect(() => {
    setActiveTenantIndex(0)
  }, [tenantQuery, filteredTenants.length])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tenantPickerRef.current && !tenantPickerRef.current.contains(e.target as Node)) {
        setTenantPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  async function handleConfirm() {
    if (!confirmId) return
    try {
      await confirmPayment(confirmId)
      showToast('success', `Payment from ${confirmingPayment?.tenant} confirmed!`)
      setConfirmId(null)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to confirm payment.')
    }
  }

  async function handleDelete(paymentId: string) {
    setDeletingId(paymentId)
    setDeletePassword('')
    setDeleteConfirmOpen(true)
  }

  function selectTenant(tenant: (typeof tenants)[number]) {
    setForm(f => ({ ...f, tenantId: tenant.id, tenantName: tenant.name }))
    setTenantPickerOpen(false)
  }

  function handleTenantInput(value: string) {
    const tenant = tenants.find(t =>
      t.name.toLowerCase() === value.trim().toLowerCase() ||
      `${t.name} - ${t.unit}`.toLowerCase() === value.trim().toLowerCase()
    )
    setForm(f => ({ ...f, tenantName: value, tenantId: tenant?.id ?? '' }))
    setTenantPickerOpen(true)
  }

  function handleTenantKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setTenantPickerOpen(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setTenantPickerOpen(true)
      if (filteredTenants.length > 0) {
        setActiveTenantIndex(prev => (prev + 1) % filteredTenants.length)
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setTenantPickerOpen(true)
      if (filteredTenants.length > 0) {
        setActiveTenantIndex(prev => (prev - 1 + filteredTenants.length) % filteredTenants.length)
      }
    }

    if (e.key === 'Enter' && tenantPickerOpen && filteredTenants[activeTenantIndex]) {
      e.preventDefault()
      selectTenant(filteredTenants[activeTenantIndex])
    }
  }

  function closeAddPaymentModal() {
    setAddOpen(false)
    setTenantPickerOpen(false)
    setActiveTenantIndex(0)
  }

  async function handleAdd() {
    const tenant = tenants.find(t => t.id === form.tenantId) ||
      tenants.find(t => t.name.toLowerCase() === form.tenantName.trim().toLowerCase())
    if (!tenant || !form.ref) { showToast('error', 'Please fill all required fields'); return }
    if (!window.confirm(`Save this payment for ${tenant.name}?`)) return
    try {
      await addPayment({
        tenantId: tenant.id, tenant: tenant.name, unit: `${tenant.unit} · ${tenant.propertyName}`,
        amount: tenant.rent, method: form.method, ref: form.ref,
        status: 'pending', date: form.date || 'Today', period: form.period,
      })
      showToast('success', 'Payment recorded successfully.')
      closeAddPaymentModal()
      setForm({ 
        tenantId: '', 
        tenantName: '', 
        method: 'Airtel Money', 
        ref: '', 
        date: currentDate, 
        period: currentMonth 
      })
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to save payment.')
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Payments</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Track, confirm & export transactions · {currentMonth}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={exportPaymentsExcel}><Download size={13} /> Excel</button>
          <button className="btn" onClick={exportPaymentsPdf}><Download size={13} /> PDF</button>
          <button className="btn-primary btn" onClick={() => { setTenantPickerOpen(false); setAddOpen(true) }}><Plus size={13} /> Record payment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<CheckCircle size={18} />} 
          value={fmtK(totalCollected)} 
          label={`Collected · ${paid.length} payment${paid.length !== 1 ? 's' : ''}`} 
          trend={paid.length > 0 ? currentMonth : undefined}
          trendUp 
        />
        <StatCard 
          icon={<Clock size={18} />} 
          value={String(pending.length)} 
          label="Awaiting confirmation" 
          accentColor="#D9A13B" 
        />
        <StatCard 
          icon={<AlertTriangle size={18} />} 
          value={String(overdue.length)} 
          label="Overdue · Action needed" 
          accentColor="#C35D3A" 
        />
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
                    <div className="flex items-center gap-2">
                      {p.status === 'pending' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => setConfirmId(p.id)}>Confirm</button>
                      ) : p.status === 'overdue' ? (
                        <button className="btn btn-sm" onClick={() => showToast('info', `Reminder sent to ${p.tenant}`)}>Remind</button>
                      ) : (
                        <button className="btn btn-sm" onClick={() => downloadReceipt(p.id)}>Receipt</button>
                      )}
                      <button className="btn btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
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

      <Modal open={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setDeletingId(null); setDeletePassword('') }} title="Confirm delete" size="sm"
        footer={<>
          <button className="btn" onClick={() => { setDeleteConfirmOpen(false); setDeletingId(null); setDeletePassword('') }}>Cancel</button>
          <button className="btn-primary btn" onClick={async () => {
            if (!deletingId) return
            if (!deletePassword) { showToast('error', 'Enter your password to confirm.'); return }
            if (!window.confirm('Delete this payment record permanently?')) return
            try {
              await deletePayment(deletingId, deletePassword)
              showToast('success', 'Payment deleted.')
              setDeleteConfirmOpen(false)
              setDeletingId(null)
              setDeletePassword('')
            } catch (err) { showToast('error', err instanceof Error ? err.message : 'Unable to delete payment.') }
          }}>Delete</button>
        </>}
      >
        <div className="space-y-3">
          <p className="text-sm">This will permanently delete the payment record. Enter your account password to confirm.</p>
          <div className="field">
            <label className="field-label">Password *</label>
            <input className="field-input" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Add Payment Modal */}
      <Modal open={addOpen} onClose={closeAddPaymentModal} title="Record Payment"
        footer={<><button className="btn" onClick={closeAddPaymentModal}>Cancel</button><button className="btn-primary btn" onClick={handleAdd}>Save payment</button></>}>
        {tenants.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>You need to add at least one tenant first.</p>
            <button className="btn-primary btn mt-3" onClick={() => { closeAddPaymentModal(); router.push('/tenants') }}>
              Go to Tenants
            </button>
          </div>
        ) : (
          <div className="space-y-4">
          <div className="field">
            <label className="field-label">Tenant *</label>
            <div ref={tenantPickerRef} className="relative">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  className="field-input pl-9 pr-10"
                  placeholder="Search tenant name, unit or property..."
                  value={form.tenantName}
                  onChange={e => handleTenantInput(e.target.value)}
                  onFocus={() => setTenantPickerOpen(true)}
                  onKeyDown={handleTenantKeyDown}
                  role="combobox"
                  aria-expanded={tenantPickerOpen}
                  aria-controls="payment-tenant-options"
                  aria-autocomplete="list"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-all hover:bg-[var(--bg-surface-hover)]"
                  onClick={() => setTenantPickerOpen(open => !open)}
                  aria-label="Show tenants"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronDown size={15} />
                </button>
              </div>
              {tenantPickerOpen && (
                <div
                  id="payment-tenant-options"
                  className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-lg shadow-black/5"
                  role="listbox"
                >
                  {filteredTenants.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredTenants.map((tenant, index) => (
                        <button
                          key={tenant.id}
                          type="button"
                          role="option"
                          aria-selected={form.tenantId === tenant.id}
                          className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
                          style={{ background: index === activeTenantIndex ? 'var(--bg-page)' : 'transparent' }}
                          onMouseEnter={() => setActiveTenantIndex(index)}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => selectTenant(tenant)}
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: 'var(--accent-primary)' }}>
                            {tenant.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tenant.name}</p>
                            <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{tenant.unit} - {tenant.propertyName}</p>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{fmtK(tenant.rent)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3.5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      No tenant matches that search.
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>Type to filter tenants, or open the dropdown and choose one.</p>
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
        )}
      </Modal>
    </div>
  )
}
