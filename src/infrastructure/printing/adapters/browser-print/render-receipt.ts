import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'

export function renderReceiptHtml(document: ReceiptDocument): string {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const logoHtml = document.org.logoUrl
    ? `<img src="${document.org.logoUrl}" alt="Logo" class="receipt-logo" />`
    : ''

  const headerHtml = `
    <div class="receipt-header">
      ${logoHtml}
      <div class="receipt-org-name">${escapeHtml(document.org.name)}</div>
      <div class="receipt-branch-info">
        ${escapeHtml(document.branch.name)}
        ${document.branch.address ? `<br>${escapeHtml(document.branch.address)}` : ''}
        ${document.branch.taxRegistrationNumber ? `<br>TRN: ${escapeHtml(document.branch.taxRegistrationNumber)}` : ''}
      </div>
    </div>
  `

  const itemsHtml = document.lines
    .map(
      (line) => `
    <div class="receipt-item-row">
      <div class="receipt-item-name">${escapeHtml(line.name)}</div>
      <div class="receipt-item-qty">${line.quantity}x</div>
      <div class="receipt-item-price">${formatCurrency(line.total)}</div>
    </div>
  `,
    )
    .join('')

  const subtotalHtml = `
    <div class="receipt-total-row">
      <div class="receipt-total-label">Subtotal</div>
      <div class="receipt-total-value">${formatCurrency(document.subtotal)}</div>
    </div>
  `

  const discountHtml =
    document.discount > 0
      ? `
    <div class="receipt-total-row">
      <div class="receipt-total-label">Discount</div>
      <div class="receipt-total-value">-${formatCurrency(document.discount)}</div>
    </div>
  `
      : ''

  const taxBreakdownHtml = `
    <div class="receipt-tax-breakdown">
      ${document.taxBreakdown
        .map(
          (line) => `
      <div class="receipt-tax-line">
        <span>${(line.rate * 100).toFixed(0)}% Tax</span>
        <span>${formatCurrency(line.taxAmount)}</span>
      </div>
    `,
        )
        .join('')}
    </div>
  `

  const paymentsHtml = `
    <div class="receipt-payments">
      ${document.payments
        .map(
          (payment) => `
      <div class="receipt-payment-row">
        <span>${escapeHtml(payment.method)}</span>
        <span>${formatCurrency(payment.amount)}</span>
      </div>
      ${payment.tendered ? `<div class="receipt-payment-row"><span>Tendered</span><span>${formatCurrency(payment.tendered)}</span></div>` : ''}
    `,
        )
        .join('')}
    </div>
  `

  const changeHtml =
    document.changeDue > 0
      ? `
    <div class="receipt-change">
      <div class="receipt-total-row">
        <div class="receipt-total-label">Change</div>
        <div class="receipt-total-value">${formatCurrency(document.changeDue)}</div>
      </div>
    </div>
  `
      : ''

  const footerHtml = document.footerText
    ? `
    <div class="receipt-footer">
      ${escapeHtml(document.footerText)}
    </div>
  `
    : ''

  return `
    <div class="receipt-container">
      ${headerHtml}

      <div class="receipt-divider"></div>

      <div class="receipt-items">
        ${itemsHtml}
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-totals">
        ${subtotalHtml}
        ${discountHtml}
        <div class="receipt-total-row">
          <div class="receipt-total-label">Tax</div>
          <div class="receipt-total-value">${formatCurrency(document.tax)}</div>
        </div>
      </div>

      ${document.taxBreakdown.length > 0 ? taxBreakdownHtml : ''}

      <div class="receipt-divider"></div>

      <div class="receipt-grand-total">
        <div class="receipt-total-row">
          <div class="receipt-total-label">TOTAL</div>
          <div class="receipt-total-value">${formatCurrency(document.total)}</div>
        </div>
      </div>

      ${paymentsHtml}
      ${changeHtml}

      <div class="receipt-number">
        Receipt #${escapeHtml(document.receiptNumber)}
      </div>

      <div class="receipt-timestamp">
        ${formatDate(document.issuedAt)}
      </div>

      ${footerHtml}
    </div>
  `
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
