'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { fmtK } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import { Building2, DoorOpen, Eye, MapPin, Plus, Settings2, Wallet } from 'lucide-react'

export default function PropertiesPage() {
  const { properties, addProperty, updateProperty, deleteProperty, showToast } = useApp()
  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [manageId, setManageId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    location: '',
    type: 'Residential',
    totalUnits: '8',
    occupiedUnits: '0',
    monthlyRevenue: '0',
  })

  const totalRevenue = properties.reduce((s, p) => s + p.monthlyRevenue, 0)
  const totalUnits = properties.reduce((s, p) => s + p.totalUnits, 0)
  const occupiedUnits = properties.reduce((s, p) => s + p.occupiedUnits, 0)
  const detailProperty = properties.find(p => p.id === detailId)
  const manageProperty = properties.find(p => p.id === manageId)
  const editProperty = properties.find(p => p.id === editId)
  const [editForm, setEditForm] = useState({ name: '', location: '', type: 'Residential', totalUnits: '8', occupiedUnits: '0', monthlyRevenue: '0' })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')

  async function handleAddProperty() {
    const parsedTotal = Number(form.totalUnits)
    const parsedOccupied = Number(form.occupiedUnits)
    const parsedRevenue = Number(form.monthlyRevenue)

    if (!form.name.trim() || !form.location.trim()) {
      showToast('error', 'Property name and location are required.')
      return
    }

    if (parsedTotal < 1 || parsedOccupied < 0 || parsedOccupied > parsedTotal) {
      showToast('error', 'Check total and occupied unit counts.')
      return
    }

    if (!window.confirm(`Save ${form.name} as a new property?`)) return

    try {
      await addProperty({
        name: form.name.trim(),
        location: form.location.trim(),
        type: form.type,
        totalUnits: parsedTotal,
        occupiedUnits: parsedOccupied,
        monthlyRevenue: parsedRevenue,
      })
      showToast('success', `${form.name} added.`)
      setAddOpen(false)
      setForm({ name: '', location: '', type: 'Residential', totalUnits: '8', occupiedUnits: '0', monthlyRevenue: '0' })
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to save property.')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Properties</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{properties.length} properties · {occupiedUnits}/{totalUnits} units occupied</p>
        </div>
        <button className="btn-primary btn" onClick={() => setAddOpen(true)}><Plus size={13} /> Add property</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Building2 size={18}/>} value={String(properties.length)} label="Total properties" />
        <StatCard icon={<DoorOpen size={18}/>} value={`${occupiedUnits}/${totalUnits}`} label="Units occupied" />
        <StatCard icon={<Wallet size={18}/>} value={fmtK(totalRevenue)} label="Monthly revenue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {properties.map(p => {
          const pct = Math.round((p.occupiedUnits / p.totalUnits) * 100)
          const barColor = pct >= 90 ? '#2D6A4F' : pct >= 70 ? '#D9A13B' : '#C35D3A'
          const badgeColor = pct >= 90 ? 'badge-active' : pct >= 70 ? 'badge-pending' : 'badge-overdue'
          return (
            <div key={p.id} className="panel transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {p.location}
                    </p>
                  </div>
                  <span className={`badge ${badgeColor} text-[10px]`}>{p.type}</span>
                </div>
              </div>
              <div className="px-5 py-4">
                {[
                  ['Total units', p.totalUnits],
                  ['Occupied', p.occupiedUnits],
                  ['Monthly revenue', fmtK(p.monthlyRevenue)],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--text-muted)' }}>Occupancy</span>
                    <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
                  </div>
                  <div className="occ-bar">
                    <div className="occ-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="btn btn-sm" onClick={() => setDetailId(p.id)}><Eye size={12}/> Details</button>
                  <button className="btn btn-sm" onClick={() => { setEditId(p.id); setEditForm({ name: p.name, location: p.location, type: p.type, totalUnits: String(p.totalUnits), occupiedUnits: String(p.occupiedUnits), monthlyRevenue: String(p.monthlyRevenue) }); setEditOpen(true) }}><Settings2 size={12}/> Edit</button>
                  <button className="btn-primary btn btn-sm flex-1" onClick={() => setManageId(p.id)}><Settings2 size={12}/> Manage</button>
                  <button className="btn btn-sm" onClick={() => { setDeletingId(p.id); setDeletePassword(''); setDeleteConfirmOpen(true) }}>Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setDeletingId(null); setDeletePassword('') }} title="Confirm delete" size="sm"
        footer={<>
          <button className="btn" onClick={() => { setDeleteConfirmOpen(false); setDeletingId(null); setDeletePassword('') }}>Cancel</button>
          <button className="btn-primary btn" onClick={async () => {
            if (!deletingId) return
            if (!deletePassword) { showToast('error', 'Enter your password to confirm.'); return }
            const name = properties.find(p => p.id === deletingId)?.name ?? 'this property'
            if (!window.confirm(`Delete ${name} permanently?`)) return
            try {
              await deleteProperty(deletingId, deletePassword)
              showToast('success', `${name} deleted.`)
              setDeleteConfirmOpen(false)
              setDeletingId(null)
              setDeletePassword('')
            } catch (err) { showToast('error', err instanceof Error ? err.message : 'Unable to delete.') }
          }}>Delete</button>
        </>}
      >
        <div className="space-y-3">
          <p className="text-sm">This action permanently deletes the property. Enter your account password to confirm.</p>
          <div className="field">
            <label className="field-label">Password *</label>
            <input className="field-input" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Property"
        footer={<><button className="btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary btn" onClick={handleAddProperty}>Save property</button></>}>
        <div className="space-y-4">
          <div className="field">
            <label className="field-label">Property name *</label>
            <input className="field-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Roma Apartments" />
          </div>
          <div className="field">
            <label className="field-label">Location *</label>
            <input className="field-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Lusaka" />
          </div>
          <div className="field">
            <label className="field-label">Property type</label>
            <select className="field-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Residential', 'Commercial Mix', 'Retail', 'Office', 'Industrial'].map(type => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="field">
              <label className="field-label">Units</label>
              <input type="number" min={1} className="field-input" value={form.totalUnits} onChange={e => setForm(f => ({ ...f, totalUnits: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Occupied</label>
              <input type="number" min={0} className="field-input" value={form.occupiedUnits} onChange={e => setForm(f => ({ ...f, occupiedUnits: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Revenue</label>
              <input type="number" min={0} className="field-input" value={form.monthlyRevenue} onChange={e => setForm(f => ({ ...f, monthlyRevenue: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Property Details"
        footer={<button className="btn-primary btn" onClick={() => setDetailId(null)}>Done</button>}>
        {detailProperty && (
          <div className="space-y-3">
            {[
              ['Name', detailProperty.name],
              ['Location', detailProperty.location],
              ['Type', detailProperty.type],
              ['Total units', detailProperty.totalUnits],
              ['Occupied units', detailProperty.occupiedUnits],
              ['Monthly revenue', fmtK(detailProperty.monthlyRevenue)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <strong className="text-sm">{value}</strong>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!manageId} onClose={() => setManageId(null)} title="Manage Units"
        footer={<button className="btn-primary btn" onClick={() => setManageId(null)}>Done</button>}>
        {manageProperty && (
          <div className="space-y-3">
            {Array.from({ length: manageProperty.totalUnits }).map((_, index) => {
              const occupied = index < manageProperty.occupiedUnits
              return (
                <div key={index} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--bg-page)' }}>
                  <span className="text-sm font-semibold">Unit {index + 1}</span>
                  <span className={`badge ${occupied ? 'badge-active' : 'badge-low'}`}>{occupied ? 'Occupied' : 'Vacant'}</span>
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      <Modal open={!!editOpen} onClose={() => { setEditOpen(false); setEditId(null) }} title="Edit Property"
        footer={<><button className="btn" onClick={() => { setEditOpen(false); setEditId(null) }}>Cancel</button><button className="btn-primary btn" onClick={async () => {
          if (!editProperty) return
          if (!window.confirm(`Save changes for ${editForm.name}?`)) return
          try {
            await updateProperty(editProperty.id, {
              name: editForm.name.trim(), location: editForm.location.trim(), type: editForm.type,
              totalUnits: Number(editForm.totalUnits), occupiedUnits: Number(editForm.occupiedUnits), monthlyRevenue: Number(editForm.monthlyRevenue),
            })
            showToast('success', `${editForm.name} updated.`)
            setEditOpen(false)
            setEditId(null)
          } catch (error) { showToast('error', error instanceof Error ? error.message : 'Unable to update property.') }
        }}>Save changes</button></>}
      >
        {editProperty && (
          <div className="space-y-4">
            <div className="field">
              <label className="field-label">Property name *</label>
              <input className="field-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Location *</label>
              <input className="field-input" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Property type</label>
              <select className="field-select" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                {['Residential', 'Commercial Mix', 'Retail', 'Office', 'Industrial'].map(type => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="field">
                <label className="field-label">Units</label>
                <input type="number" min={1} className="field-input" value={editForm.totalUnits} onChange={e => setEditForm(f => ({ ...f, totalUnits: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Occupied</label>
                <input type="number" min={0} className="field-input" value={editForm.occupiedUnits} onChange={e => setEditForm(f => ({ ...f, occupiedUnits: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Revenue</label>
                <input type="number" min={0} className="field-input" value={editForm.monthlyRevenue} onChange={e => setEditForm(f => ({ ...f, monthlyRevenue: e.target.value }))} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
