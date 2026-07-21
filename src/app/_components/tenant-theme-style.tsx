import type { DerivedBrandTokens } from '@domains/organization/services/theme-resolver'
import { deriveBrandTokens } from '@domains/organization/services/theme-resolver'

interface TenantThemeStyleProps {
  colorScheme: 'light' | 'dark' | 'system'
  brandColor?: string
  derivedTokens?: DerivedBrandTokens | null
}

export function TenantThemeStyle({
  colorScheme,
  brandColor,
  derivedTokens,
}: TenantThemeStyleProps) {
  // If no brand color is set, no override style is needed
  // (defaults apply via the static globals.css cascade)
  if (!brandColor || !derivedTokens) {
    return null
  }

  // Generate CSS variable overrides for both light and dark modes
  const cssContent = `
:root[data-theme="light"] {
  --accent: ${derivedTokens.accent};
  --accent-strong: ${derivedTokens.accentStrong};
  --accent-foreground: ${derivedTokens.accentForeground};
  --primary: ${derivedTokens.accent};
  --primary-strong: ${derivedTokens.accentStrong};
  --primary-foreground: ${derivedTokens.accentForeground};
  --focus-ring-color: ${derivedTokens.accent};
}

:root[data-theme="dark"] {
  --accent: ${derivedTokens.accent};
  --accent-strong: ${derivedTokens.accentStrongDark};
  --accent-foreground: ${derivedTokens.accentForegroundDark};
  --primary: ${derivedTokens.accent};
  --primary-strong: ${derivedTokens.accentStrongDark};
  --primary-foreground: ${derivedTokens.accentForegroundDark};
  --focus-ring-color: ${derivedTokens.accent};
}

:root:not([data-theme="light"]):not([data-theme="dark"]) {
  @media (prefers-color-scheme: light) {
    --accent: ${derivedTokens.accent};
    --accent-strong: ${derivedTokens.accentStrong};
    --accent-foreground: ${derivedTokens.accentForeground};
    --primary: ${derivedTokens.accent};
    --primary-strong: ${derivedTokens.accentStrong};
    --primary-foreground: ${derivedTokens.accentForeground};
    --focus-ring-color: ${derivedTokens.accent};
  }

  @media (prefers-color-scheme: dark) {
    --accent: ${derivedTokens.accent};
    --accent-strong: ${derivedTokens.accentStrongDark};
    --accent-foreground: ${derivedTokens.accentForegroundDark};
    --primary: ${derivedTokens.accent};
    --primary-strong: ${derivedTokens.accentStrongDark};
    --primary-foreground: ${derivedTokens.accentForegroundDark};
    --focus-ring-color: ${derivedTokens.accent};
  }
}
  `.trim()

  return <style dangerouslySetInnerHTML={{ __html: cssContent }} />
}
