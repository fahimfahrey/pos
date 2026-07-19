import type { Promotion, PromotionComboLine } from '@domains/promotions/entities/promotion'

export interface PromotionCartLine {
  variantId: string
  categoryId?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface PromotionEvalContext {
  now: Date
  timezone: string
}

export interface AppliedPromotion {
  promotionId: string
  discountAmount: number
}

export interface PromotionEvaluationResult {
  applied: AppliedPromotion[]
  totalDiscount: number
}

export function isPromotionActive(promotion: Promotion, ctx: PromotionEvalContext): boolean {
  if (!promotion.active) {
    return false
  }

  if (ctx.now < promotion.validFrom || ctx.now > promotion.validTo) {
    return false
  }

  if (promotion.kind === 'happy_hour' && promotion.activeWindow) {
    return isTimeWindowActive(ctx.now, ctx.timezone, promotion.activeWindow, promotion.timezone)
  }

  return true
}

export function evaluatePromotions(
  lines: PromotionCartLine[],
  candidates: Promotion[],
  ctx: PromotionEvalContext,
): PromotionEvaluationResult {
  const activePromotions = candidates.filter((p) => isPromotionActive(p, ctx))

  const cartSubtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)

  const { exclusive, stackable } = partitionPromotions(activePromotions)

  const applicableStackable = stackable.filter((p) =>
    isPromotionApplicable(p, lines),
  )

  const applicableExclusive = exclusive.filter((p) =>
    isPromotionApplicable(p, lines),
  )

  const applied: AppliedPromotion[] = []
  let runningSubtotal = cartSubtotal

  if (applicableExclusive.length > 0) {
    const bestExclusive = selectBestExclusivePromotion(applicableExclusive, cartSubtotal)
    const discount = computeDiscount(bestExclusive, cartSubtotal)
    applied.push({ promotionId: bestExclusive.id, discountAmount: discount })
    runningSubtotal -= discount
  }

  for (const promotion of applicableStackable) {
    const discount = computeDiscount(promotion, runningSubtotal)
    if (discount > 0) {
      applied.push({ promotionId: promotion.id, discountAmount: discount })
      runningSubtotal -= discount
    }
  }

  const totalDiscount = Math.min(
    applied.reduce((sum, p) => sum + p.discountAmount, 0),
    cartSubtotal,
  )

  return { applied, totalDiscount }
}

function partitionPromotions(promotions: Promotion[]): { exclusive: Promotion[]; stackable: Promotion[] } {
  const exclusive = promotions.filter((p) => !p.stackable)
  const stackable = promotions.filter((p) => p.stackable)

  return { exclusive, stackable }
}

function isPromotionApplicable(promotion: Promotion, lines: PromotionCartLine[]): boolean {
  if (promotion.kind === 'combo' && promotion.comboLines) {
    for (const comboLine of promotion.comboLines) {
      const cartLine = lines.find((l) => l.variantId === comboLine.variantId)
      if (!cartLine || cartLine.quantity < comboLine.quantity) {
        return false
      }
    }
  }

  return true
}

function selectBestExclusivePromotion(exclusivePromotions: Promotion[], subtotal: number): Promotion {
  let best = exclusivePromotions[0]
  let bestDiscount = computeDiscount(best, subtotal)

  for (let i = 1; i < exclusivePromotions.length; i++) {
    const promo = exclusivePromotions[i]
    const discount = computeDiscount(promo, subtotal)

    if (discount > bestDiscount || (discount === bestDiscount && promo.priority < best.priority)) {
      best = promo
      bestDiscount = discount
    }
  }

  return best
}

function computeDiscount(promotion: Promotion, subtotal: number): number {
  if (promotion.kind === 'percentage_discount') {
    return Math.floor((subtotal * promotion.value) / 100 * 100) / 100
  }

  if (promotion.kind === 'fixed_discount' || promotion.kind === 'combo') {
    const discountType = promotion.comboDiscountType || 'fixed_amount'
    if (discountType === 'percentage') {
      return Math.floor((subtotal * promotion.value) / 100 * 100) / 100
    }
    return Math.min(promotion.value, subtotal)
  }

  return 0
}

interface PromotionTimeWindow {
  startTime: string
  endTime: string
  daysOfWeek: string[]
}

function isTimeWindowActive(
  now: Date,
  defaultTimezone: string,
  activeWindow: PromotionTimeWindow,
  promotionTimezone?: string,
): boolean {
  const timezone = promotionTimezone || defaultTimezone

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const dayMap: Record<string, string> = {
    Mon: 'Mon',
    Tue: 'Tue',
    Wed: 'Wed',
    Thu: 'Thu',
    Fri: 'Fri',
    Sat: 'Sat',
    Sun: 'Sun',
  }

  let dayOfWeek = ''
  let hour = ''
  let minute = ''

  for (const part of parts) {
    if (part.type === 'weekday') {
      dayOfWeek = part.value
    }
    if (part.type === 'hour') {
      hour = part.value
    }
    if (part.type === 'minute') {
      minute = part.value
    }
  }

  if (!activeWindow.daysOfWeek.includes(dayOfWeek)) {
    return false
  }

  const currentTime = `${hour}:${minute}`
  return currentTime >= activeWindow.startTime && currentTime < activeWindow.endTime
}
