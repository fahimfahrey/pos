// eslint-disable-next-line boundaries/no-unknown
import type { PromotionsRepository } from '@domains/promotions/repository'
 
import type { Promotion } from '@domains/promotions/entities/promotion'
import type { PromotionRedemption } from '@domains/promotions/entities/promotion-redemption'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CorePromotionsRepository implements PromotionsRepository {
  private collection: Collection<Promotion>
  private redemptionCollection: Collection<PromotionRedemption>

  constructor(tx: DriverTransaction) {
    this.collection = new Collection<Promotion>(tx, 'promotions')
    this.redemptionCollection = new Collection<PromotionRedemption>(tx, 'promotionRedemptions')
  }

  async save(promotion: Promotion): Promise<void> {
    await this.collection.put(promotion)
  }

  async findById(id: string): Promise<Promotion | null> {
    return (await this.collection.get(id)) ?? null
  }

  async findByCode(code: string): Promise<Promotion | null> {
    return this.collection.find((p) => p.code === code)
  }

  async listActive(): Promise<Promotion[]> {
    return this.collection.filter((p) => p.active)
  }

  async listAll(): Promise<Promotion[]> {
    return this.collection.getAll()
  }

  async deactivate(id: string): Promise<void> {
    const promo = await this.findById(id)
    if (!promo) throw new Error(`Promotion ${id} not found`)
    promo.active = false
    await this.collection.put(promo)
  }

  async listActiveForOrg(orgId: string): Promise<Promotion[]> {
    return this.collection.filter((p) => p.active && p.orgId === orgId)
  }

  async findByCodeForOrg(orgId: string, code: string): Promise<Promotion | null> {
    return this.collection.find((p) => p.orgId === orgId && p.code === code)
  }

  async saveRedemption(redemption: PromotionRedemption): Promise<void> {
    await this.redemptionCollection.put(redemption)
  }

  async countRedemptions(promotionId: string): Promise<number> {
    const redemptions = await this.redemptionCollection.filter((r) => r.promotionId === promotionId)
    return redemptions.length
  }

  async countRedemptionsForCustomer(promotionId: string, customerId: string): Promise<number> {
    const redemptions = await this.redemptionCollection.filter(
      (r) => r.promotionId === promotionId && r.customerId === customerId,
    )
    return redemptions.length
  }
}
