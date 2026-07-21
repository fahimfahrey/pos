'use client'

import * as React from 'react'
import type {
  SalesPeriodRow,
  SalesCategoryRow,
  SalesProductRow,
  SalesCashierRow,
  MarginRow,
  TaxRow,
  PaymentMethodRow,
  HourlyHeatmapRow,
} from '@domains/reporting/entities/report-rows'
import {
  ChartFrame,
  ChartEmpty,
  ChartInsufficient,
  BarChart,
  LineChart,
  DonutChart,
  Heatmap,
  FigureTable,
  seriesColor,
  formatMoney,
  formatMoneyShort,
  formatCount,
  formatPercent,
  type BarDatum,
  type LegendItem,
} from '@shared/components/charts'

export interface ReportsData {
  rangeLabel: string
  period: SalesPeriodRow[]
  category: SalesCategoryRow[]
  product: SalesProductRow[]
  cashier: SalesCashierRow[]
  margin: MarginRow[]
  tax: TaxRow[]
  payment: PaymentMethodRow[]
  heatmap: HourlyHeatmapRow[]
  csv: Record<string, string>
  scope: {
    persona: string
    branchLabel: string
    canSeeCashiers: boolean
    canSeeMargin: boolean
  }
}

const PAYMENT_LABELS: Record<string, string> = { cash: 'Cash', card: 'Card', mobile: 'Mobile', other: 'Other' }

