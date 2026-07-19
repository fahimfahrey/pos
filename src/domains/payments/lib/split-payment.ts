import { SplitPaymentTotalMismatchError } from '../errors'

export function sumPaymentAmounts(payments: { amount: number }[]): number {
  let totalCents = 0
  for (const payment of payments) {
    totalCents += Math.round(payment.amount * 100)
  }
  return Math.round(totalCents) / 100
}

export function assertSplitPaymentsCoverTotal(
  payments: { amount: number }[],
  total: number,
): void {
  const sum = sumPaymentAmounts(payments)
  const totalCents = Math.round(total * 100)
  const sumCents = Math.round(sum * 100)

  if (sumCents !== totalCents) {
    throw new SplitPaymentTotalMismatchError(
      `Split payment total ${sum} does not match expected total ${total}`,
    )
  }
}
