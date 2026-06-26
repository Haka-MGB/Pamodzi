'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { fmtK } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { UserPlus, Search, ChevronRight, Mail, Phone, Send } from 'lucide-react'

export default function TenantsPage() {
  const { tenants, payments, addTenant, updateTenant, deleteTenant, showToast } = useApp()
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [addOpen,  setAddOpen]  = useState(false)
  const [form, setForm] = useState({ name:'', unit:'', propertyId:'p1', propertyName:'Parklands Estate', rent:'', email:'', phone:'', leaseStart:'', leaseEnd:'' })
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name:'', unit:'', rent:'', email:'', phone:'', leaseEnd:'' })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.unit.toLowerCase().includes(search.toLowerCase()) ||
    t.propertyName.toLowerCase().includes(search.toLowerCase())
  )

  const tenantDetail = tenants.find(t => t.id === selected)
  const tenantPayments = payments.filter(p => p.tenantId === selected)

  async function handleAdd() {
    if (!form.name || !form.unit || !form.rent) { showToast('error', 'Name, unit and rent are required'); return }
    if (!window.confirm(`Save ${form.name} as a new tenant?`)) return
    try {
      await addTenant({
        name: form.name, initials: form.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2),
        unit: form.unit, propertyId: form.propertyId, propertyName: form.propertyName,
        rent: Number(form.rent), leaseStart: form.leaseStart || 'May 2026', leaseEnd: form.leaseEnd || 'Apr 2027',
        status: 'active', email: form.email, phone: form.phone,
      })
      showToast('success', `${form.name} added as a tenant.`)
      setAddOpen(false)
      setForm({ name:'', unit:'', propertyId:'p1', propertyName:'Parklands Estate', rent:'', email:'', phone:'', leaseStart:'', leaseEnd:'' })
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to save tenant.')
    }
  }

  async function handleUpdateTenant(id: string) {
    if (!window.confirm(`Save changes for ${editForm.name}?`)) return
    try {
      await updateTenant(id, { name: editForm.name.trim(), unit: editForm.unit.trim(), rent: Number(editForm.rent), email: editForm.email.trim(), phone: editForm.phone.trim(), leaseEnd: editForm.leaseEnd || 'Apr 2027' })
      showToast('success', `${editForm.name} updated.`)
      setEditOpen(false)
      setSelected(null)
    } catch (err) { showToast('error', err instanceof Error ? err.message : 'Unable to update tenant.') }
  }

  const PROPERTIES = [
    { id:'p1', name:'Parklands Estate' },
    { id:'p2', name:'Ndola East Residences' },
    { id:'p3', name:'Lusaka CBD Apartments' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tenants</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{tenants.length} tenants · {tenants.filter(t=>t.status==='active').length} active leases</p>
        </div>
        <button className="btn-primary btn" onClick={() => setAddOpen(true)}><UserPlus size={13} /> Add tenant</button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Tenant directory</span>
          <div className="search-box">
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or unit…" />
          </div>
        </div>
        <div className="scroll-panel">
        {filtered.map(t => (
          <div key={t.id}
            className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all"
            style={{ borderBottom: '1px solid var(--border-light)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-page)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setSelected(t.id)}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                 style={{ background: 'var(--accent-primary)' }}>{t.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.unit} · {t.propertyName}</p>
            </div>
            <div className="text-xs hidden md:block" style={{ color: 'var(--text-muted)' }}>Lease to {t.leaseEnd}</div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{fmtK(t.rent)}/mo</span>
              <Badge status={t.status} />
            </div>
            <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-2xl mb-2">👤</p>
            <p className="text-sm font-medium">No tenants found</p>
          </div>
        )}
        </div>
      </div>

      {/* Tenant Detail Modal */}
      {tenantDetail && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={tenantDetail.name}
          footer={<>
            <button className="btn" onClick={() => setSelected(null)}>Close</button>
            <button className="btn" onClick={() => { setEditForm({ name: tenantDetail.name, unit: tenantDetail.unit, rent: String(tenantDetail.rent), email: tenantDetail.email || '', phone: tenantDetail.phone || '', leaseEnd: tenantDetail.leaseEnd }); setEditOpen(true) }}>Edit</button>
            <button className="btn-primary btn" onClick={() => { showToast('success', `Reminder sent to ${tenantDetail.name}.`); setSelected(null) }}>
              <Send size={13} /> Send reminder
            </button>
            <button className="btn btn-sm" onClick={() => { setDeletingId(tenantDetail.id); setDeletePassword(''); setDeleteConfirmOpen(true) }}>Delete</button>
          </>}>
          <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                 style={{ background: 'var(--accent-primary)' }}>{tenantDetail.initials}</div>
            <div>
              <p className="font-bold text-base">{tenantDetail.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tenantDetail.unit} · {tenantDetail.propertyName}</p>
              <Badge status={tenantDetail.status} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              ['Monthly rent', fmtK(tenantDetail.rent)],
              ['Lease end',    tenantDetail.leaseEnd],
              ['Phone',        tenantDetail.phone],
              ['Email',        tenantDetail.email],
            ].map(([k,v]) => (
              <div key={k}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{k}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Payment history</p>
          {tenantPayments.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No payments recorded yet.</p>
          ) : tenantPayments.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <Badge status={p.status} className="flex-shrink-0" />
              <span className="text-xs flex-1">{fmtK(p.amount)} · {p.method}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.date}</span>
            </div>
          ))}
        </Modal>
      )}

        {/* Edit Tenant Modal */}
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit tenant"
          footer={<><button className="btn" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn-primary btn" onClick={() => { if (selected) handleUpdateTenant(selected) }}>Save changes</button></>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="field col-span-2"><label className="field-label">Full name *</label><input className="field-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="field"><label className="field-label">Unit *</label><input className="field-input" value={editForm.unit} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))} /></div>
            <div className="field"><label className="field-label">Monthly rent (ZMW) *</label><input type="number" className="field-input" value={editForm.rent} onChange={e => setEditForm(f => ({ ...f, rent: e.target.value }))} /></div>
            <div className="field"><label className="field-label">Phone</label><input className="field-input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="field col-span-2"><label className="field-label">Email</label><input className="field-input" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="field"><label className="field-label">Lease end</label><input type="date" className="field-input" value={editForm.leaseEnd} onChange={e => setEditForm(f => ({ ...f, leaseEnd: e.target.value }))} /></div>
          </div>
        </Modal>

      {/* Add Tenant Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Tenant" size="lg"
        footer={<><button className="btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary btn" onClick={handleAdd}>Add tenant</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="field col-span-2"><label className="field-label">Full name *</label><input className="field-input" placeholder="e.g. Joseph Phiri" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
          <div className="field">
            <label className="field-label">Property *</label>
            <select className="field-select" value={form.propertyId} onChange={e => { const p=PROPERTIES.find(x=>x.id===e.target.value)!; setForm(f=>({...f,propertyId:e.target.value,propertyName:p.name})) }}>
              {PROPERTIES.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="field"><label className="field-label">Unit *</label><input className="field-input" placeholder="e.g. B3" value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} /></div>
          <div className="field"><label className="field-label">Monthly rent (ZMW) *</label><input type="number" className="field-input" placeholder="2000" value={form.rent} onChange={e => setForm(f=>({...f,rent:e.target.value}))} /></div>
          <div className="field"><label className="field-label">Phone</label><input className="field-input" placeholder="0977 000 000" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></div>
          <div className="field col-span-2"><label className="field-label">Email</label><input type="email" className="field-input" placeholder="tenant@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
          <div className="field"><label className="field-label">Lease start</label><input type="date" className="field-input" value={form.leaseStart} onChange={e => setForm(f=>({...f,leaseStart:e.target.value}))} /></div>
          <div className="field"><label className="field-label">Lease end</label><input type="date" className="field-input" value={form.leaseEnd} onChange={e => setForm(f=>({...f,leaseEnd:e.target.value}))} /></div>
        </div>
      </Modal>

      <Modal open={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setDeletingId(null); setDeletePassword('') }} title="Confirm delete" size="sm"
        footer={<>
          <button className="btn" onClick={() => { setDeleteConfirmOpen(false); setDeletingId(null); setDeletePassword('') }}>Cancel</button>
          <button className="btn-primary btn" onClick={async () => {
            if (!deletingId) return
            if (!deletePassword) { showToast('error', 'Enter your password to confirm.'); return }
            const name = tenants.find(t => t.id === deletingId)?.name ?? 'this tenant'
            if (!window.confirm(`Delete ${name} permanently?`)) return
            try {
              await deleteTenant(deletingId, deletePassword)
              showToast('success', `${name} removed.`)
              setDeleteConfirmOpen(false)
              setDeletingId(null)
              setDeletePassword('')
              setSelected(null)
            } catch (err) { showToast('error', err instanceof Error ? err.message : 'Unable to delete tenant.') }
          }}>Delete</button>
        </>}
      >
        <div className="space-y-3">
          <p className="text-sm">This action will remove the tenant and related records. Enter your account password to confirm.</p>
          <div className="field">
            <label className="field-label">Password *</label>
            <input className="field-input" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