export function ReportsView({ data }: { data: ReportsData }) {
  const csv = (key: string, name: string) => ({ filename: `${name}-${data.rangeLabel}.csv`, content: data.csv[key] ?? '' })

  // ── KPI totals from the period rows ──
  const totals = data.period.reduce(
    (acc, r) => ({
      gross: acc.gross + r.grossSales,
      net: acc.net + r.netSales,
      tax: acc.tax + r.tax,
      count: acc.count + r.saleCount,
    }),
    { gross: 0, net: 0, tax: 0, count: 0 },
  )

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Net sales" value={formatMoney(totals.net)} />
        <Kpi label="Gross sales" value={formatMoney(totals.gross)} />
        <Kpi label="Tax collected" value={formatMoney(totals.tax)} />
        <Kpi label="Sales" value={formatCount(totals.count)} />
      </div>

      {/* Sales trend */}
      <ReportSection>
        <ChartFrame
          title="Sales over time"
          subtitle={`Net and gross sales · ${data.rangeLabel}`}
          legend={
            [
              { label: 'Net sales', color: seriesColor(0) },
              { label: 'Gross sales', color: seriesColor(2) },
            ] as LegendItem[]
          }
          csv={csv('sales_period', 'sales-over-time')}
          figures={<PeriodFigures rows={data.period} />}
        >
          {data.period.length === 0 ? (
            <ChartEmpty />
          ) : data.period.length < 2 ? (
            <ChartInsufficient />
          ) : (
            <LineChart
              categories={data.period.map((r) => r.period)}
              series={[
                { key: 'net', label: 'Net sales', color: seriesColor(0), points: data.period.map((r) => r.netSales) },
                { key: 'gross', label: 'Gross sales', color: seriesColor(2), points: data.period.map((r) => r.grossSales) },
              ]}
              formatValue={(n) => formatMoney(n)}
              formatTick={(n) => formatMoneyShort(n)}
            />
          )}
        </ChartFrame>
      </ReportSection>

      {/* Category + Product breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Sales by category"
          subtitle="Net sales per category"
          csv={csv('sales_category', 'sales-by-category')}
          figures={<CategoryFigures rows={data.category} />}
        >
          {data.category.length === 0 ? (
            <ChartEmpty />
          ) : (
            <BarChart
              color={seriesColor(0)}
              data={data.category.map<BarDatum>((r) => ({
                key: r.categoryId,
                label: r.categoryName,
                value: r.netSales,
                display: formatMoney(r.netSales),
                sub: `${formatCount(r.saleCount)} sales · ${formatCount(r.quantity)} items`,
              }))}
            />
          )}
        </ChartFrame>

        <ChartFrame
          title="Top products"
          subtitle="Net sales per product"
          csv={csv('sales_product', 'top-products')}
          figures={<ProductFigures rows={data.product} />}
        >
          {data.product.length === 0 ? (
            <ChartEmpty />
          ) : (
            <BarChart
              color={seriesColor(1)}
              data={data.product.map<BarDatum>((r) => ({
                key: r.variantId,
                label: r.variantName,
                value: r.netSales,
                display: formatMoney(r.netSales),
                sub: `${formatCount(r.quantity)} sold`,
              }))}
            />
          )}
        </ChartFrame>
      </div>

      {/* Payment mix + Tax by rate */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Payment mix"
          subtitle="Share of collected amount by method"
          csv={csv('payment_method', 'payment-mix')}
          figures={<PaymentFigures rows={data.payment} />}
        >
          {data.payment.length === 0 ? (
            <ChartEmpty />
          ) : (
            <DonutChart
              centerLabel="Total"
              centerValue={formatMoneyShort(data.payment.reduce((s, p) => s + p.amount, 0))}
              data={data.payment.map((p) => ({
                key: p.method,
                label: PAYMENT_LABELS[p.method] ?? p.method,
                value: p.amount,
                display: formatMoney(p.amount),
              }))}
            />
          )}
        </ChartFrame>

        <ChartFrame
          title="Tax collected by rate"
          subtitle="Per tax rate"
          csv={csv('tax', 'tax-by-rate')}
          figures={<TaxFigures rows={data.tax} />}
        >
          {data.tax.length === 0 ? (
            <ChartEmpty />
          ) : (
            <BarChart
              color={seriesColor(4)}
              data={data.tax.map<BarDatum>((r) => ({
                key: String(r.taxRate),
                label: `${(r.taxRate * 100).toFixed(2)}%`,
                value: r.taxCollected,
                display: formatMoney(r.taxCollected),
                sub: `on ${formatMoney(r.taxableSales)} taxable`,
              }))}
            />
          )}
        </ChartFrame>
      </div>

      {/* Cashier breakdown — owner/manager only */}
      {data.scope.canSeeCashiers && (
        <ChartFrame
          title="Sales by cashier"
          subtitle="Net sales per cashier"
          csv={csv('sales_cashier', 'sales-by-cashier')}
          figures={<CashierFigures rows={data.cashier} />}
        >
          {data.cashier.length === 0 ? (
            <ChartEmpty />
          ) : (
            <BarChart
              color={seriesColor(5)}
              data={data.cashier.map<BarDatum>((r) => ({
                key: r.cashierUserId,
                label: r.cashierName,
                value: r.netSales,
                display: formatMoney(r.netSales),
                sub: `${formatCount(r.saleCount)} sales`,
              }))}
            />
          )}
        </ChartFrame>
      )}

      {/* Margin — owner/manager only */}
      {data.scope.canSeeMargin && (
        <ChartFrame
          title="Margin by product"
          subtitle="Revenue, cost and margin per product"
          csv={csv('margin', 'margin-by-product')}
          figures={<MarginFigures rows={data.margin} />}
          defaultShowFigures
        >
          {data.margin.length === 0 ? <ChartEmpty /> : <MarginFigures rows={data.margin} />}
        </ChartFrame>
      )}

      {/* Hourly heatmap */}
      <ChartFrame
        title="Busiest hours"
        subtitle="Sales by day of week and hour"
        csv={csv('hourly_heatmap', 'hourly-heatmap')}
      >
        {data.heatmap.length === 0 ? (
          <ChartEmpty title="No sales in this range" hint="Once sales come in, busy hours light up here." icon="🕒" />
        ) : (
          <Heatmap cells={data.heatmap} formatMoney={(c) => formatMoney(c)} />
        )}
      </ChartFrame>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-sm)]">
      <p className="text-caption text-foreground-muted">{label}</p>
      <p className="mt-1 font-display text-display-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function ReportSection({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// ── Paired figure tables (relief for the low-contrast slots + accessible fallback) ──

function PeriodFigures({ rows }: { rows: SalesPeriodRow[] }) {
  return (
    <FigureTable
      rows={rows}
      rowKey={(r) => r.period}
      caption="Sales by period"
      columns={[
        { key: 'period', header: 'Period', render: (r) => r.period },
        { key: 'gross', header: 'Gross', align: 'right', render: (r) => formatMoney(r.grossSales) },
        { key: 'disc', header: 'Discounts', align: 'right', render: (r) => formatMoney(r.discounts) },
        { key: 'tax', header: 'Tax', align: 'right', render: (r) => formatMoney(r.tax) },
        { key: 'net', header: 'Net', align: 'right', render: (r) => formatMoney(r.netSales) },
        { key: 'count', header: 'Sales', align: 'right', render: (r) => formatCount(r.saleCount) },
      ]}
    />
  )
}

function CategoryFigures({ rows }: { rows: SalesCategoryRow[] }) {
  const sorted = [...rows].sort((a, b) => b.netSales - a.netSales)
  return (
    <FigureTable
      rows={sorted}
      rowKey={(r) => r.categoryId}
      caption="Sales by category"
      swatch={() => seriesColor(0)}
      columns={[
        { key: 'name', header: 'Category', render: (r) => r.categoryName },
        { key: 'qty', header: 'Qty', align: 'right', render: (r) => formatCount(r.quantity) },
        { key: 'net', header: 'Net', align: 'right', render: (r) => formatMoney(r.netSales) },
        { key: 'count', header: 'Sales', align: 'right', render: (r) => formatCount(r.saleCount) },
      ]}
    />
  )
}

