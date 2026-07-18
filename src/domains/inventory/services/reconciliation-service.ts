// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'

export interface DriftReport {
  orgId: string
  branchId: string
  variantId: string
  expectedQuantity: number
  actualQuantity: number
  drift: number
}

export class ReconciliationService {
  async reconcileBranch(
    repos: { inventory: InventoryRepository },
    orgId: string,
    branchId: string,
  ): Promise<DriftReport[]> {
    const movements = await repos.inventory.listMovementsForBranch(orgId, branchId)
    const levels = await repos.inventory.listStockLevelsByBranch(branchId)

    const expectedMap = new Map<string, number>()
    for (const movement of movements) {
      const current = expectedMap.get(movement.variantId) ?? 0
      expectedMap.set(movement.variantId, current + movement.quantity)
    }

    const variantIds = new Set<string>()
    for (const m of movements) {
      variantIds.add(m.variantId)
    }
    for (const l of levels) {
      variantIds.add(l.variantId)
    }

    const driftReports: DriftReport[] = []

    for (const variantId of variantIds) {
      const expectedQuantity = expectedMap.get(variantId) ?? 0
      const level = levels.find((l) => l.variantId === variantId)
      const actualQuantity = level?.quantity ?? 0
      const drift = actualQuantity - expectedQuantity

      if (drift !== 0) {
        driftReports.push({
          orgId,
          branchId,
          variantId,
          expectedQuantity,
          actualQuantity,
          drift,
        })
      }
    }

    return driftReports
  }
}
