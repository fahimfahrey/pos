import type { Organization } from '../entities/organization'
import type { Branch } from '../entities/branch'
import type { ThemeSettings } from '../entities/settings'
import { resolveSettings } from './settings-resolver'
import { contrastRatio, meetsAA, hexToRgb } from '@shared/utils/color-contrast'

export interface ResolvedTheme {
  colorScheme: 'light' | 'dark' | 'system'
  brandColor?: string
  logoUrl?: string
}

export interface DerivedBrandTokens {
  accent: string
  accentStrong: string
  accentForeground: string
  accentForegroundDark: string
  accentStrongDark: string
  accentForegroundIsLargeTextOnly: boolean
}

const BRAND_COLOR_HEX_REGEX = /^#[0-9a-fA-F]{6}$/

function isValidHex(hex: string): boolean {
  return BRAND_COLOR_HEX_REGEX.test(hex)
}

function lightenHSL(hex: string, deltaLightness: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  l = Math.min(1, Math.max(0, l + deltaLightness))

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2

  let r2 = 0,
    g2 = 0,
    b2 = 0
  if (h < 1 / 6) {
    r2 = c
    g2 = x
  } else if (h < 2 / 6) {
    r2 = x
    g2 = c
  } else if (h < 3 / 6) {
    g2 = c
    b2 = x
  } else if (h < 4 / 6) {
    g2 = x
    b2 = c
  } else if (h < 5 / 6) {
    r2 = x
    b2 = c
  } else {
    r2 = c
    b2 = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`.toUpperCase()
}

export function deriveBrandTokens(brandColorHex: string): DerivedBrandTokens | null {
  if (!isValidHex(brandColorHex)) return null

  const accent = brandColorHex

  // Darken by ~10% lightness for strong variant (lightness -= 0.1)
  const accentStrong = lightenHSL(brandColorHex, -0.1)

  // For dark mode, lighten by ~10% lightness (lightness += 0.1)
  const accentStrongDark = lightenHSL(brandColorHex, 0.1)

  // Compute foreground: pick between near-black (#20201C) and white (#FFFFFF)
  // that gives the best AA contrast
  const nearBlack = '#20201C'
  const white = '#FFFFFF'

  const ratioAgainstNearBlack = contrastRatio(brandColorHex, nearBlack)
  const ratioAgainstWhite = contrastRatio(brandColorHex, white)

  let accentForeground = nearBlack
  let accentForegroundDark = white
  let accentForegroundIsLargeTextOnly = false

  // Light mode: use whichever gives better contrast against brand color
  // Dark mode: also use whichever gives better contrast for consistency
  if (ratioAgainstWhite !== null && ratioAgainstNearBlack !== null) {
    if (ratioAgainstWhite > ratioAgainstNearBlack) {
      accentForeground = white
      accentForegroundDark = white
    } else {
      accentForeground = nearBlack
      accentForegroundDark = nearBlack
    }

    // Check if normal-text AA is met; if not, mark as large-text-only
    if (!meetsAA(Math.max(ratioAgainstWhite, ratioAgainstNearBlack))) {
      accentForegroundIsLargeTextOnly = true
    }
  }

  return {
    accent,
    accentStrong,
    accentForeground,
    accentForegroundDark,
    accentStrongDark,
    accentForegroundIsLargeTextOnly,
  }
}

export function resolveTenantTheme(
  org: Organization,
  branch?: Branch | null,
): ResolvedTheme {
  const resolved = resolveSettings(org, branch)
  const theme = resolved.theme as ThemeSettings

  return {
    colorScheme: theme.colorScheme,
    brandColor: theme.brandColor,
    logoUrl: branch?.logoUrl ?? org.logoUrl,
  }
}