function ProductFigures({ rows }: { rows: SalesProductRow[] }) {
  const sorted = [...rows].sort((a, b) => b.netSales - a.netSales)
  return (
    <FigureTable
      rows={sorted}
      rowKey={(r) => r.variantId}
      caption="Sales by product"
      swatch={() => seriesColor(1)}
      columns={[
        { key: 'name', header: 'Product', render: (r) => r.variantName },
        { key: 'sku', header: 'SKU', render: (r) => r.sku },
        { key: 'qty', header: 'Sold', align: 'right', render: (r) => formatCount(r.quantity) },
        { key: 'net', header: 'Net', align: 'right', render: (r) => formatMoney(r.netSales) },
      ]}
    />
  )
}

function CashierFigures({ rows }: { rows: SalesCashierRow[] }) {
  const sorted = [...rows].sort((a, b) => b.netSales - a.netSales)
  return (
    <FigureTable
      rows={sorted}
      rowKey={(r) => r.cashierUserId}
      caption="Sales by cashier"
      swatch={() => seriesColor(5)}
      columns={[
        { key: 'name', header: 'Cashier', render: (r) => r.cashierName },
        { key: 'gross', header: 'Gross', align: 'right', render: (r) => formatMoney(r.grossSales) },
        { key: 'net', header: 'Net', align: 'right', render: (r) => formatMoney(r.netSales) },
        { key: 'count', header: 'Sales', align: 'right', render: (r) => formatCount(r.saleCount) },
      ]}
    />
  )
}

function PaymentFigures({ rows }: { rows: PaymentMethodRow[] }) {
  const total = rows.reduce((s, r) => s + r.amount, 0)
  return (
    <FigureTable
      rows={rows}
      rowKey={(r) => r.method}
      caption="Payment mix"
      swatch={(_, i) => seriesColor(i)}
      columns={[
        { key: 'method', header: 'Method', render: (r) => PAYMENT_LABELS[r.method] ?? r.method },
        { key: 'count', header: 'Count', align: 'right', render: (r) => formatCount(r.count) },
        { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatMoney(r.amount) },
        { key: 'share', header: 'Share', align: 'right', render: (r) => formatPercent(total > 0 ? r.amount / total : 0) },
      ]}
    />
  )
}

function TaxFigures({ rows }: { rows: TaxRow[] }) {
  return (
    <FigureTable
      rows={rows}
      rowKey={(r) => String(r.taxRate)}
      caption="Tax by rate"
      swatch={() => seriesColor(4)}
      columns={[
        { key: 'rate', header: 'Rate', render: (r) => `${(r.taxRate * 100).toFixed(2)}%` },
        { key: 'taxable', header: 'Taxable', align: 'right', render: (r) => formatMoney(r.taxableSales) },
        { key: 'tax', header: 'Tax collected', align: 'right', render: (r) => formatMoney(r.taxCollected) },
      ]}
    />
  )
}

function MarginFigures({ rows }: { rows: MarginRow[] }) {
  const sorted = [...rows].sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0))
  return (
    <FigureTable
      rows={sorted}
      rowKey={(r) => r.variantId}
      caption="Margin by product"
      columns={[
        { key: 'name', header: 'Product', render: (r) => r.variantName },
        { key: 'rev', header: 'Revenue', align: 'right', render: (r) => formatMoney(r.revenue) },
        {
          key: 'cogs',
          header: 'COGS',
          align: 'right',
          render: (r) => (r.costUnavailable ? '—' : formatMoney(r.cogs ?? 0)),
        },
        {
          key: 'margin',
          header: 'Margin',
          align: 'right',
          render: (r) =>
            r.costUnavailable ? (
              <span className="text-foreground-muted">cost n/a</span>
            ) : (
              <span className={(r.margin ?? 0) < 0 ? 'text-danger' : 'text-foreground'}>{formatMoney(r.margin ?? 0)}</span>
            ),
        },
        {
          key: 'pct',
          header: 'Margin %',
          align: 'right',
          render: (r) =>
            r.costUnavailable ? '—' : (
              <span className={(r.marginPct ?? 0) < 0 ? 'text-danger' : 'text-success'}>
                {formatPercent((r.marginPct ?? 0) / 100)}
              </span>
            ),
        },
      ]}
    />
  )
}
