import { readFileSync } from 'fs';
import postcss from 'postcss';

// Get the path to globals.css relative to this file
// This file is at src/shared/utils/design-tokens.ts, so we need to go up 3 levels
// and then into app/globals.css
function getGlobalsPath(): string {
  const currentFileUrl = new URL(import.meta.url);
  const currentPath = decodeURIComponent(currentFileUrl.pathname);

  // Use simple string manipulation to navigate the path
  // From /path/to/src/shared/utils/design-tokens.ts -> /path/to/src/app/globals.css
  const parts = currentPath.split('/');
  // Find 'src' in the path and rebuild from there
  const srcIndex = parts.findIndex(p => p === 'src');
  if (srcIndex === -1) throw new Error('Could not find src directory in path');

  const basePath = parts.slice(0, srcIndex + 1).join('/');
  return `${basePath}/app/globals.css`;
}

export interface SemanticPairing {
  name: string;
  bg: string;
  fg: string;
  largeText?: boolean;
}

/**
 * Every semantic pairing that must pass AA contrast requirements.
 * Keyed by CSS custom-property names, not hex values.
 * largeText: true gates at 3:1 (WCAG 2.2 non-text/UI-component); false gates at 4.5:1.
 * Dark-mode accent/accent-foreground is marked as largeText-only per design-direction.md line ~87.
 * background/accent pairing tests focus-ring distinguishability.
 */
export const SEMANTIC_PAIRINGS: SemanticPairing[] = [
  { name: 'background/foreground', bg: '--background', fg: '--foreground' },
  { name: 'background/foreground-muted', bg: '--background', fg: '--foreground-muted' },
  { name: 'surface/foreground', bg: '--surface', fg: '--foreground' },
  { name: 'accent/accent-foreground (light)', bg: '--accent', fg: '--accent-foreground' },
  { name: 'accent/accent-foreground (dark)', bg: '--accent', fg: '--accent-foreground', largeText: true },
  { name: 'accent-strong/accent-foreground', bg: '--accent-strong', fg: '--accent-foreground' },
  { name: 'background/success', bg: '--background', fg: '--success' },
  { name: 'background/danger', bg: '--background', fg: '--danger' },
  { name: 'background/warning', bg: '--background', fg: '--warning' },
  { name: 'background/accent (focus-ring)', bg: '--background', fg: '--accent', largeText: true },
];

/**
 * Resolve real CSS custom-property values from globals.css by theme.
 * Uses postcss to parse `:root[data-theme='light']` and `:root[data-theme='dark']` blocks,
 * then manually resolves var() chains until only literal hex/rgba values remain.
 * Does not depend on Tailwind's build pipeline or jsdom CSS engine.
 */
export async function resolveThemeTokens(theme: 'light' | 'dark'): Promise<Record<string, string>> {
  const globalsPath = getGlobalsPath();
  const cssContent = readFileSync(globalsPath, 'utf-8');

  const root = postcss.parse(cssContent);
  const resolved: Record<string, string> = {};

  // First, collect all :root values (light theme base + fallbacks)
  const lightValues: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.selector === ':root') {
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          lightValues[decl.prop] = decl.value;
        }
      });
    }
  });

  // Then, overlay the appropriate theme block
  const themeSelector = theme === 'light' ? ":root[data-theme='light']" : ":root[data-theme='dark']";
  root.walkRules((rule) => {
    if (rule.selector === themeSelector) {
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          lightValues[decl.prop] = decl.value;
        }
      });
    }
  });

  // Resolve var() chains manually
  const resolveVar = (value: string, depth = 0): string => {
    if (depth > 10) return value; // Prevent infinite loops
    const match = value.match(/var\(--([^)]+)\)/);
    if (!match) return value;
    const varName = `--${match[1]}`;
    const resolved = lightValues[varName];
    if (!resolved) return value;
    return resolveVar(resolved, depth + 1);
  };

  for (const [key, value] of Object.entries(lightValues)) {
    if (key.startsWith('--')) {
      resolved[key] = resolveVar(value);
    }
  }

  return resolved;
}
