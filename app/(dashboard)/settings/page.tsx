'use client'
import { useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { User, Shield, Bell, Settings2, Camera } from 'lucide-react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative w-10 h-6 rounded-full transition-all cursor-pointer border-0 flex-shrink-0"
      style={{ background: checked ? 'var(--accent-primary)' : 'var(--border-medium)' }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
            style={{ left: checked ? '18px' : '2px' }} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, darkMode, toggleDark, showToast } = useApp()
  const [notifs, setNotifs] = useState({ email: true, sms: true, maintenance: true, lease: true, digest: false })
  const [photoName, setPhotoName] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  function handleSaveSettings() {
    if (!window.confirm('Save these settings changes?')) return
    showToast('success','Settings saved successfully.')
  }

  function handleUpdatePassword() {
    if (!window.confirm('Save this password change?')) return
    showToast('success','Password updated.')
  }

  function handleTogglePreference(key: keyof typeof notifs) {
    if (!window.confirm('Save this notification preference change?')) return
    setNotifs(n => ({ ...n, [key]: !n[key] }))
    showToast('info','Preference saved.')
  }

  function handleToggleDarkMode() {
    if (!window.confirm('Save this theme preference change?')) return
    toggleDark()
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Account, notifications & system preferences</p>
        </div>
        <button className="btn-primary btn" onClick={handleSaveSettings}> Save changes</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Profile */}
        <div>
          <div className="panel mb-5">
            <div className="panel-header"><User size={14} style={{ color: 'var(--accent-primary)' }} /><span className="panel-title">Profile information</span></div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 relative"
                     style={{ background: 'var(--accent-primary)' }}>
                  {user.initials}
                  <button onClick={() => showToast('info','Photo upload coming in live version.')}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'var(--accent-primary)', border: '2px solid var(--bg-surface)' }}>
                    <Camera size={10} />
                  </button>
                </div>
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.role} · {user.location}</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  ['Full name', 'text', user.name],
                  ['Email', 'email', user.email],
                  ['Phone', 'tel', user.phone],
                  ['Company / Entity', 'text', user.company],
                ].map(([label, type, val]) => (
                  <div key={label} className="field">
                    <label className="field-label">{label}</label>
                    <input type={type} defaultValue={val} className="field-input" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="panel">
            <div className="panel-header"><Shield size={14} style={{ color: 'var(--accent-primary)' }} /><span className="panel-title">Security</span></div>
            <div className="p-5 space-y-4">
              {['Current password','New password','Confirm new password'].map(label => (
                <div key={label} className="field">
                  <label className="field-label">{label}</label>
                  <input type="password" placeholder="••••••••" className="field-input" />
                </div>
              ))}
              <button className="btn" onClick={handleUpdatePassword}>Update password</button>
            </div>
          </div>
        </div>

        <div>
          {/* Notifications */}
          <div className="panel mb-5">
            <div className="panel-header"><Bell size={14} style={{ color: 'var(--accent-primary)' }} /><span className="panel-title">Notifications</span></div>
            <div className="p-5">
              {[
                { key:'email',       label:'Email alerts for overdue rent',     sub:'Receive email when rent is overdue' },
                { key:'sms',         label:'SMS alerts via mobile money',        sub:'Get notified of payments received' },
                { key:'maintenance', label:'Maintenance request alerts',         sub:'New maintenance tickets by email' },
                { key:'lease',       label:'Lease expiry reminders',             sub:'30-day advance warning emails' },
                { key:'digest',      label:'Monthly statement digest',           sub:'PDF summary at month end' },
              ].map(({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                  </div>
                  <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => handleTogglePreference(key as keyof typeof notifs)} />
                </div>
              ))}
            </div>
          </div>

          {/* System */}
          <div className="panel">
            <div className="panel-header"><Settings2 size={14} style={{ color: 'var(--accent-primary)' }} /><span className="panel-title">System preferences</span></div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dark mode</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Toggle between light and dark theme</p>
                </div>
                <Toggle checked={darkMode} onChange={handleToggleDarkMode} />
              </div>
              {[
                { label:'Currency', opts:['ZMW — Zambian Kwacha (K)','USD — US Dollar ($)'] },
                { label:'Date format', opts:['DD MMM YYYY','MM/DD/YYYY','YYYY-MM-DD'] },
                { label:'Late fee policy', opts:['Auto-charge after 5 days','Auto-charge after 7 days','Manual only'] },
              ].map(({ label, opts }) => (
                <div key={label} className="field">
                  <label className="field-label">{label}</label>
                  <select className="field-select">{opts.map(o=><option key={o}>{o}</option>)}</select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
