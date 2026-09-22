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
  })

  const totalRevenue = properties.reduce((s, p) => s + p.monthlyRevenue, 0)
  const totalUnits = properties.reduce((s, p) => s + p.totalUnits, 0)
  const occupiedUnits = properties.reduce((s, p) => s + p.occupiedUnits, 0)
  const detailProperty = properties.find(p => p.id === detailId)
  const manageProperty = properties.find(p => p.id === manageId)
  const managePropertyUnits = manageProperty ? units.filter(u => u.propertyId === manageProperty.id) : []
  const editProperty = properties.find(p => p.id === editId)
  const editingUnit = units.find(u => u.id === editingUnitId)
  const [editForm, setEditForm] = useState({ name: '', location: '', type: 'Residential', totalUnits: '8' })
  const [unitForm, setUnitForm] = useState({
    unitName: '',
    rentAmount: '0',
    status: 'vacant' as 'vacant' | 'occupied' | 'maintenance',
    notes: '',
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')

  // Check if can add more units based on totalUnits limit
  const canAddMoreUnits = (property: typeof manageProperty) => {
    if (!property) return false
    if (property.totalUnits === 0) return true // Unlimited
    const existingCount = units.filter(u => u.propertyId === property.id).length
    return existingCount < property.totalUnits
  }

  function resetUnitForm() {
    setUnitForm({
      unitName: '',
      rentAmount: '0',
      status: 'vacant',
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
      rentAmount: String(unit.rentAmount || 0),
      status: unit.status || 'vacant',
      notes: unit.notes || '',
    })
  }

  async function handleSaveUnit() {
    if (!editingUnitId || !manageProperty) return
    if (!unitForm.unitName.trim()) {
      showToast('error', 'Unit name is required.')
      return
    }

    const rentAmount = Number(unitForm.rentAmount)
    if (!Number.isFinite(rentAmount) || rentAmount < 0) {
      showToast('error', 'Please enter a valid rent amount.')
      return
    }

    try {
      const payload = {
        propertyId: manageProperty.id,
        unitName: unitForm.unitName.trim(),
        rentAmount: rentAmount,
        status: unitForm.status,
        notes: unitForm.notes.trim() || undefined,
      }

      if (editingUnitId === 'new') {
        // Check if can add more units
        if (!canAddMoreUnits(manageProperty)) {
          showToast('error', `Cannot add more units. This property has a limit of ${manageProperty.totalUnits} units.`)
          return
        }
        
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
          <input 
            className="field-input" 
            value={unitForm.unitName} 
            onChange={e => setUnitForm(f => ({ ...f, unitName: e.target.value }))} 
            placeholder="e.g. Apartment 2A, Shop 1, House on the Left" 
          />
        </div>
        
        <div className="field">
          <label className="field-label">Rent Amount (ZMW) *</label>
          <input 
            type="number" 
            min={0} 
            className="field-input" 
            value={unitForm.rentAmount} 
            onChange={e => setUnitForm(f => ({ ...f, rentAmount: e.target.value }))} 
            placeholder="e.g. 2000"
          />
        </div>

        <div className="field">
          <label className="field-label">Status</label>
          <select 
            className="field-select" 
            value={unitForm.status} 
            onChange={e => setUnitForm(f => ({ ...f, status: e.target.value as typeof unitForm.status }))}
          >
            <option value="maintenance">Maintenance</option>
          </select>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Vacant and occupied are derived automatically from whether a tenant is assigned.
          </p>
        </div>

        <div className="field">
          <label className="field-label">Notes</label>
          <textarea 
            className="field-input" 
            rows={2} 
            value={unitForm.notes} 
            onChange={e => setUnitForm(f => ({ ...f, notes: e.target.value }))} 
            placeholder="Additional information about this unit..." 
          />
        </div>

        <div className="flex gap-2">
          <button className="btn-primary btn flex-1" onClick={handleSaveUnit}>
            <Check size={12} /> {editingUnitId === 'new' ? 'Add unit' : 'Save changes'}
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

    if (!form.name.trim() || !form.location.trim()) {
      showToast('error', 'Property name and location are required.')
      return
    }

    if (!Number.isFinite(parsedTotal) || parsedTotal < 1) {
      showToast('error', 'Total units must be at least 1.')
      return
    }

    if (!window.confirm(`Save ${form.name} as a new property?`)) return

    try {
      await addProperty({
        name: form.name.trim(),
        location: form.location.trim(),
        type: form.type,
        totalUnits: parsedTotal,
        occupiedUnits: 0,        // ✅ Always start at 0 (will be calculated)
        monthlyRevenue: 0,       // ✅ Always start at 0 (will be calculated)
      })
      showToast('success', `${form.name} added.`)
      setAddOpen(false)
      setForm({ name: '', location: '', type: 'Residential', totalUnits: '8' })
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
                  <button className="btn btn-sm" onClick={() => { setEditId(p.id); setEditForm({ name: p.name, location: p.location, type: p.type, totalUnits: String(p.totalUnits) }); setEditOpen(true) }}><Settings2 size={12}/> Edit</button>
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
          <div className="field">
            <label className="field-label">Total Units *</label>
            <input type="number" min={1} className="field-input" value={form.totalUnits} onChange={e => setForm(f => ({ ...f, totalUnits: e.target.value }))} placeholder="e.g. 8" />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              How many units does this property have?
            </p>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <strong>Note:</strong> Occupied units and monthly revenue will be automatically 
              calculated based on the units you create and tenants you add.
            </p>
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

      <Modal open={!!manageId} onClose={() => { setManageId(null); setEditingUnitId(null); resetUnitForm() }} title={manageProperty ? `Manage Units - ${manageProperty.name}` : 'Manage Units'} size="lg"
        footer={<button className="btn-primary btn" onClick={() => { setManageId(null); setEditingUnitId(null); resetUnitForm() }}>Done</button>}>
        {manageProperty && (
          <div className="space-y-3">
            {/* Unit Count Status */}
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {managePropertyUnits.length} of {manageProperty.totalUnits === 0 ? '∞' : manageProperty.totalUnits} units created
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {managePropertyUnits.length === 0 && manageProperty.totalUnits > 0 && `Create ${manageProperty.totalUnits} units to match your property setup`}
                    {managePropertyUnits.length > 0 && managePropertyUnits.length < manageProperty.totalUnits && `${manageProperty.totalUnits - managePropertyUnits.length} more units to create`}
                    {managePropertyUnits.length > 0 && managePropertyUnits.length >= manageProperty.totalUnits && manageProperty.totalUnits > 0 && 'All units created. You can edit them below.'}
                    {manageProperty.totalUnits === 0 && 'No limit - create as many units as needed'}
                  </p>
                </div>
                {canAddMoreUnits(manageProperty) && !editingUnitId && (
                  <button className="btn-primary btn btn-sm" onClick={openAddUnit}>
                    <Plus size={12} /> Add unit
                  </button>
                )}
              </div>
            </div>

            {managePropertyUnits.length === 0 && !editingUnitId && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
                  <DoorOpen size={32} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No units created yet</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  {manageProperty.totalUnits > 0 
                    ? `Start by creating your first unit. You need ${manageProperty.totalUnits} units total.`
                    : 'Start by creating your first unit. You can add as many as you need.'}
                </p>
                {canAddMoreUnits(manageProperty) && (
                  <button className="btn-primary btn" onClick={openAddUnit}>
                    <Plus size={12} /> Create first unit
                  </button>
                )}
              </div>
            )}

            {editingUnitId === 'new' && (
              <div className="rounded-lg p-4" style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)' }}>
                <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Add New Unit</h4>
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
                        </div>
                        <span className={`badge ${unit.status === 'occupied' ? 'badge-active' : unit.status === 'maintenance' ? 'badge-pending' : 'badge-low'}`}>
                          {unit.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rent Amount:</span>
                          <strong className="text-sm" style={{ color: 'var(--text-primary)' }}>{fmtK(unit.rentAmount)}/month</strong>
                        </div>
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
                          <strong>Notes:</strong> {unit.notes}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button className="btn btn-sm flex-1" onClick={() => openEditUnit(unit)}>
                          <Edit3 size={12} /> Edit
                        </button>
                        <button className="btn btn-sm" onClick={() => handleDeleteUnit(unit.id, unit.unitName || 'this unit')}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Edit Unit</h4>
                      {renderUnitForm()}
                    </div>
                  )}
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
          if (!editForm.name.trim() || !editForm.location.trim()) {
            showToast('error', 'Property name and location are required.')
            return
          }
          if (!Number.isFinite(parsedTotal) || parsedTotal < 1) {
            showToast('error', 'Total units must be at least 1.')
            return
          }
          if (!window.confirm(`Save changes for ${editForm.name}?`)) return
          try {
            await updateProperty(editProperty.id, {
              name: editForm.name.trim(), 
              location: editForm.location.trim(), 
              type: editForm.type,
              totalUnits: parsedTotal,
              occupiedUnits: editProperty.occupiedUnits, // Keep existing (will be recalculated on load)
              monthlyRevenue: editProperty.monthlyRevenue, // Keep existing (will be recalculated on load)
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
            <div className="field">
              <label className="field-label">Total Units *</label>
              <input type="number" min={1} className="field-input" value={editForm.totalUnits} onChange={e => setEditForm(f => ({ ...f, totalUnits: e.target.value }))} />
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong>Note:</strong> Occupied units and monthly revenue are automatically calculated and cannot be edited manually.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
