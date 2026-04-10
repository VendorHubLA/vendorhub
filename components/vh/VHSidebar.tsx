'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  ShieldCheck,
  BarChart3,
  Settings,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard, roles: ['owner', 'asset_manager', 'pm', 'vendor', 'admin'] },
  { label: 'Properties',  href: '/properties',  icon: Building2,       roles: ['owner', 'asset_manager', 'pm', 'admin'] },
  { label: 'Vendors',     href: '/vendors',     icon: Users,           roles: ['owner', 'asset_manager', 'pm', 'admin'] },
  { label: 'Projects',    href: '/projects',    icon: FolderKanban,    roles: ['owner', 'asset_manager', 'pm', 'vendor', 'admin'] },
  { label: 'Compliance',  href: '/compliance',  icon: ShieldCheck,     roles: ['owner', 'asset_manager', 'pm', 'admin'] },
  { label: 'Portfolio',   href: '/portfolio',   icon: BarChart3,       roles: ['owner', 'asset_manager', 'admin'] },
  { label: 'Settings',    href: '/settings',    icon: Settings,        roles: ['owner', 'asset_manager', 'pm', 'vendor', 'admin'] },
]

interface VHSidebarProps {
  role: UserRole
  orgName?: string
}

export function VHSidebar({ role, orgName }: VHSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleNav = NAV.filter((item) => item.roles.includes(role))

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-[#2E5A40]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#C4A35A]">
            <Zap className="h-4 w-4 text-[#1E3829]" />
          </div>
          <div>
            <span className="text-[#F5F0E8] font-bold text-lg leading-none">VENDOR</span>
            <span className="text-[#C4A35A] font-bold text-lg leading-none">HUB</span>
          </div>
        </div>
        <button
          className="md:hidden text-[#9CA3AF] hover:text-[#F5F0E8]"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Org name */}
      {orgName && (
        <div className="px-6 py-3 border-b border-[#2E5A40]">
          <p className="text-[#6B7280] text-xs uppercase tracking-widest">Organization</p>
          <p className="text-[#F5F0E8] text-sm font-medium truncate">{orgName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-[#2E5A40] text-[#C4A35A]'
                  : 'text-[#9CA3AF] hover:bg-[#2E5A40] hover:text-[#F5F0E8]'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', active && 'text-[#C4A35A]')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="px-6 py-4 border-t border-[#2E5A40]">
        <span className="text-xs text-[#6B7280] uppercase tracking-widest">
          {role.replace('_', ' ')}
        </span>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger trigger — rendered outside sidebar, used in layout header */}
      <button
        className="md:hidden fixed top-3.5 left-4 z-40 flex h-8 w-8 items-center justify-center rounded-md text-[#1E3829] hover:bg-[#EDE6D8] transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#1E3829] transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-64 flex-col bg-[#1E3829]">
        {navContent}
      </aside>
    </>
  )
}
