import type { MessageCatalog } from './translate'

const ACCENTED: Record<string, string> = {
  a: 'ȧ', b: 'ƀ', c: 'ƈ', d: 'ḓ', e: 'ḗ', f: 'ƒ', g: 'ɠ', h: 'ħ', i: 'ĩ', j: 'ĵ',
  k: 'ķ', l: 'ŀ', m: 'ḿ', n: 'ñ', o: 'ǿ', p: 'ƥ', q: 'ɋ', r: 'ř', s: 'ş', t: 'ŧ',
  u: 'ŭ', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ẑ',
}

function accentize(text: string): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const lower = ch.toLowerCase()
    const swapped = ACCENTED[lower] ?? ch
    return ch === lower ? swapped : swapped.toUpperCase()
  })
}

/**
 * Standard pseudo-localization: accents every Latin letter (catches strings
 * that bypass the message catalog — accents survive, plain ASCII stands out),
 * pads length to simulate translation expansion, and brackets the result so
 * truncation/clipping in layouts is visible at a glance.
 */
export function pseudoLocalize(text: string, expansionRatio = 0.4): string {
  const segments = text.split(/(\{[^}]+\})/g)
  const transformed = segments.map((segment) => (segment.startsWith('{') && segment.endsWith('}') ? segment : accentize(segment))).join('')
  const padLength = Math.ceil(transformed.length * expansionRatio)
  return `[${transformed}${'~'.repeat(padLength)}]`
}

export function pseudoLocalizeCatalog(catalog: MessageCatalog, expansionRatio = 0.4): MessageCatalog {
  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') return pseudoLocalize(node, expansionRatio)
    if (node && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node as MessageCatalog).map(([key, value]) => [key, walk(value)]))
    }
    return node
  }
  return walk(catalog) as MessageCatalog
}
