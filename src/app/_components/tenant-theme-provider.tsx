'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface TenantThemeContextValue {
  logoUrl?: string
}

const TenantThemeContext = createContext<TenantThemeContextValue>({})

export function TenantThemeProvider({
  children,
  value,
}: {
  children: ReactNode
  value: TenantThemeContextValue
}) {
  return <TenantThemeContext.Provider value={value}>{children}</TenantThemeContext.Provider>
}

export function useTenantTheme(): TenantThemeContextValue {
  return useContext(TenantThemeContext)
}
