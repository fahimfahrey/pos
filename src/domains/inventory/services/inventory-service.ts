import { STOCK_MOVEMENT_TYPE } from '@constants/enums'
import type { StockMovement } from '@domains/inventory/entities/stock-movement'
import type { StockLevel } from '@domains/inventory/entities/stock-level'
import type { StocktakeSession } from '@domains/inventory/entities/stocktake-session'
import type { StocktakeCount } from '@domains/inventory/entities/stocktake-count'
// eslint-disable-next-line boundaries/no-unknown
import type { InventoryRepository } from '@domains/inventory/repository'
import { InsufficientStockError } from '@domains/inventory/errors'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import { ValidationError } from '@shared/errors'

export class InventoryService {
  constructor(
    private clock: Clock,
    private ids: IdGenerator,
  ) {}

  private async applyMovement(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      branchId: string
      variantId: string
      quantity: number
      movementType: string
      reason?: string
      reference?: string
      relatedMovementId?: string
      unitCost?: number
      createdBy: string
      allowOversell: boolean
    },
  ): Promise<{ level: StockLevel; movement: StockMovement }> {
    const current = await repos.inventory.findStockLevel(input.branchId, input.variantId)
    const currentQuantity = current?.quantity ?? 0
    const newQuantity = currentQuantity + input.quantity

    if (newQuantity < 0 && !input.allowOversell) {
      throw new InsufficientStockError(
        `Insufficient stock: have ${currentQuantity}, attempting to move ${input.quantity}`,
      )
    }

    const level: StockLevel = {
      id: current?.id ?? this.ids.next(),
      orgId: input.orgId,
      branchId: input.branchId,
      variantId: input.variantId,
      quantity: newQuantity,
      reorderThreshold: current?.reorderThreshold,
      updatedAt: this.clock.now(),
    }

    const movement: StockMovement = {
      id: this.ids.next(),
      orgId: input.orgId,
      branchId: input.branchId,
      variantId: input.variantId,
      quantity: input.quantity,
      movementType: input.movementType as any,
      reason: input.reason,
      reference: input.reference,
      relatedMovementId: input.relatedMovementId,
      unitCost: input.unitCost,
      createdAt: this.clock.now(),
      createdBy: input.createdBy,
    }

    await repos.inventory.saveStockLevel(level)
    await repos.inventory.appendMovement(movement)

    return { level, movement }
  }

  async receivePurchase(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      branchId: string
      variantId: string
      quantity: number
      reference?: string
      unitCost?: number
      createdBy: string
      allowOversell: boolean
    },
  ) {
    return this.applyMovement(repos, {
      ...input,
      quantity: Math.abs(input.quantity),
      movementType: STOCK_MOVEMENT_TYPE.PURCHASE,
    })
  }

  async recordSale(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      branchId: string
      variantId: string
      quantity: number
      reference: string
      createdBy: string
      allowOversell: boolean
    },
  ) {
    return this.applyMovement(repos, {
      ...input,
      quantity: -Math.abs(input.quantity),
      movementType: STOCK_MOVEMENT_TYPE.SALE,
    })
  }

  async recordReturn(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      branchId: string
      variantId: string
      quantity: number
      reference?: string
      createdBy: string
      allowOversell: boolean
    },
  ) {
    return this.applyMovement(repos, {
      ...input,
      quantity: Math.abs(input.quantity),
      movementType: STOCK_MOVEMENT_TYPE.RETURN,
    })
  }

  async adjustStock(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      branchId: string
      variantId: string
      quantity: number
      reason: string
      createdBy: string
      allowOversell: boolean
    },
  ) {
    if (!input.reason?.trim()) {
      throw new ValidationError('Reason is required for stock adjustment')
    }

    return this.applyMovement(repos, {
      ...input,
      movementType: STOCK_MOVEMENT_TYPE.ADJUSTMENT,
    })
  }

  async transferStock(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      variantId: string
      fromBranchId: string
      toBranchId: string
      quantity: number
      createdBy: string
      allowOversellAtSource: boolean
    },
  ) {
    if (input.fromBranchId === input.toBranchId) {
      throw new ValidationError('Source and destination branches must be different')
    }

    if (input.quantity <= 0) {
      throw new ValidationError('Transfer quantity must be positive')
    }

    const transferId = this.ids.next()
    const outMovementId = this.ids.next()
    const inMovementId = this.ids.next()

    const outLeg = await this.applyMovement(repos, {
      orgId: input.orgId,
      branchId: input.fromBranchId,
      variantId: input.variantId,
      quantity: -input.quantity,
      movementType: STOCK_MOVEMENT_TYPE.TRANSFER,
      reference: transferId,
      relatedMovementId: inMovementId,
      createdBy: input.createdBy,
      allowOversell: input.allowOversellAtSource,
    })

    // Update the outLeg movement ID since we need to reference it
    outLeg.movement.id = outMovementId

    const inLeg = await this.applyMovement(repos, {
      orgId: input.orgId,
      branchId: input.toBranchId,
      variantId: input.variantId,
      quantity: input.quantity,
      movementType: STOCK_MOVEMENT_TYPE.TRANSFER,
      reference: transferId,
      relatedMovementId: outMovementId,
      createdBy: input.createdBy,
      allowOversell: true,
    })

    // Update the inLeg movement ID
    inLeg.movement.id = inMovementId

    return { outLeg: outLeg.movement, inLeg: inLeg.movement }
  }

  async listLowStock(repos: { inventory: InventoryRepository }, branchId: string) {
    return repos.inventory.listLowStock(branchId)
  }

  async startStocktakeSession(
    repos: { inventory: InventoryRepository },
    input: {
      orgId: string
      branchId: string
      createdBy: string
    },
  ) {
    const session: StocktakeSession = {
      id: this.ids.next(),
      orgId: input.orgId,
      branchId: input.branchId,
      status: 'open' as const,
      createdBy: input.createdBy,
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }

    await repos.inventory.saveStocktakeSession(session)
    return session
  }

  async recordCount(
    repos: { inventory: InventoryRepository },
    input: {
      sessionId: string
      variantId: string
      countedQuantity: number
      countedBy: string
    },
  ) {
    const session = await repos.inventory.findStocktakeSessionById(input.sessionId)
    if (!session || session.status !== 'open') {
      throw new ValidationError('Session must be open to record counts')
    }

    const currentLevel = await repos.inventory.findStockLevel(session.branchId, input.variantId)
    const expectedQuantityAtCount = currentLevel?.quantity ?? 0

    const count: StocktakeCount = {
      id: this.ids.next(),
      sessionId: input.sessionId,
      variantId: input.variantId,
      countedQuantity: input.countedQuantity,
      expectedQuantityAtCount,
      countedBy: input.countedBy,
      countedAt: this.clock.now(),
    }

    await repos.inventory.saveStocktakeCount(count)
    return count
  }

  async submitStocktakeSession(
    repos: { inventory: InventoryRepository },
    sessionId: string,
  ) {
    const session = await repos.inventory.findStocktakeSessionById(sessionId)
    if (!session) {
      throw new ValidationError('Session not found')
    }

    if (session.status !== 'open') {
      throw new ValidationError('Only open sessions can be submitted')
    }

    session.status = 'submitted' as const
    session.submittedAt = this.clock.now()
    session.updatedAt = this.clock.now()

    await repos.inventory.saveStocktakeSession(session)
    return session
  }

  async getVarianceReport(repos: { inventory: InventoryRepository }, sessionId: string) {
    const session = await repos.inventory.findStocktakeSessionById(sessionId)
    if (!session) {
      throw new ValidationError('Session not found')
    }

    const counts = await repos.inventory.listStocktakeCounts(sessionId)
    const levels = await repos.inventory.listStockLevelsByBranch(session.branchId)

    return counts.map((count) => {
      const currentLevel = levels.find((l) => l.variantId === count.variantId)
      const currentQuantity = currentLevel?.quantity ?? 0
      const variance = count.countedQuantity - currentQuantity

      return {
        variantId: count.variantId,
        expectedQuantityAtCount: count.expectedQuantityAtCount,
        currentQuantity,
        countedQuantity: count.countedQuantity,
        variance,
      }
    })
  }

  async approveStocktakeSession(
    repos: { inventory: InventoryRepository },
    input: {
      sessionId: string
      approvedBy: string
      allowOversell: boolean
    },
  ) {
    const session = await repos.inventory.findStocktakeSessionById(input.sessionId)
    if (!session) {
      throw new ValidationError('Session not found')
    }

    if (session.status !== 'submitted') {
      throw new ValidationError('Only submitted sessions can be approved')
    }

    const report = await this.getVarianceReport(repos, input.sessionId)

    for (const item of report) {
      if (item.variance !== 0) {
        await this.applyMovement(repos, {
          orgId: session.orgId,
          branchId: session.branchId,
          variantId: item.variantId,
          quantity: item.variance,
          movementType: STOCK_MOVEMENT_TYPE.STOCKTAKE,
          reason: `Stocktake session ${input.sessionId} approval`,
          reference: input.sessionId,
          createdBy: input.approvedBy,
          allowOversell: input.allowOversell,
        })
      }
    }

    session.status = 'approved' as const
    session.approvedBy = input.approvedBy
    session.approvedAt = this.clock.now()
    session.updatedAt = this.clock.now()

    await repos.inventory.saveStocktakeSession(session)
    return session
  }
}
