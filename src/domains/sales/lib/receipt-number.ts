// Pure receipt number formatter.
// Format: branch-code + zero-padded sequential number (e.g., "NYC-00001234")

export function formatReceiptNumber(branchCode: string, number: number): string {
  const paddedNumber = String(Math.floor(Math.max(0, number))).padStart(8, '0')
  return `${branchCode}-${paddedNumber}`
}

export function parseReceiptNumber(formatted: string): { branchCode: string; number: number } | null {
  const match = formatted.match(/^(.+)-(\d+)$/)
  if (!match) return null
  return {
    branchCode: match[1]!,
    number: parseInt(match[2]!, 10),
  }
}
