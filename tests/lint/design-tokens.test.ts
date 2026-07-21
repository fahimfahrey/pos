import { ESLint } from 'eslint'
import { describe, it, expect } from 'vitest'

const cwd = process.cwd()
const fixtureFile = `${cwd}/src/app/__design_token_fixtures__/non-compliant.tsx`
const compliantFile = `${cwd}/src/app/_components/tenant-theme-style.tsx`

describe('design token lint rules', () => {
  it('flags raw hex colors in fixtures', async () => {
    const eslint = new ESLint({ cwd })
    const results = await eslint.lintFiles([fixtureFile])
    const result = results[0]
    if (!result) throw new Error('No lint result')

    const tokenErrors = (result?.messages ?? []).filter(m =>
      m.message?.includes('design token') || m.message?.includes('hex color'),
    )
    expect(tokenErrors.length).toBeGreaterThan(0)
  })

  it('flags off-scale spacing in fixtures', async () => {
    const eslint = new ESLint({ cwd })
    const results = await eslint.lintFiles([fixtureFile])
    const result = results[0]
    if (!result) throw new Error('No lint result')

    const spacingErrors = (result?.messages ?? []).filter(m =>
      m.message?.includes('off-scale spacing'),
    )
    expect(spacingErrors.length).toBeGreaterThan(0)
  })

  it('does not flag compliant files like tenant-theme-style', async () => {
    const eslint = new ESLint({ cwd })
    const results = await eslint.lintFiles([compliantFile])
    const result = results[0]
    if (!result) throw new Error('No lint result')

    const tokenErrors = (result?.messages ?? []).filter(m =>
      m.message?.includes('design token') ||
      m.message?.includes('hex color') ||
      m.message?.includes('off-scale spacing'),
    )
    expect(tokenErrors).toHaveLength(0)
  })
})
