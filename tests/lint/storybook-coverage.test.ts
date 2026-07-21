import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Storybook Coverage', () => {
  it('every UI component has a corresponding story file', () => {
    const uiDir = path.join(process.cwd(), 'src/shared/components/ui')

    // Get all .tsx files that are components (not .test.tsx, not .stories.tsx)
    const componentFiles = fs
      .readdirSync(uiDir)
      .filter(
        (file) =>
          file.endsWith('.tsx') &&
          !file.endsWith('.test.tsx') &&
          !file.endsWith('.stories.tsx') &&
          file !== 'index.ts'
      )
      .map((file) => file.replace('.tsx', ''))

    // Get all story files
    const storyFiles = fs
      .readdirSync(uiDir)
      .filter((file) => file.endsWith('.stories.tsx'))
      .map((file) => file.replace('.stories.tsx', ''))

    // Check each component has a story
    const missingStories = componentFiles.filter((component) => !storyFiles.includes(component))

    expect(missingStories, `Missing stories for: ${missingStories.join(', ')}`).toHaveLength(0)
  })
})
