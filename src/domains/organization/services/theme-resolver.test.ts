import { describe, it, expect } from 'vitest'
import { resolveTenantTheme, deriveBrandTokens } from './theme-resolver'
import { contrastRatio, meetsAA } from '@shared/utils/color-contrast'
import type { Organization } from '../entities/organization'
import type { Branch } from '../entities/branch'

describe('resolveTenantTheme', () => {
  const baseOrg: Organization = {
    id: 'org-1',
    name: 'Test Org',
    plan: 'pro',
    status: 'active',
    settings: {
      theme: {
        colorScheme: 'system',
      },
    },
    logoUrl: 'https://example.com/logo.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('returns default theme when org has no brand color set', () => {
    const theme = resolveTenantTheme(baseOrg)
    expect(theme.colorScheme).toBe('system')
    expect(theme.brandColor).toBeUndefined()
    expect(theme.logoUrl).toBe('https://example.com/logo.png')
  })

  it('uses org brand color when set', () => {
    const org = {
      ...baseOrg,
      settings: {
        theme: {
          colorScheme: 'light' as const,
          brandColor: '#2E6F40',
        },
      },
    } as Organization
    const theme = resolveTenantTheme(org)
    expect(theme.brandColor).toBe('#2E6F40')
    expect(theme.colorScheme).toBe('light')
  })

  it('branch theme wholly replaces org theme (shallow merge)', () => {
    const org = {
      ...baseOrg,
      settings: {
        theme: {
          colorScheme: 'light' as const,
          brandColor: '#2E6F40',
        },
      },
    } as Organization
    const branch: Branch = {
      id: 'branch-1',
      orgId: 'org-1',
      name: 'Test Branch',
      settings: {
        theme: {
          colorScheme: 'dark' as const,
        },
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const theme = resolveTenantTheme(org, branch)
    // Branch theme object replaces org's entirely
    expect(theme.colorScheme).toBe('dark')
    expect(theme.brandColor).toBeUndefined()
  })

  it('uses branch logoUrl when available', () => {
    const org = {
      ...baseOrg,
      logoUrl: 'https://example.com/org-logo.png',
    }
    const branch: Branch = {
      id: 'branch-1',
      orgId: 'org-1',
      name: 'Test Branch',
      settings: {},
      logoUrl: 'https://example.com/branch-logo.png',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const theme = resolveTenantTheme(org, branch)
    expect(theme.logoUrl).toBe('https://example.com/branch-logo.png')
  })

  it('falls back to org logoUrl when branch has none', () => {
    const org = {
      ...baseOrg,
      logoUrl: 'https://example.com/org-logo.png',
    }
    const branch: Branch = {
      id: 'branch-1',
      orgId: 'org-1',
      name: 'Test Branch',
      settings: {},
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const theme = resolveTenantTheme(org, branch)
    expect(theme.logoUrl).toBe('https://example.com/org-logo.png')
  })
})

describe('deriveBrandTokens', () => {
  it('returns null for invalid hex', () => {
    expect(deriveBrandTokens('not-a-hex')).toBeNull()
    expect(deriveBrandTokens('#zzz')).toBeNull()
    expect(deriveBrandTokens('#12345')).toBeNull()
  })

  it('derives tokens from valid hex', () => {
    const tokens = deriveBrandTokens('#CC785C')
    expect(tokens).not.toBeNull()
    expect(tokens!.accent).toBe('#CC785C')
    expect(tokens!.accentStrong).toBeDefined()
    expect(tokens!.accentForeground).toBeDefined()
    expect(tokens!.accentForegroundDark).toBeDefined()
  })

  it('ensures foreground colors meet AA contrast', () => {
    const testColors = [
      '#CC785C', // default terracotta
      '#2E6F40', // deep green
      '#3D4A8F', // deep blue
      '#F5F0E0', // very light
      '#1A1A18', // very dark
    ]

    for (const color of testColors) {
      const tokens = deriveBrandTokens(color)
      expect(tokens).not.toBeNull()

      const lightRatio = contrastRatio(tokens!.accent, tokens!.accentForeground)
      const darkRatio = contrastRatio(tokens!.accent, tokens!.accentForegroundDark)

      // Both should meet AA for large text at minimum
      expect(meetsAA(lightRatio, true)).toBe(true)
      expect(meetsAA(darkRatio, true)).toBe(true)

      // If marked as large-text-only, normal text should fail
      if (tokens!.accentForegroundIsLargeTextOnly) {
        expect(meetsAA(lightRatio, false)).toBe(false)
      }
    }
  })

  it('produces darkened strong variant', () => {
    const tokens = deriveBrandTokens('#CC785C')
    expect(tokens).not.toBeNull()
    // Strong variant should be darker (lower hex values in most cases)
    expect(tokens!.accentStrong.toLowerCase()).not.toBe(tokens!.accent.toLowerCase())
  })

  it('produces lightened dark-mode strong variant', () => {
    const tokens = deriveBrandTokens('#CC785C')
    expect(tokens).not.toBeNull()
    // Dark-mode strong should be different from regular strong
    expect(tokens!.accentStrongDark.toLowerCase()).not.toBe(tokens!.accentStrong.toLowerCase())
  })
})
