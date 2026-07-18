import { csvRowSchema, type CsvRow } from '../schemas/catalog.schema'

export function parseCsv(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField)
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField)
        rows.push(currentRow)
        currentRow = []
        currentField = ''
      }
      if (char === '\r' && nextChar === '\n') {
        i++
      }
    } else {
      currentField += char
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows.filter((row) => row.some((cell) => cell.trim()))
}

export function buildCatalogCsvTemplate(): string {
  const headers = [
    'productName',
    'categoryName',
    'sku',
    'barcode',
    'unitOfMeasure',
    'isDecimalQuantity',
    'description',
  ]
  return headers.join(',') + '\n'
}

export interface CsvImportRow {
  row: string[]
  parsed: CsvRow | null
  status: 'new' | 'update' | 'error'
  errors: Record<string, string>
}

export function validateCatalogCsvRow(
  row: string[],
  headers: string[],
): CsvImportRow {
  const rowObj: Record<string, string> = {}
  const errors: Record<string, string> = {}

  headers.forEach((header, index) => {
    rowObj[header] = row[index] || ''
  })

  const result = csvRowSchema.safeParse(rowObj)
  if (!result.success) {
    const parsed = null
    const fieldErrors: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      const field = err.path.join('.')
      fieldErrors[field] = err.message
    })
    return {
      row,
      parsed,
      status: 'error',
      errors: fieldErrors,
    }
  }

  return {
    row,
    parsed: result.data,
    status: 'new',
    errors: {},
  }
}

export async function importCatalogCsv(
  csvText: string,
  existingSkus: Set<string>,
): Promise<CsvImportRow[]> {
  const rows = parseCsv(csvText)

  if (rows.length === 0) {
    return []
  }

  const headerRow = rows[0].map((h) => h.trim())
  const dataRows = rows.slice(1)

  return dataRows.map((row) => {
    const validation = validateCatalogCsvRow(row, headerRow)

    if (validation.parsed && existingSkus.has(validation.parsed.sku)) {
      validation.status = 'update'
    }

    return validation
  })
}
