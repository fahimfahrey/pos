import type { Promotion } from '@domains/promotions/entities/promotion'

export interface PromotionsRepository {
  save(promotion: Promotion): Promise<void>
  findById(id: string): Promise<Promotion | null>
  findByCode(code: string): Promise<Promotion | null>
  listActive(): Promise<Promotion[]>
  listAll(): Promise<Promotion[]>
  deactivate(id: string): Promise<void>
}
