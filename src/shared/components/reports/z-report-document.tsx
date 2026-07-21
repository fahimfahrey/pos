'use client'

import * as React from 'react'
import { cn } from '@shared/utils/cn'
import { formatMoney } from '@shared/components/charts/palette'

/**
 * Structural shape of a Z-report as this document needs it. Kept local (rather
 * than importing the reporting domain entity) so this shared component stays in
 * the lower layer; the domain `ZReport` satisfies it structurally.
 */
export interface ZReportDocumentData {
  id: string
  registerId: string
  cashierUserId: string
  openedAt: Date | string
  closedAt: Date | string
  generatedAt: Date | string
  openingFloat: number
  cashSales: number
  nonCashSales: number
  expectedCashAmount: number
  countedCashAmount: number
  discrepancy: number
  grossSales: number
  discounts: number
  taxCollected: number
  netSales: number
  refunds: number
  saleCount: number
  paymentMethodBreakdown: { method: string; amount: number; count: number }[]
}

export interface ZReportLabels {
  businessName?: string
  branchName?: string
  registerName?: string
  cashierName?: string
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile: 'Mobile',
  other: 'Other',
}

function fmtDateTime(d: Date): string {
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Z-report / end-of-day close — a clean, printable, audit-friendly document in the
 * same editorial style as the back office. On screen it sits inside the app; on
 * print (`.print-document`) it becomes black-on-white on the paper plane with app
 * chrome dropped. The cash-reconciliation discrepancy is the audit focal point,
 * shown with an over/short sign and a semantic color that survives print as ink.
 */
export function ZReportDocument({
  report,
  labels = {},
  className,
}: {
  report: ZReportDocumentData
  labels?: ZReportLabels
  className?: string
}) {
  const over = report.discrepancy > 0
  const short = report.discrepancy < 0
  const balanced = report.discrepancy === 0

  return (
    <div className={cn('mx-auto w-full max-w-2xl', className)}>
      {/* Print action — not part of the document */}
      <div className="print-hidden mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-accent px-4 py-2 text-label font-semibold text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          <span aria-hidden>🖨</span> Print / Save PDF
        </button>
      </div>

      <article className="print-document rounded-[var(--radius-card)] border border-border bg-surface px-8 py-8 shadow-[var(--shadow-sm)]">
        {/* Masthead */}
        <header className="print-avoid-break border-b-2 border-foreground pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-display-lg font-semibold text-foreground">Z-Report</h1>
              <p className="text-label text-foreground-muted">End-of-day register close</p>
            </div>
            <div className="text-right text-caption text-foreground-muted">
              <p className="font-semibold text-foreground">{labels.businessName ?? 'Point of Sale'}</p>
              {labels.branchName && <p>{labels.branchName}</p>}
              <p>Report #{report.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-caption sm:grid-cols-3">
            <Meta label="Register" value={labels.registerName ?? report.registerId} />
            <Meta label="Cashier" value={labels.cashierName ?? report.cashierUserId} />
            <Meta label="Sales" value={String(report.saleCount)} />
            <Meta label="Opened" value={fmtDateTime(report.openedAt)} />
            <Meta label="Closed" value={fmtDateTime(report.closedAt)} />
            <Meta label="Generated" value={fmtDateTime(report.generatedAt)} />
          </dl>
        </header>

        {/* Sales summary */}
        <Section title="Sales summary">
          <Line label="Gross sales" value={formatMoney(report.grossSales)} />
          <Line label="Discounts" value={`(${formatMoney(report.discounts)})`} />
          <Line label="Refunds" value={`(${formatMoney(report.refunds)})`} />
          <Line label="Tax collected" value={formatMoney(report.taxCollected)} />
          <Line label="Net sales" value={formatMoney(report.netSales)} strong />
        </Section>

        {/* Payment methods */}
        <Section title="Payment methods">
          <table className="w-full text-label">
            <thead>
              <tr className="border-b border-border text-caption text-foreground-muted">
                <th className="py-1 text-left font-semibold">Method</th>
                <th className="py-1 text-right font-semibold">Count</th>
                <th className="py-1 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.paymentMethodBreakdown.map((p) => (
                <tr key={p.method} className="border-b border-border/60 last:border-0">
                  <td className="py-1 text-foreground">{PAYMENT_LABELS[p.method] ?? p.method}</td>
                  <td className="py-1 text-right tabular-nums text-foreground-muted">{p.count}</td>
                  <td className="py-1 text-right tabular-nums text-foreground">{formatMoney(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Cash reconciliation — the audit focal point */}
        <Section title="Cash reconciliation">
          <Line label="Opening float" value={formatMoney(report.openingFloat)} />
          <Line label="Cash sales" value={formatMoney(report.cashSales)} />
          <Line label="Non-cash sales" value={formatMoney(report.nonCashSales)} />
          <Line label="Expected in drawer" value={formatMoney(report.expectedCashAmount)} strong />
          <Line label="Counted in drawer" value={formatMoney(report.countedCashAmount)} strong />
          <div className="print-rule mt-2 flex items-baseline justify-between border-t border-foreground pt-2">
            <span className="text-label font-semibold text-foreground">
              {balanced ? 'Balanced' : over ? 'Over' : 'Short'}
            </span>
            <span
              className={cn(
                'text-body font-semibold tabular-nums',
                balanced && 'text-foreground',
                over && 'text-success',
                short && 'text-danger',
              )}
            >
              {balanced ? formatMoney(0) : `${over ? '+' : '−'}${formatMoney(Math.abs(report.discrepancy))}`}
            </span>
          </div>
        </Section>

        {/* Signatures — audit trail */}
        <footer className="print-avoid-break mt-8 grid grid-cols-2 gap-8 pt-4">
          <Signature label="Cashier signature" />
          <Signature label="Manager signature" />
        </footer>
      </article>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-avoid-break mt-6">
      <h2 className="mb-2 text-caption font-semibold uppercase tracking-wide text-foreground-muted">{title}</h2>
      {children}
    </section>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className={cn('text-label', strong ? 'font-semibold text-foreground' : 'text-foreground-muted')}>
        {label}
      </span>
      <span className={cn('text-label tabular-nums', strong ? 'font-semibold text-foreground' : 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}

function Signature({ label }: { label: string }) {
  return (
    <div>
      <div className="print-rule mt-8 border-t border-foreground" />
      <p className="mt-1 text-caption text-foreground-muted">{label}</p>
    </div>
  )
}
