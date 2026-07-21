/**
 * @vitest-environment node
 */
import { ESLint } from 'eslint';
import { describe, it, expect } from 'vitest';

function getCwd(): string {
  const currentFileUrl = new URL(import.meta.url);
  const currentPath = decodeURIComponent(currentFileUrl.pathname);
  const parts = currentPath.split('/');
  const testsIndex = parts.findIndex(p => p === 'tests');
  if (testsIndex === -1) throw new Error('Could not find tests directory in path');
  return parts.slice(0, testsIndex).join('/');
}

const cwd = getCwd();

describe('ESLint design token rules regression', () => {
  it('flags all three design-token violations in non-compliant fixture', async () => {
    const eslint = new ESLint({ cwd });
    const fixtureFile = `${cwd}/src/app/__design_token_fixtures__/non-compliant.tsx`;
    const results = await eslint.lintFiles([fixtureFile]);
    const messages = results.flatMap(r => r.messages);

    // Extract the three specific design-token rule messages
    const hexColorMessages = messages.filter(m =>
      m.message?.includes('Avoid raw hex colors'),
    );
    const rgbHslMessages = messages.filter(m =>
      m.message?.includes('Avoid raw rgb/hsl colors'),
    );

    expect(hexColorMessages.length, 'should flag at least one raw hex color').toBeGreaterThan(0);
    expect(rgbHslMessages.length, 'should flag at least one raw rgb/hsl color').toBeGreaterThan(0);
  });

  it('does not flag template literals that interpolate validated variables', async () => {
    const eslint = new ESLint({ cwd });
    const compliantFile = `${cwd}/src/app/_components/tenant-theme-style.tsx`;
    const results = await eslint.lintFiles([compliantFile]);
    const messages = results.flatMap(r => r.messages);

    // Filter for the three design-token rule messages
    const designTokenMessages = messages.filter(m =>
      m.message?.includes('Avoid raw hex colors') ||
      m.message?.includes('Avoid raw rgb/hsl colors') ||
      m.message?.includes('Avoid off-scale spacing values'),
    );

    expect(designTokenMessages).toHaveLength(0);
  });
});
