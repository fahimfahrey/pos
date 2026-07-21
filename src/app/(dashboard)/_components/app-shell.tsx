'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@shared/utils/cn'
import { Sheet, SheetContent, SheetTrigger } from '@shared/components/ui/sheet'
import { Button } from '@shared/components/ui/button'
import { VisuallyHidden } from '@shared/components/ui/visually-hidden'
import LogoutButton from '@app/_components/logout-button'
import type { Persona } from '@domains/auth/services/role-context'
import type { NavItem } from './nav-items'
import type { Branch } from '@domains/organization/entities/branch'
import type { Shift } from '@domains/sales/entities/shift'
import { BranchSwitcher } from './branch-switcher'
import { RegisterIndicator } from './register-indicator'
import { Breadcrumb } from './breadcrumb'

interface AppShellProps {
  persona: Persona
  navItems: NavItem[]
  branches: Branch[]
  currentBranchId: string
  openShift?: Shift | null
  children: React.ReactNode
}

// Icon map for nav items - using simple Unicode symbols
const ICON_MAP: Record<string, string> = {
  home: '🏠',
  box: '📦',
  package: '📫',
  truck: '🚚',
  users: '👥',
  'bar-chart': '📊',
  'credit-card': '💳',
  settings: '⚙️',
}

export function AppShell({
  persona,
  navItems,
  branches,
  currentBranchId,
  openShift,
  children,
}: AppShellProps) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const navContent = (
    <nav className="flex flex-col gap-2" aria-label="Main navigation">
      {navItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-input)] text-body transition-colors',
            isActive(item.href)
              ? 'bg-accent text-accent-foreground font-semibold'
              : 'text-foreground hover:bg-surface-muted'
          )}
          onClick={() => setMobileNavOpen(false)}
        >
          <span className="text-lg">{ICON_MAP[item.icon] || '•'}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-dvh flex flex-col bg-background pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Skip link */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 short:py-1.5 flex items-center justify-between gap-4">
          {/* Left: Mobile nav trigger + Brand */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                >
                  ☰
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 px-0">
                <div className="flex flex-col gap-6 pt-6">
                  <h2 className="px-6 text-display-lg font-display font-semibold text-foreground">
                    Menu
                  </h2>
                  <div className="px-6">{navContent}</div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-display-lg font-display font-semibold text-foreground hidden sm:block">
              Dashboard
            </h1>
          </div>

          {/* Center: Branch switcher */}
          <div className="flex-shrink-0 min-w-0 max-w-xs">
            <BranchSwitcher branches={branches} currentBranchId={currentBranchId} />
          </div>

          {/* Right: Register indicator + Logout */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <RegisterIndicator persona={persona} openShift={openShift} />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1">
        {/* Desktop sidebar nav */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-surface border-r border-border px-4 py-6 overflow-y-auto">
          {navContent}
        </aside>

        {/* Main content */}
        <main id="content" className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
