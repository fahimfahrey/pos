import { describe, it, expect, beforeEach, vi } from 'vitest'
import { printReceipt } from './receipt-print-orchestrator'
import { registerPrinter, getRegisteredPrinters } from './printer-registry'
import type { Printer, PrintJobPayload } from '@shared/ports/printer'
import type { JobRunner, Job, JobResult } from '@shared/ports/job-runner'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'

describe('receipt-print-orchestrator', () => {
  const mockDocument: ReceiptDocument = {
    receiptNumber: '100',
    issuedAt: new Date('2024-01-01T12:00:00Z'),
    org: { name: 'Test Store' },
    branch: { name: 'Downtown' },
    lines: [],
    subtotal: 10.0,
    discount: 0,
    taxMode: 'exclusive',
    taxBreakdown: [],
    tax: 1.0,
    total: 11.0,
    payments: [],
    changeDue: 0,
    showItemDescription: true,
  }

  const mockJobRunner: JobRunner = {
    async run<TPayload, TResult>(
      job: Job<TPayload, TResult>,
      handler: (payload: TPayload) => Promise<TResult>,
    ): Promise<JobResult<TResult>> {
      try {
        const result = await handler(job.payload)
        return { ok: true, result }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { ok: false, error: message }
      }
    },
  }

  class MockPrinter implements Printer {
    constructor(
      readonly id: string,
      private available: boolean = true,
      private shouldFail: boolean = false,
    ) {}

    async isAvailable(): Promise<boolean> {
      return this.available
    }

    async print(payload: PrintJobPayload): Promise<{ jobId: string }> {
      if (this.shouldFail) {
        throw new Error(`${this.id} print failed`)
      }
      return { jobId: `${this.id}-job-${Date.now()}` }
    }
  }

  beforeEach(() => {
    // Clear registered printers before each test
    vi.resetModules()
  })

  it('prints successfully with preferred printer when available', async () => {
    const printer = new MockPrinter('escpos', true, false)
    registerPrinter('escpos', () => printer)
    registerPrinter('browser-print', () => new MockPrinter('browser-print'))

    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
      preferredPrinterId: 'escpos',
    })

    expect(outcome.ok).toBe(true)
    expect(outcome.printerId).toBe('escpos')
    expect(outcome.jobId).toBeDefined()
  })

  it('falls back to browser-print when preferred printer is unavailable', async () => {
    const unavailablePrinter = new MockPrinter('escpos', false)
    const browserPrinter = new MockPrinter('browser-print', true)

    registerPrinter('escpos', () => unavailablePrinter)
    registerPrinter('browser-print', () => browserPrinter)

    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
      preferredPrinterId: 'escpos',
    })

    expect(outcome.ok).toBe(true)
    expect(outcome.printerId).toBe('browser-print')
  })

  it('falls back to browser-print when preferred printer throws', async () => {
    const failingPrinter = new MockPrinter('escpos', true, true)
    const browserPrinter = new MockPrinter('browser-print', true)

    registerPrinter('escpos', () => failingPrinter)
    registerPrinter('browser-print', () => browserPrinter)

    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
      preferredPrinterId: 'escpos',
    })

    expect(outcome.ok).toBe(true)
    expect(outcome.printerId).toBe('browser-print')
  })

  it('returns failure when all printers are unavailable', async () => {
    registerPrinter('escpos', () => new MockPrinter('escpos', false))
    registerPrinter('browser-print', () => new MockPrinter('browser-print', false))

    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
      preferredPrinterId: 'escpos',
    })

    expect(outcome.ok).toBe(false)
    expect(outcome.reason).toContain('No printer available')
  })

  it('returns failure when all printers fail', async () => {
    registerPrinter('escpos', () => new MockPrinter('escpos', true, true))
    registerPrinter('browser-print', () => new MockPrinter('browser-print', true, true))

    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
      preferredPrinterId: 'escpos',
    })

    expect(outcome.ok).toBe(false)
  })

  it('never throws to the caller', async () => {
    registerPrinter('browser-print', () => new MockPrinter('browser-print', true, true))

    // This should not throw
    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
      preferredPrinterId: 'nonexistent',
    })

    expect(outcome.ok).toBe(false)
    expect(outcome.reason).toBeDefined()
  })

  it('uses browser-print as default when no preference given', async () => {
    registerPrinter('browser-print', () => new MockPrinter('browser-print'))
    registerPrinter('escpos', () => new MockPrinter('escpos'))

    const outcome = await printReceipt(mockDocument, {
      jobRunner: mockJobRunner,
    })

    expect(outcome.ok).toBe(true)
    expect(outcome.printerId).toBe('browser-print')
  })

  it('routes the job through the job runner', async () => {
    let jobRunnerCalled = false
    const testJobRunner: JobRunner = {
      async run<TPayload, TResult>(
        job: Job<TPayload, TResult>,
        handler: (payload: TPayload) => Promise<TResult>,
      ): Promise<JobResult<TResult>> {
        jobRunnerCalled = true
        return mockJobRunner.run(job, handler)
      },
    }

    registerPrinter('browser-print', () => new MockPrinter('browser-print'))

    await printReceipt(mockDocument, {
      jobRunner: testJobRunner,
    })

    expect(jobRunnerCalled).toBe(true)
  })
})
