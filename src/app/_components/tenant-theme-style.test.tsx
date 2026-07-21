import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TenantThemeStyle } from './tenant-theme-style'
import { deriveBrandTokens } from '@domains/organization/services/theme-resolver'
import { contrastRatio, meetsAA } from '@shared/utils/color-contrast'

describe('TenantThemeStyle', () => {
  it('renders null when no brand color is provided', () => {
    const { container } = render(
      <TenantThemeStyle colorScheme="system" brandColor={undefined} derivedTokens={null} />
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('renders null when derived tokens are null', () => {
    const { container } = render(
      <TenantThemeStyle colorScheme="system" brandColor="#2E6F40" derivedTokens={null} />
    )
    expect(container.querySelector('style')).toBeNull()
  })

  it('renders style tag with tenant A brand color', () => {
    const tenantAColor = '#2E6F40'
    const tokensA = deriveBrandTokens(tenantAColor)
    expect(tokensA).not.toBeNull()

    const { container } = render(
      <TenantThemeStyle
        colorScheme="light"
        brandColor={tenantAColor}
        derivedTokens={tokensA}
      />
    )

    const styleTag = container.querySelector('style')
    expect(styleTag).not.toBeNull()
    const cssText = styleTag!.textContent || ''

    // Verify tenant A's derived hex is in the output
    expect(cssText).toContain(tenantAColor)
    expect(cssText).toContain(tokensA!.accentStrong)
  })

  it('renders different styles for different tenants', () => {
    const tenantAColor = '#2E6F40'
    const tenantBColor = '#3D4A8F'

    const tokensA = deriveBrandTokens(tenantAColor)
    const tokensB = deriveBrandTokens(tenantBColor)

    expect(tokensA).not.toBeNull()
    expect(tokensB).not.toBeNull()

    const { container: containerA } = render(
      <TenantThemeStyle
        colorScheme="light"
        brandColor={tenantAColor}
        derivedTokens={tokensA}
      />
    )
    const styleTagA = containerA.querySelector('style')!.textContent || ''

    const { container: containerB } = render(
      <TenantThemeStyle
        colorScheme="light"
        brandColor={tenantBColor}
        derivedTokens={tokensB}
      />
    )
    const styleTagB = containerB.querySelector('style')!.textContent || ''

    // Styles should be different
    expect(styleTagA).not.toBe(styleTagB)

    // Each should contain its own tenant's color
    expect(styleTagA).toContain(tenantAColor)
    expect(styleTagB).toContain(tenantBColor)

    // And NOT contain the other tenant's color
    expect(styleTagA).not.toContain(tenantBColor)
    expect(styleTagB).not.toContain(tenantAColor)
  })

  it('includes both light and dark mode overrides', () => {
    const tokens = deriveBrandTokens('#CC785C')
    expect(tokens).not.toBeNull()

    const { container } = render(
      <TenantThemeStyle colorScheme="light" brandColor="#CC785C" derivedTokens={tokens} />
    )

    const cssText = container.querySelector('style')!.textContent || ''

    // Should have dark theme selector
    expect(cssText).toContain('[data-theme="dark"]')
    // Should have light theme selector
    expect(cssText).toContain('[data-theme="light"]')
    // Should have system preference fallback
    expect(cssText).toContain('prefers-color-scheme')
  })

  it('ensures derived foreground colors meet AA contrast', () => {
    const testColors = ['#CC785C', '#2E6F40', '#3D4A8F', '#F5F0E0', '#1A1A18']

    for (const color of testColors) {
      const tokens = deriveBrandTokens(color)
      expect(tokens).not.toBeNull()

      const { container } = render(
        <TenantThemeStyle colorScheme="light" brandColor={color} derivedTokens={tokens} />
      )

      const cssText = container.querySelector('style')!.textContent || ''
      expect(cssText.length).toBeGreaterThan(0)

      // Verify the derived foreground colors pass AA contrast
      const lightRatio = contrastRatio(tokens!.accent, tokens!.accentForeground)
      const darkRatio = contrastRatio(tokens!.accent, tokens!.accentForegroundDark)

      expect(meetsAA(lightRatio, true)).toBe(true)
      expect(meetsAA(darkRatio, true)).toBe(true)
    }
  })
})
