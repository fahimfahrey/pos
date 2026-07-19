import type { Promotion } from '@domains/promotions/entities/promotion'
import type { PromotionRedemption } from '@domains/promotions/entities/promotion-redemption'

export interface PromotionsRepository {
  save(promotion: Promotion): Promise<void>
  findById(id: string): Promise<Promotion | null>
  findByCode(code: string): Promise<Promotion | null>
  listActive(): Promise<Promotion[]>
  listAll(): Promise<Promotion[]>
  deactivate(id: string): Promise<void>
  listActiveForOrg(orgId: string): Promise<Promotion[]>
  findByCodeForOrg(orgId: string, code: string): Promise<Promotion | null>
  saveRedemption(redemption: PromotionRedemption): Promise<void>
  countRedemptions(promotionId: string): Promise<number>
  countRedemptionsForCustomer(promotionId: string, customerId: string): Promise<number>
}
