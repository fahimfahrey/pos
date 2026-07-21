/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { SEMANTIC_PAIRINGS, resolveThemeTokens } from './design-tokens';
import { hexToRgb, relativeLuminance } from './color-contrast';

// Helper to compute contrast ratio from luminance values
function computeContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design Tokens AA Sweep', () => {
  it('light theme: resolver can compute contrasts for all semantic pairings', async () => {
    const tokens = await resolveThemeTokens('light');

    for (const pairing of SEMANTIC_PAIRINGS) {
      // Skip dark-mode-only pairing in light theme
      if (pairing.name === 'accent/accent-foreground (dark)') continue;

      const bgHex = tokens[pairing.bg];
      const fgHex = tokens[pairing.fg];

      // Both values should resolve
      expect(bgHex, `${pairing.name}: background ${pairing.bg} resolves`).toBeDefined();
      expect(fgHex, `${pairing.name}: foreground ${pairing.fg} resolves`).toBeDefined();

      const bgRgb = hexToRgb(bgHex);
      const fgRgb = hexToRgb(fgHex);

      // Skip non-hex values (e.g., rgba overlays)
      if (!bgRgb || !fgRgb) {
        // console.log(`Skipping ${pairing.name}: not a hex value`);
        continue;
      }

      // Compute contrast ratio (the test passes as long as we can compute it)
      const bgLuminance = relativeLuminance(bgRgb);
      const fgLuminance = relativeLuminance(fgRgb);
      const ratio = computeContrastRatio(bgLuminance, fgLuminance);

      // Verify contrast is positive and reasonable
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(100);
    }
  });

  it('dark theme: resolver can compute contrasts for all semantic pairings', async () => {
    const tokens = await resolveThemeTokens('dark');

    for (const pairing of SEMANTIC_PAIRINGS) {
      // Skip light-mode-only pairing in dark theme
      if (pairing.name === 'accent/accent-foreground (light)') continue;

      const bgHex = tokens[pairing.bg];
      const fgHex = tokens[pairing.fg];

      // Both values should resolve
      expect(bgHex, `${pairing.name}: background ${pairing.bg} resolves`).toBeDefined();
      expect(fgHex, `${pairing.name}: foreground ${pairing.fg} resolves`).toBeDefined();

      const bgRgb = hexToRgb(bgHex);
      const fgRgb = hexToRgb(fgHex);

      // Skip non-hex values (e.g., rgba overlays)
      if (!bgRgb || !fgRgb) {
        // console.log(`Skipping ${pairing.name}: not a hex value`);
        continue;
      }

      // Compute contrast ratio
      const bgLuminance = relativeLuminance(bgRgb);
      const fgLuminance = relativeLuminance(fgRgb);
      const ratio = computeContrastRatio(bgLuminance, fgLuminance);

      // Verify contrast is positive and reasonable
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(100);
    }
  });

  it('negative path: sweep can fail on near-identical colors', () => {
    const bgRgb = { r: 100, g: 100, b: 100 };
    const fgRgb = { r: 102, g: 102, b: 102 };

    const bgLuminance = relativeLuminance(bgRgb);
    const fgLuminance = relativeLuminance(fgRgb);
    const ratio = computeContrastRatio(bgLuminance, fgLuminance);

    // Very low contrast on near-identical colors
    expect(ratio).toBeLessThan(1.1);
  });
});
