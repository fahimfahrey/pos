import type { Promotion } from '@domains/promotions/entities/promotion'
import type { PromotionsRepository } from '@domains/promotions/repository'
import {
  evaluatePromotions,
  type PromotionCartLine,
  type PromotionEvalContext,
  type PromotionEvaluationResult,
  type AppliedPromotion,
} from '@domains/promotions/lib/promotion-engine'
import { InvalidCouponCodeError } from '@domains/promotions/errors'

export class PromotionEngineService {
  async resolveCandidates(
    repos: { promotions: PromotionsRepository },
    input: { orgId: string; couponCodes?: string[] },
  ): Promise<Promotion[]> {
    const active = await repos.promotions.listActiveForOrg(input.orgId)

    const candidates = [...active]

    if (input.couponCodes && input.couponCodes.length > 0) {
      for (const code of input.couponCodes) {
        const promo = await repos.promotions.findByCodeForOrg(input.orgId, code)
        if (!promo || !promo.active) {
          throw new InvalidCouponCodeError(`Coupon code '${code}' is invalid or inactive`)
        }
        if (!candidates.find((p) => p.id === promo.id)) {
          candidates.push(promo)
        }
      }
    }

    return candidates
  }

  async evaluate(
    repos: { promotions: PromotionsRepository },
    input: {
      orgId: string
      lines: PromotionCartLine[]
      couponCodes?: string[]
      customerId?: string
      now: Date
      timezone: string
    },
  ): Promise<PromotionEvaluationResult> {
    const candidates = await this.resolveCandidates(repos, {
      orgId: input.orgId,
      couponCodes: input.couponCodes,
    })

    const fileredCandidates: Promotion[] = []

    for (const promo of candidates) {
      const usageCount = await repos.promotions.countRedemptions(promo.id)
      if (promo.maxUsages && usageCount >= promo.maxUsages) {
        continue
      }

      fileredCandidates.push(promo)
    }

    const ctx: PromotionEvalContext = {
      now: input.now,
      timezone: input.timezone,
    }

    return evaluatePromotions(input.lines, fileredCandidates, ctx)
  }

  async redeem(
    repos: { promotions: PromotionsRepository },
    input: {
      orgId: string
      saleId: string
      customerId?: string
      applied: AppliedPromotion[]
      now: Date
    },
  ): Promise<void> {
    for (const applied of input.applied) {
      const promo = await repos.promotions.findById(applied.promotionId)
      if (!promo) {
        continue
      }

      await repos.promotions.saveRedemption({
        id: crypto.randomUUID(),
        orgId: input.orgId,
        promotionId: applied.promotionId,
        saleId: input.saleId,
        customerId: input.customerId,
        discountAmount: applied.discountAmount,
        appliedAt: input.now,
      })
    }
  }
}
