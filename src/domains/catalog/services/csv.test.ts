import { describe, it, expect } from 'vitest'
import { parseCsv, buildCatalogCsvTemplate, validateCatalogCsvRow, importCatalogCsv } from './csv'

describe('csv', () => {
  describe('parseCsv', () => {
    it('parses simple CSV', () => {
      const csv = 'name,value\ntest,123'
      const rows = parseCsv(csv)
      expect(rows).toEqual([['name', 'value'], ['test', '123']])
    })

    it('handles quoted fields with commas', () => {
      const csv = 'name,description\n"Product, Inc",A good product'
      const rows = parseCsv(csv)
      expect(rows[1][0]).toBe('Product, Inc')
    })

    it('handles escaped quotes', () => {
      const csv = 'name\n"Product ""Plus"""'
      const rows = parseCsv(csv)
      expect(rows[1][0]).toBe('Product "Plus"')
    })

    it('handles CRLF line endings', () => {
      const csv = 'a,b\r\nc,d'
      const rows = parseCsv(csv)
      expect(rows.length).toBe(2)
    })

    it('ignores blank lines', () => {
      const csv = 'a,b\n\nc,d'
      const rows = parseCsv(csv)
      expect(rows.length).toBe(2)
    })
  })

  describe('buildCatalogCsvTemplate', () => {
    it('returns header row', () => {
      const template = buildCatalogCsvTemplate()
      expect(template).toContain('productName')
      expect(template).toContain('categoryName')
      expect(template).toContain('sku')
      expect(template.endsWith('\n')).toBe(true)
    })
  })

  describe('validateCatalogCsvRow', () => {
    it('validates correct row', () => {
      const headers = ['productName', 'categoryName', 'sku', 'barcode', 'unitOfMeasure', 'isDecimalQuantity', 'description']
      const row = ['Widget', 'Tools', 'WDG-001', '1234567890', 'pcs', 'false', 'A useful widget']
      const result = validateCatalogCsvRow(row, headers)
      expect(result.status).toBe('new')
      expect(result.parsed).toBeDefined()
      expect(result.errors).toEqual({})
    })

    it('rejects missing required fields', () => {
      const headers = ['productName', 'categoryName', 'sku', 'unitOfMeasure', 'isDecimalQuantity']
      const row = ['Widget', '', 'WDG-001', 'pcs', 'false']
      const result = validateCatalogCsvRow(row, headers)
      expect(result.status).toBe('error')
      expect(result.errors.categoryName).toBeDefined()
    })

    it('accepts isDecimalQuantity as string true/false', () => {
      const headers = ['productName', 'categoryName', 'sku', 'unitOfMeasure', 'isDecimalQuantity']
      const row1 = ['Widget', 'Tools', 'WDG-001', 'pcs', 'true']
      const row2 = ['Widget2', 'Tools', 'WDG-002', 'pcs', 'false']
      const result1 = validateCatalogCsvRow(row1, headers)
      const result2 = validateCatalogCsvRow(row2, headers)
      expect(result1.parsed?.isDecimalQuantity).toBe(true)
      expect(result2.parsed?.isDecimalQuantity).toBe(false)
    })
  })

  describe('importCatalogCsv', () => {
    it('processes CSV with mixed new and update rows', async () => {
      const csv = `productName,categoryName,sku,unitOfMeasure,isDecimalQuantity
Widget,Tools,WDG-001,pcs,false
Gadget,Tools,GDG-001,pcs,false`
      const existingSkus = new Set(['GDG-001'])
      const results = await importCatalogCsv(csv, existingSkus)
      expect(results).toHaveLength(2)
      expect(results[0].status).toBe('new')
      expect(results[1].status).toBe('update')
    })

    it('marks rows with validation errors', async () => {
      const csv = `productName,categoryName,sku,unitOfMeasure,isDecimalQuantity
Widget,Tools,,pcs,false`
      const existingSkus = new Set()
      const results = await importCatalogCsv(csv, existingSkus)
      expect(results[0].status).toBe('error')
      expect(results[0].errors.sku).toBeDefined()
    })
  })
})
