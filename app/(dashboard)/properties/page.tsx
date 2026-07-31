'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { fmtK } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import { Building2, DoorOpen, Eye, MapPin, Plus, Settings2, Wallet, Edit3, User, Trash2, Check, X } from 'lucide-react'

export default function PropertiesPage() {
  const { properties: rawProperties, units, tenants, addProperty, updateProperty, deleteProperty, addUnit, updateUnit, deleteUnit, showToast } = useApp()
  const properties = Array.isArray(rawProperties) ? rawProperties.filter(p => p != null) : []

  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [manageId, setManageId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
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
  const managePropertyUnits = manageProperty ? units.filter(u => u.propertyId === manageProperty.id) : []
  const editProperty = properties.find(p => p.id === editId)
  const editingUnit = units.find(u => u.id === editingUnitId)
  const [editForm, setEditForm] = useState({ name: '', location: '', type: 'Residential', totalUnits: '8', occupiedUnits: '0', monthlyRevenue: '0' })
  const [unitForm, setUnitForm] = useState({
    unitName: '',
    unitNumber: '',
    floor: '',
    bedrooms: '0',
    bathrooms: '0',
    squareFeet: '',
    rentAmount: '0',
    status: 'vacant' as 'vacant' | 'occupied' | 'maintenance',
    tenantId: '',
    notes: '',
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')

  function resetUnitForm() {
    setUnitForm({
      unitName: '',
      unitNumber: '',
      floor: '',
      bedrooms: '0',
      bathrooms: '0',
      squareFeet: '',
      rentAmount: '0',
      status: 'vacant',
      tenantId: '',
      notes: '',
    })
  }

  function openAddUnit() {
    setEditingUnitId('new')
    resetUnitForm()
  }

  function openEditUnit(unit: typeof editingUnit) {
    if (!unit) return
    setEditingUnitId(unit.id)
    setUnitForm({
      unitName: unit.unitName || '',
      unitNumber: unit.unitNumber || '',
      floor: unit.floor || '',
      bedrooms: String(unit.bedrooms || 0),
      bathrooms: String(unit.bathrooms || 0),
      squareFeet: unit.squareFeet ? String(unit.squareFeet) : '',
      rentAmount: String(unit.rentAmount || 0),
      status: unit.status || 'vacant',
      tenantId: unit.tenantId || '',
      notes: unit.notes || '',
    })
  }

  async function handleSaveUnit() {
    if (!editingUnitId || !manageProperty) return
    if (!unitForm.unitName.trim()) {
      showToast('error', 'Unit name is required.')
      return
    }

    try {
      const payload = {
        propertyId: manageProperty.id,
        unitName: unitForm.unitName.trim(),
        unitNumber: unitForm.unitNumber.trim() || undefined,
        floor: unitForm.floor.trim() || undefined,
        bedrooms: Number(unitForm.bedrooms) || undefined,
        bathrooms: Number(unitForm.bathrooms) || undefined,
        squareFeet: unitForm.squareFeet ? Number(unitForm.squareFeet) : undefined,
        rentAmount: Number(unitForm.rentAmount) || 0,
        status: unitForm.status,
        tenantId: unitForm.tenantId || undefined,
        notes: unitForm.notes.trim() || undefined,
      }

      if (editingUnitId === 'new') {
        await addUnit(payload)
        showToast('success', 'Unit added successfully.')
      } else {
        await updateUnit(editingUnitId, payload)
        showToast('success', 'Unit updated successfully.')
      }

      setEditingUnitId(null)
      resetUnitForm()
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to save unit.')
    }
  }

  async function handleDeleteUnit(unitId: string, unitName: string) {
    if (!window.confirm(`Delete unit "${unitName}"? This cannot be undone.`)) return
    
    try {
      await deleteUnit(unitId)
      showToast('success', 'Unit deleted.')
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to delete unit.')
    }
  }

  function getTenantForUnit(unit: typeof editingUnit) {
    if (!unit || !unit.tenantId) return null
    return tenants.find(t => t.id === unit.tenantId)
  }

  function renderUnitForm() {
    if (!manageProperty) return null

    return (
      <div className="space-y-3">
        <div className="field">
          <label className="field-label">Unit Name *</label>
          <input className="field-input" value={unitForm.unitName} onChange={e => setUnitForm(f => ({ ...f, unitName: e.target.value }))} placeholder="e.g. Shop 1 - Front Entrance" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="field-label">Unit Number</label>
            <input className="field-input" value={unitForm.unitNumber} onChange={e => setUnitForm(f => ({ ...f, unitNumber: e.target.value }))} placeholder="e.g. A1" />
          </div>
          <div className="field">
            <label className="field-label">Floor</label>
            <input className="field-input" value={unitForm.floor} onChange={e => setUnitForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. Ground Floor" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="field">
            <label className="field-label">Bedrooms</label>
            <input type="number" min={0} className="field-input" value={unitForm.bedrooms} onChange={e => setUnitForm(f => ({ ...f, bedrooms: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label">Bathrooms</label>
            <input type="number" min={0} className="field-input" value={unitForm.bathrooms} onChange={e => setUnitForm(f => ({ ...f, bathrooms: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label">Sq Ft</label>
            <input type="number" min={0} className="field-input" value={unitForm.squareFeet} onChange={e => setUnitForm(f => ({ ...f, squareFeet: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="field-label">Rent Amount</label>
            <input type="number" min={0} className="field-input" value={unitForm.rentAmount} onChange={e => setUnitForm(f => ({ ...f, rentAmount: e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label">Status</label>
            <select className="field-select" value={unitForm.status} onChange={e => setUnitForm(f => ({ ...f, status: e.target.value as typeof unitForm.status }))}>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Assign Tenant</label>
          <select className="field-select" value={unitForm.tenantId} onChange={e => setUnitForm(f => ({ ...f, tenantId: e.target.value }))}>
            <option value="">No tenant</option>
            {tenants.filter(t => t.propertyId === manageProperty.id).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Notes</label>
          <textarea className="field-input" rows={2} value={unitForm.notes} onChange={e => setUnitForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
        </div>

        <div className="flex gap-2">
          <button className="btn-primary btn flex-1" onClick={handleSaveUnit}>
            <Check size={12} /> {editingUnitId === 'new' ? 'Add unit' : 'Save'}
          </button>
          <button className="btn" onClick={() => { setEditingUnitId(null); resetUnitForm() }}>
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  async function handleAddProperty() {
    const parsedTotal = Number(form.totalUnits)
    const parsedOccupied = Number(form.occupiedUnits)
    const parsedRevenue = Number(form.monthlyRevenue)

    if (!form.name.trim() || !form.location.trim()) {
      showToast('error', 'Property name and location are required.')
      return
    }

    if (!Number.isFinite(parsedTotal) || !Number.isFinite(parsedOccupied) || !Number.isFinite(parsedRevenue) || parsedTotal < 1 || parsedOccupied < 0 || parsedOccupied > parsedTotal || parsedRevenue < 0) {
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
          const pct = p.totalUnits > 0 ? Math.round((p.occupiedUnits / p.totalUnits) * 100) : 0
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

      <Modal open={!!manageId} onClose={() => { setManageId(null); setEditingUnitId(null) }} title={manageProperty ? `Manage Units - ${manageProperty.name}` : 'Manage Units'} size="lg"
        footer={<button className="btn-primary btn" onClick={() => { setManageId(null); setEditingUnitId(null) }}>Done</button>}>
        {manageProperty && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button className="btn-primary btn btn-sm" onClick={openAddUnit}>
                <Plus size={12} /> Add unit
              </button>
            </div>

            {managePropertyUnits.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No units created yet for this property.</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Add the first unit to start tracking rent, occupancy, and tenants.</p>
              </div>
            )}

            {editingUnitId === 'new' && (
              <div className="rounded-lg p-4" style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)' }}>
                {renderUnitForm()}
              </div>
            )}
            
            {managePropertyUnits.map((unit) => {
              const tenant = getTenantForUnit(unit)
              const isEditing = editingUnitId === unit.id
              
              return (
                <div key={unit.id} className="rounded-lg p-4" style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)' }}>
                  {!isEditing ? (
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {unit.unitName || 'Unnamed Unit'}
                          </h4>
                          {unit.unitNumber && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Unit #{unit.unitNumber}</p>
                          )}
                          {unit.floor && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{unit.floor}</p>
                          )}
                        </div>
                        <span className={`badge ${unit.status === 'occupied' ? 'badge-active' : unit.status === 'maintenance' ? 'badge-pending' : 'badge-low'}`}>
                          {unit.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        {unit.bedrooms !== undefined && unit.bedrooms > 0 && (
                          <div><span style={{ color: 'var(--text-muted)' }}>Bedrooms:</span> <strong>{unit.bedrooms}</strong></div>
                        )}
                        {unit.bathrooms !== undefined && unit.bathrooms > 0 && (
                          <div><span style={{ color: 'var(--text-muted)' }}>Bathrooms:</span> <strong>{unit.bathrooms}</strong></div>
                        )}
                        {unit.squareFeet && (
                          <div><span style={{ color: 'var(--text-muted)' }}>Sq Ft:</span> <strong>{unit.squareFeet}</strong></div>
                        )}
                        <div><span style={{ color: 'var(--text-muted)' }}>Rent:</span> <strong>{fmtK(unit.rentAmount)}</strong></div>
                      </div>

                      {tenant && (
                        <div className="flex items-center gap-2 p-2 rounded mb-3" style={{ background: 'var(--bg-card)' }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          <div className="flex-1">
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{tenant.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tenant.email}</p>
                          </div>
                        </div>
                      )}

                      {unit.notes && (
                        <p className="text-xs mb-3 p-2 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                          {unit.notes}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button className="btn btn-sm flex-1" onClick={() => openEditUnit(unit)}>
                          <Edit3 size={12} /> Edit
                        </button>
                        <button className="btn btn-sm" onClick={() => handleDeleteUnit(unit.id, unit.unitName || 'this unit')}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ) : renderUnitForm()}
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      <Modal open={!!editOpen} onClose={() => { setEditOpen(false); setEditId(null) }} title="Edit Property"
        footer={<><button className="btn" onClick={() => { setEditOpen(false); setEditId(null) }}>Cancel</button><button className="btn-primary btn" onClick={async () => {
          if (!editProperty) return
          const parsedTotal = Number(editForm.totalUnits)
          const parsedOccupied = Number(editForm.occupiedUnits)
          const parsedRevenue = Number(editForm.monthlyRevenue)
          if (!editForm.name.trim() || !editForm.location.trim()) {
            showToast('error', 'Property name and location are required.')
            return
          }
          if (!Number.isFinite(parsedTotal) || !Number.isFinite(parsedOccupied) || !Number.isFinite(parsedRevenue) || parsedTotal < 1 || parsedOccupied < 0 || parsedOccupied > parsedTotal || parsedRevenue < 0) {
            showToast('error', 'Check total and occupied unit counts.')
            return
          }
          if (!window.confirm(`Save changes for ${editForm.name}?`)) return
          try {
            await updateProperty(editProperty.id, {
              name: editForm.name.trim(), location: editForm.location.trim(), type: editForm.type,
              totalUnits: parsedTotal, occupiedUnits: parsedOccupied, monthlyRevenue: parsedRevenue,
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
