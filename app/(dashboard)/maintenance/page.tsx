'use client'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Flame, AlertTriangle, Wrench, CheckCircle, Plus } from 'lucide-react'
import { priorityIcon } from '@/lib/utils'
import type { IssueStatus } from '@/types'

const ICONS: Record<string, string> = {
  home: '🏠', droplet: '💧', zap: '⚡', lock: '🔒', 'paint-bucket': '🎨', wrench: '🔧',
}

export default function MaintenancePage() {
  const { issues, tenants, addIssue, updateIssue, showToast } = useApp()
  const [statusFilter,    setStatusFilter]    = useState<string>('all')
  const [priorityFilter,  setPriorityFilter]  = useState<string>('all')
  const [updateId,        setUpdateId]        = useState<string | null>(null)
  const [newStatus,       setNewStatus]       = useState<IssueStatus>('open')
  const [addOpen,         setAddOpen]         = useState(false)
  const [form, setForm] = useState({ title:'', description:'', tenantId:'', category:'Plumbing', priority:'medium', status:'open' as IssueStatus })

  const filtered = issues.filter(i => {
    const matchStatus   = statusFilter   === 'all' || i.status   === statusFilter
    const matchPriority = priorityFilter === 'all' || i.priority === priorityFilter
    return matchStatus && matchPriority
  })

  const urgentCount   = issues.filter(i => i.priority === 'urgent').length
  const highCount     = issues.filter(i => i.priority === 'high').length
  const inProgCount   = issues.filter(i => i.status   === 'in-progress').length
  
  // Calculate resolved issues this month
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const resolvedMonth = issues.filter(i => {
    if (i.status !== 'resolved' || !i.date) return false
    // If date is a relative string like "Just now", "4d", count it as this month
    if (i.date.includes('ago') || i.date.includes('Just now') || i.date.match(/^\d+[dhm]$/)) return true
    // Otherwise try to parse as date
    const issueDate = new Date(i.date)
    return issueDate >= currentMonthStart
  }).length

  const updatingIssue = issues.find(i => i.id === updateId)

  async function handleStatusUpdate() {
    if (!updateId) return
    if (!window.confirm(`Save this work order status as ${newStatus}?`)) return
    try {
      await updateIssue(updateId, { status: newStatus })
      showToast('success', 'Issue status updated.')
      setUpdateId(null)
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to update issue.')
    }
  }

  async function handleAddIssue() {
    const tenant = tenants.find(t => t.id === form.tenantId)
    if (!form.title || !tenant) { showToast('error', 'Title and tenant are required'); return }
    if (!window.confirm(`Save this maintenance issue for ${tenant.name}?`)) return
    try {
      await addIssue({
        title: form.title, description: form.description,
        tenant: tenant.name, tenantId: tenant.id,
        unit: `${tenant.unit} · ${tenant.propertyName}`,
        category: form.category, priority: form.priority as any,
        status: form.status, date: 'Just now', icon: 'wrench',
      })
      showToast('success', 'Issue logged successfully.')
      setAddOpen(false)
      setForm({ title:'', description:'', tenantId:'', category:'Plumbing', priority:'medium', status:'open' })
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to log issue.')
    }
  }

  const PRIORITY_ORDER: Record<string,number> = { urgent:0, high:1, medium:2, low:3 }
  const sorted = [...filtered].sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Maintenance</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{issues.filter(i=>i.status==='open').length} open · {inProgCount} in progress</p>
        </div>
        <button className="btn-primary btn" onClick={() => setAddOpen(true)}><Plus size={13} /> Log issue</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Flame size={18}/>}          value={String(urgentCount)}     label="Urgent"              accentColor="#C35D3A" />
        <StatCard icon={<AlertTriangle size={18}/>}   value={String(highCount)}       label="High priority"       accentColor="#D9A13B" />
        <StatCard icon={<Wrench size={18}/>}          value={String(inProgCount)}     label="In progress"         accentColor="#4A90D9" />
        <StatCard icon={<CheckCircle size={18}/>}     value={String(resolvedMonth)}   label="Resolved this month" />
      </div>

      <div className="panel">
        <div className="panel-header flex-wrap gap-2">
          <span className="panel-title">Work orders</span>
          <div className="flex gap-2 flex-wrap ml-auto">
            {['all','open','in-progress','resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all border ${statusFilter===s ? 'border-transparent text-white' : 'border-[var(--border-light)] text-[var(--text-secondary)]'}`}
                style={{ background: statusFilter===s ? 'var(--accent-primary)' : 'transparent' }}>
                {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
            {['all','urgent','high','medium','low'].map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer transition-all border ${priorityFilter===p ? 'border-transparent text-white' : 'border-[var(--border-light)] text-[var(--text-secondary)]'}`}
                style={{ background: priorityFilter===p ? '#D9A13B' : 'transparent', display: p==='all'&&priorityFilter!=='all'?'none':undefined }}>
                {p === 'all' ? 'All priority' : priorityIcon(p)+' '+p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="scroll-panel">
        {sorted.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}><p className="text-2xl mb-2">🔧</p><p className="text-sm font-medium">No issues match filters</p></div>
        ) : sorted.map(issue => (
          <div key={issue.id} className="flex gap-4 px-5 py-4 transition-all cursor-pointer"
            style={{ borderBottom: '1px solid var(--border-light)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-page)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
              issue.priority==='urgent' ? 'bg-red-100' : issue.priority==='high' ? 'bg-amber-100' : issue.priority==='medium' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              {ICONS[issue.icon] ?? '🔧'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{issue.tenant} · {issue.unit} · {issue.category} · Reported {issue.date}</p>
              {issue.assignee && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>👷 {issue.assignee}</p>}
              <div className="flex gap-1.5 mt-1.5">
                <Badge status={issue.status === 'in-progress' ? 'in-progress' : issue.status} />
                <Badge status={issue.priority} />
              </div>
            </div>
            <div className="flex gap-2 items-start flex-shrink-0">
              <button className="btn btn-sm" onClick={() => { setUpdateId(issue.id); setNewStatus(issue.status) }}>Update status</button>
              <button className="btn-primary btn btn-sm" onClick={() => showToast('info', 'Assigning contractor…')}>Assign</button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal open={!!updateId} onClose={() => setUpdateId(null)} title="Update Issue Status"
        footer={<><button className="btn" onClick={() => setUpdateId(null)}>Cancel</button><button className="btn-primary btn" onClick={handleStatusUpdate}>Save update</button></>}>
        {updatingIssue && (
          <div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{updatingIssue.title}</strong>
              <br/>{updatingIssue.unit} · {updatingIssue.tenant}
            </p>
            <div className="field">
              <label className="field-label">New status</label>
              <select className="field-select" value={newStatus} onChange={e => setNewStatus(e.target.value as IssueStatus)}>
                <option value="open">Open</option>
                <option value="in-progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Update notes</label>
              <textarea className="field-textarea" placeholder="Add notes for the record…" />
            </div>
          </div>
        )}
      </Modal>

      {/* Log Issue Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Log Maintenance Issue" size="lg"
        footer={<><button className="btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn-primary btn" onClick={handleAddIssue}>Log issue</button></>}>
        {tenants.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>You need to add at least one tenant first.</p>
            <button className="btn-primary btn mt-3" onClick={() => { setAddOpen(false); }}>
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
          <div className="field"><label className="field-label">Issue title *</label><input className="field-input" placeholder="e.g. Broken window in bedroom" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="field-label">Tenant *</label>
              <select className="field-select" value={form.tenantId} onChange={e => setForm(f=>({...f,tenantId:e.target.value}))}>
                <option value="">Select tenant…</option>
                {tenants.map(t=><option key={t.id} value={t.id}>{t.name} — {t.unit}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Category</label>
              <select className="field-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {['Plumbing','Electrical','Roof','Security','Appliances','General'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {['urgent','high','medium','low'].map(p => (
                <button key={p} type="button"
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${form.priority===p ? 'border-transparent text-white' : 'border-[var(--border-light)]'}`}
                  style={{ background: form.priority===p ? (p==='urgent'?'#C35D3A':p==='high'?'#D9A13B':p==='medium'?'#4A90D9':'#2D6A4F') : 'var(--bg-page)', color: form.priority===p?'white':'var(--text-secondary)' }}
                  onClick={() => setForm(f=>({...f,priority:p}))}>
                  {priorityIcon(p)} {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label className="field-label">Description</label><textarea className="field-textarea" placeholder="Describe the issue in detail…" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} /></div>
        </div>
        )}
      </Modal>
    </div>
  )
}
