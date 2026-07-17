// eslint-disable-next-line boundaries/no-unknown
import type { PromotionsRepository } from '@domains/promotions/repository'
 
import type { Promotion } from '@domains/promotions/entities/promotion'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CorePromotionsRepository implements PromotionsRepository {
  private collection: Collection<Promotion>

  constructor(tx: DriverTransaction) {
    this.collection = new Collection<Promotion>(tx, 'promotions')
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
}
