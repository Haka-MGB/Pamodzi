'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import {
  LayoutDashboard, CreditCard, Users, Building2,
  Wrench, FileBarChart2, Settings, Menu, LogOut, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
      { label: 'Payments',    href: '/payments',    icon: CreditCard,    badge: 'payments' },
      { label: 'Tenants',     href: '/tenants',     icon: Users },
      { label: 'Properties',  href: '/properties',  icon: Building2 },
      { label: 'Maintenance', href: '/maintenance', icon: Wrench,        badge: 'maintenance' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Reports', href: '/reports', icon: FileBarChart2 },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, user, payments, issues, logout } = useApp()
  const pathname = usePathname()

  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const openIssues      = issues.filter(i => i.status !== 'resolved').length

  function getBadge(key?: string) {
    if (key === 'payments'    && pendingPayments > 0) return pendingPayments
    if (key === 'maintenance' && openIssues      > 0) return openIssues
    return null
  }

  function handleLogout() {
    if (!window.confirm('Are you sure you want to sign out?')) return
    logout()
    window.location.href = '/login'
  }

  const sidebar = (
    <aside
      className={cn(
        'flex h-full max-h-[100dvh] min-h-0 flex-col overflow-hidden transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0',
        mobileOpen ? 'w-[280px]' : 'hidden md:flex',
        !mobileOpen && (sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'),
      )}
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-light)' }}
    >
      {/* Logo row */}
      <div className={cn(
        'flex items-center h-[58px] px-4 flex-shrink-0',
        sidebarCollapsed ? 'justify-center' : 'justify-between',
      )} style={{ borderBottom: '1px solid var(--border-light)' }}>
        {!sidebarCollapsed && (
          <div>
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent-primary)', letterSpacing: '-0.03em' }}>
              PAMODZI
            </span>
            <p className="text-[9px] font-normal uppercase tracking-widest leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Property Platform
            </p>
          </div>
        )}
        <button onClick={mobileOpen ? onMobileClose : toggleSidebar}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
          aria-label={mobileOpen ? 'Close navigation' : 'Toggle sidebar'}
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
          {mobileOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4 scrollbar-hide space-y-0.5"
        style={{ WebkitOverflowScrolling: 'touch' }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 pt-3 pb-1.5"
                 style={{ color: 'var(--text-muted)' }}>
                {section.label}
              </p>
            )}
            {section.items.map(item => {
              const Icon    = item.icon
              const active  = pathname === item.href || pathname.startsWith(item.href + '/')
              const badge   = getBadge((item as any).badge)
              return (
                <Link key={item.href} href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={onMobileClose}
                  className={cn('nav-item', active && 'active', sidebarCollapsed && 'justify-center px-3')}>
                  <Icon size={17} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                  {!sidebarCollapsed && badge !== null && (
                    <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center text-white"
                          style={{ background: 'var(--accent-secondary)' }}>
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-2.5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className={cn('flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)]',
          sidebarCollapsed && 'justify-center')}
          onClick={() => window.location.href = '/settings'}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
               style={{ background: 'var(--accent-primary)' }}>
            {user.initials}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user.role} · {user.location}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); handleLogout() }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color: 'var(--text-muted)' }}
                title="Sign out">
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )

  if (!mobileOpen) return sidebar

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close navigation"
        onClick={onMobileClose}
      />
      <div className="relative h-full w-[280px] max-w-[86vw]">
        {sidebar}
      </div>
    </div>
  )
}
