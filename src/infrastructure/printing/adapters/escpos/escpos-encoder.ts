import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'

const ESC = '\x1B'
const GS = '\x1D'

export function encodeReceipt(document: ReceiptDocument): Uint8Array {
  const parts: Uint8Array[] = []

  // Initialize printer
  parts.push(encodeString(`${ESC}@`)) // Reset

  // Set print mode: character set
  parts.push(encodeString(`${ESC}t\x00`)) // ASCII

  // Center align
  parts.push(encodeString(`${ESC}a\x01`))

  // Header
  if (document.org.logoUrl) {
    // Note: Actual image printing via ESC/POS requires image data processing
    // For now, we'll just print the org name
  }

  parts.push(encodeString(padCenter(document.org.name, 40)))
  parts.push(encodeString('\n'))

  if (document.branch.name) {
    parts.push(encodeString(padCenter(document.branch.name, 40)))
    parts.push(encodeString('\n'))
  }

  if (document.branch.address) {
    parts.push(encodeString(padCenter(document.branch.address, 40)))
    parts.push(encodeString('\n'))
  }

  if (document.branch.taxRegistrationNumber) {
    parts.push(encodeString(padCenter(`TRN: ${document.branch.taxRegistrationNumber}`, 40)))
    parts.push(encodeString('\n'))
  }

  parts.push(encodeString('\n'))

  // Left align for items
  parts.push(encodeString(`${ESC}a\x00`))

  // Divider
  parts.push(encodeString('-'.repeat(40)))
  parts.push(encodeString('\n'))

  // Items
  for (const item of document.lines) {
    const quantity = item.quantity.toString()
    const price = formatPrice(item.total)
    const name = truncate(item.name, 40 - quantity.length - price.length - 2)

    parts.push(
      encodeString(`${name} ${quantity}x${padLeft(price, price.length)}\n`),
    )
  }

  // Divider
  parts.push(encodeString('-'.repeat(40)))
  parts.push(encodeString('\n'))

  // Totals
  const subtotalLabel = 'Subtotal:'
  const subtotalPrice = formatPrice(document.subtotal)
  parts.push(
    encodeString(
      padRight(subtotalLabel, 40 - subtotalPrice.length) + subtotalPrice + '\n',
    ),
  )

  if (document.discount > 0) {
    const discountLabel = 'Discount:'
    const discountPrice = '-' + formatPrice(document.discount)
    parts.push(
      encodeString(
        padRight(discountLabel, 40 - discountPrice.length) + discountPrice + '\n',
      ),
    )
  }

  const taxLabel = 'Tax:'
  const taxPrice = formatPrice(document.tax)
  parts.push(
    encodeString(
      padRight(taxLabel, 40 - taxPrice.length) + taxPrice + '\n',
    ),
  )

  // Tax breakdown if available
  if (document.taxBreakdown.length > 0) {
    for (const breakdown of document.taxBreakdown) {
      const rate = `${(breakdown.rate * 100).toFixed(0)}%`
      const amount = formatPrice(breakdown.taxAmount)
      const label = `Tax ${rate}:`
      parts.push(
        encodeString(
          padRight(label, 40 - amount.length) + amount + '\n',
        ),
      )
    }
  }

  // Divider and grand total
  parts.push(encodeString('='.repeat(40)))
  parts.push(encodeString('\n'))

  parts.push(encodeString(`${ESC}E\x01`)) // Bold on
  const totalLabel = 'TOTAL:'
  const totalPrice = formatPrice(document.total)
  parts.push(
    encodeString(
      padRight(totalLabel, 40 - totalPrice.length) + totalPrice + '\n',
    ),
  )
  parts.push(encodeString(`${ESC}E\x00`)) // Bold off

  // Payments
  if (document.payments.length > 0) {
    parts.push(encodeString('-'.repeat(40)))
    parts.push(encodeString('\n'))

    for (const payment of document.payments) {
      const method = truncate(payment.method, 20)
      const amount = formatPrice(payment.amount)
      parts.push(
        encodeString(
          padRight(method, 40 - amount.length) + amount + '\n',
        ),
      )

      if (payment.tendered && payment.tendered > 0) {
        const tenderLabel = 'Tendered:'
        const tenderPrice = formatPrice(payment.tendered)
        parts.push(
          encodeString(
            padRight(tenderLabel, 40 - tenderPrice.length) + tenderPrice + '\n',
          ),
        )
      }

      if (payment.changeDue && payment.changeDue > 0) {
        const changeLabel = 'Change:'
        const changePrice = formatPrice(payment.changeDue)
        parts.push(
          encodeString(
            padRight(changeLabel, 40 - changePrice.length) + changePrice + '\n',
          ),
        )
      }
    }
  }

  // Footer
  parts.push(encodeString('\n'))
  parts.push(encodeString(`${ESC}a\x01`)) // Center align
  parts.push(encodeString(`Receipt #${document.receiptNumber}\n`))
  parts.push(encodeString(formatDate(document.issuedAt)))
  parts.push(encodeString('\n'))

  if (document.footerText) {
    parts.push(encodeString(document.footerText))
    parts.push(encodeString('\n'))
  }

  parts.push(encodeString('\n\n'))

  // Cut paper
  parts.push(encodeString(`${GS}V\x41\x03\x00`)) // Partial cut

  // Combine all parts
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result
}

function encodeString(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

function formatPrice(amount: number): string {
  return '$' + amount.toFixed(2)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function padLeft(str: string, width: number): string {
  return str.padStart(width, ' ')
}

function padRight(str: string, width: number): string {
  return str.padEnd(width, ' ')
}

function padCenter(str: string, width: number): string {
  const padding = Math.max(0, width - str.length)
  const leftPad = Math.floor(padding / 2)
  const rightPad = padding - leftPad
  return ' '.repeat(leftPad) + str + ' '.repeat(rightPad)
}

function truncate(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 1) + '…'
  }
  return str
}
