'use client'
import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Bell, Search, Sun, Moon, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const BREADCRUMBS: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/payments':    'Payments',
  '/tenants':     'Tenants',
  '/properties':  'Properties',
  '/maintenance': 'Maintenance',
  '/reports':     'Reports',
  '/settings':    'Settings',
}

export default function Topnav() {
  const { user, notifications, unreadCount, darkMode, toggleDark,
          logout, markAllNotificationsRead, markNotificationRead, showToast } = useApp()
  const pathname  = usePathname()
  const router    = useRouter()
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [search,      setSearch]      = useState('')
  const notifRef   = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const pageTitle = BREADCRUMBS[pathname] ?? 'Pamodzi'

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleLogout() {
    if (!window.confirm('Are you sure you want to sign out?')) return
    logout()
    router.replace('/login')
  }

  const unread = notifications.filter(n => !n.read)

  return (
    <header className="flex items-center justify-between gap-4 px-7 h-[58px] flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>⌂</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageTitle}</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Search */}
        <div className="search-box">
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tenants, units…"
            onKeyDown={e => { if (e.key === 'Enter' && search.trim()) { showToast('info', `Searching for "${search}"…`); setSearch('') } }}
          />
        </div>

        {/* Dark mode */}
        <button onClick={toggleDark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
          {darkMode ? <Sun size={13} /> : <Moon size={13} />}
          <span>{darkMode ? 'Light' : 'Dark'}</span>
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            style={{ border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
                style={{ background: '#C35D3A', borderColor: 'var(--bg-surface)' }} />
            )}
          </button>

          {/* Notif panel */}
          <div className={cn(
            'absolute top-11 right-0 w-80 rounded-xl overflow-hidden z-50 transition-all duration-200',
            notifOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
          )} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-light)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
              <button className="text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
                onClick={() => markAllNotificationsRead()}>
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {notifications.slice(0, 6).map(n => (
                <div key={n.id}
                  className={cn('flex gap-3 px-4 py-3 cursor-pointer transition-all', !n.read && 'bg-[var(--accent-primary-gl)]')}
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                  onClick={() => markNotificationRead(n.id)}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0',
                    n.type === 'success' && 'bg-green-100 text-green-700',
                    n.type === 'warning' && 'bg-amber-100 text-amber-700',
                    n.type === 'error'   && 'bg-red-100   text-red-700',
                    n.type === 'info'    && 'bg-blue-100  text-blue-700',
                  )}>
                    {n.type === 'success' ? '✓' : n.type === 'warning' ? '⚠' : n.type === 'error' ? '!' : 'i'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent-primary)' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{ border: '1px solid transparent', color: 'var(--text-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                 style={{ background: 'var(--accent-primary)' }}>
              {user.initials}
            </div>
            <span className="text-sm font-semibold">{user.name.split(' ')[0]}</span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          <div className={cn(
            'absolute top-11 right-0 w-48 rounded-xl overflow-hidden z-50 transition-all duration-200',
            profileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
          )} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}>
            {[
              { icon: User,        label: 'My profile', onClick: () => { router.push('/settings'); setProfileOpen(false) } },
              { icon: Settings,    label: 'Settings',   onClick: () => { router.push('/settings'); setProfileOpen(false) } },
              { icon: HelpCircle,  label: 'Help',       onClick: () => showToast('info', 'Help centre opening…') },
            ].map(item => (
              <button key={item.label}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all cursor-pointer"
                style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', fontFamily: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-page)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={item.onClick}>
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all cursor-pointer"
              style={{ color: '#C35D3A', background: 'transparent', border: 'none', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(195,93,58,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={handleLogout}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
