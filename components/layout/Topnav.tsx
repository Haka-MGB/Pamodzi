'use client'
import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Bell, Search, Sun, Moon, ChevronDown, User, Settings, HelpCircle, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/payments': 'Payments',
  '/tenants': 'Tenants',
  '/properties': 'Properties',
  '/maintenance': 'Maintenance',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

interface TopnavProps {
  onMenuClick?: () => void
}

export default function Topnav({ onMenuClick }: TopnavProps) {
  const {
    user, tenants, notifications, unreadCount, darkMode, toggleDark,
    logout, markAllNotificationsRead, markNotificationRead, showToast,
  } = useApp()
  const pathname = usePathname()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const pageTitle = BREADCRUMBS[pathname] ?? 'Pamodzi'

  const searchResults = search.trim().length > 0
    ? tenants.filter(t => {
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) ||
          t.unit.toLowerCase().includes(q) ||
          t.propertyName.toLowerCase().includes(q)
      }).slice(0, 8)
    : []

  useEffect(() => {
    setActiveSearchIndex(0)
  }, [searchResults.length])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSearchSelection(result: (typeof tenants)[number]) {
    setSearch('')
    setSearchOpen(false)
    router.push('/tenants')
    showToast('success', `Showing tenant ${result.name}`)
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!searchResults.length) {
      if (e.key === 'Escape') setSearchOpen(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSearchIndex(prev => (prev + 1) % searchResults.length)
      setSearchOpen(true)
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length)
      setSearchOpen(true)
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchSelection(searchResults[activeSearchIndex])
    }

    if (e.key === 'Escape') setSearchOpen(false)
  }

  function handleLogout() {
    if (!window.confirm('Are you sure you want to sign out?')) return
    logout()
    router.replace('/login')
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-[58px] flex-shrink-0 items-center justify-between gap-3 px-4 sm:px-7"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)' }}
    >
      <div className="flex min-w-0 items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-all md:hidden"
          aria-label="Open navigation"
          style={{ border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
        >
          <Menu size={16} />
        </button>
        <span className="hidden sm:inline">Home</span>
        <span className="truncate" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageTitle}</span>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="search-box relative hidden sm:flex">
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => {
              const value = e.target.value
              setSearch(value)
              setSearchOpen(value.trim().length > 0)
            }}
            placeholder="Search tenants, units..."
            onFocus={() => setSearchOpen(search.trim().length > 0)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
            onKeyDown={handleSearchKeyDown}
            aria-label="Search tenants and units"
          />
          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-lg shadow-black/5">
              {searchResults.length > 0 ? (
                <div className="max-h-72 overflow-y-auto scrollbar-hide">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      type="button"
                      className={cn(
                        'w-full px-3.5 py-3 text-left transition-colors',
                        index === activeSearchIndex ? 'bg-[var(--bg-page)]' : 'hover:bg-[var(--bg-surface-hover)]',
                      )}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => handleSearchSelection(result)}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{result.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.unit} - {result.propertyName}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3.5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>No tenants or units found.</div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleDark}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
        >
          {darkMode ? <Sun size={13} /> : <Moon size={13} />}
          <span className="hidden lg:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>

        <div ref={notifRef} className="relative overflow-visible">
          <button
            type="button"
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all"
            aria-label="Open notifications"
            style={{ border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute right-1 top-1 h-2 w-2 rounded-full border-2"
                style={{ background: '#C35D3A', borderColor: 'var(--bg-surface)' }}
              />
            )}
          </button>

          <div
            className={cn(
              'fixed left-4 right-4 top-[66px] z-50 overflow-hidden rounded-xl transition-all duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80',
              notifOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-2 opacity-0 pointer-events-none',
            )}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
              <button
                type="button"
                className="text-xs font-semibold"
                style={{ color: 'var(--accent-primary)' }}
                onClick={() => markAllNotificationsRead().catch(() => showToast('error', 'Unable to update notifications.'))}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  You are all caught up.
                </div>
              )}
              {notifications.slice(0, 6).map(n => (
                <button
                  key={n.id}
                  type="button"
                  className={cn('flex w-full gap-3 px-4 py-3 text-left transition-all', !n.read && 'bg-[var(--accent-primary-gl)]')}
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                  onClick={() => markNotificationRead(n.id).catch(() => showToast('error', 'Unable to update notification.'))}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      n.type === 'success' && 'bg-green-100 text-green-700',
                      n.type === 'warning' && 'bg-amber-100 text-amber-700',
                      n.type === 'error' && 'bg-red-100 text-red-700',
                      n.type === 'info' && 'bg-blue-100 text-blue-700',
                    )}
                  >
                    {n.type === 'success' ? 'OK' : n.type === 'warning' ? '!' : n.type === 'error' ? '!' : 'i'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                    <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                  </div>
                  {!n.read && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: 'var(--accent-primary)' }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={profileRef} className="relative overflow-visible">
          <button
            type="button"
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all hover:bg-[var(--bg-surface-hover)]"
            style={{ border: '1px solid transparent', color: 'var(--text-primary)' }}
            aria-label="Open account menu"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: 'var(--accent-primary)' }}>
              {user.initials || 'PM'}
            </div>
            <span className="hidden text-sm font-semibold sm:inline">{user.name.split(' ')[0] || 'Account'}</span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          <div
            className={cn(
              'fixed left-4 right-4 top-[66px] z-50 overflow-hidden rounded-xl transition-all duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-48',
              profileOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-2 opacity-0 pointer-events-none',
            )}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
          >
            {[
              { icon: User, label: 'My profile', onClick: () => { router.push('/settings'); setProfileOpen(false) } },
              { icon: Settings, label: 'Settings', onClick: () => { router.push('/settings'); setProfileOpen(false) } },
              { icon: HelpCircle, label: 'Help', onClick: () => showToast('info', 'Help centre opening...') },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-[var(--bg-page)]"
                style={{ color: 'var(--text-secondary)' }}
                onClick={item.onClick}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-red-50"
              style={{ color: '#C35D3A' }}
              onClick={handleLogout}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
