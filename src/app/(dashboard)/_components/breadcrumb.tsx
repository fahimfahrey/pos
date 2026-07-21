'use client'

import React from 'react'
import { useSelectedLayoutSegments } from 'next/navigation'
import Link from 'next/link'

const LABEL_MAP: Record<string, string> = {
  app: 'Dashboard',
  catalog: 'Catalog',
  inventory: 'Inventory',
  purchasing: 'Purchasing',
  customers: 'Customers',
}

export function Breadcrumb() {
  const segments = useSelectedLayoutSegments('(dashboard)')

  // Filter out the dashboard group itself, start from 'app' onward
  const breadcrumbs = segments.filter((s) => s !== '(dashboard)')

  if (!breadcrumbs.length) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="text-label text-foreground-muted mb-6">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/app" className="text-accent hover:text-accent-strong transition-colors">
            Home
          </Link>
        </li>
        {breadcrumbs.map((segment, index) => {
          const label = LABEL_MAP[segment] || segment
          const href = `/app/${breadcrumbs.slice(0, index + 1).join('/')}`
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={segment} className="flex items-center gap-2">
              <span className="text-foreground-muted">/</span>
              {isLast ? (
                <span className="text-foreground">{label}</span>
              ) : (
                <Link href={href} className="text-accent hover:text-accent-strong transition-colors">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
