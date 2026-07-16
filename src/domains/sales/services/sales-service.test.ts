import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SalesService } from './sales-service'
import { ORDER_STATUS } from '@constants/enums/order-status'
import type { SalesRepository } from '@domains/sales/repositories/sales-repository'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'

describe('SalesService', () => {
  let service: SalesService
  let mockRepo: SalesRepository
  let mockClock: Clock
  let mockIds: IdGenerator
  let savedOrders: any[] = []

  beforeEach(() => {
    savedOrders = []

    mockRepo = {
      save: vi.fn(async order => {
        savedOrders.push(order)
      }),
      findById: vi.fn(),
      listOpen: vi.fn(),
    }

    mockClock = {
      now: vi.fn(() => new Date('2024-01-01T12:00:00Z')),
    }

    mockIds = {
      next: vi.fn(() => 'test-id-123'),
    }

    service = new SalesService(mockRepo, mockClock, mockIds)
  })

  it('should create an order with draft status', async () => {
    const order = await service.createOrder([
      {
        productId: 'prod-1',
        quantity: 2,
        unitPrice: { amount: 10, currency: 'USD' },
      },
    ])

    expect(order.status).toBe(ORDER_STATUS.DRAFT)
    expect(order.id).toBe('test-id-123')
    expect(order.lines).toHaveLength(1)
    expect(order.total.amount).toBe(20)
  })

  it('should save order to repository', async () => {
    await service.createOrder([
      {
        productId: 'prod-1',
        quantity: 1,
        unitPrice: { amount: 100, currency: 'USD' },
      },
    ])

    expect(mockRepo.save).toHaveBeenCalled()
    expect(savedOrders).toHaveLength(1)
    expect(savedOrders[0]!.total.amount).toBe(100)
  })

  it('should find an order by id', async () => {
    const expectedOrder = {
      id: 'order-1',
      status: ORDER_STATUS.PAID,
      lines: [],
      total: { amount: 100, currency: 'USD' },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockRepo.findById = vi.fn(async () => expectedOrder)

    const order = await service.findOrder('order-1')
    expect(order).toEqual(expectedOrder)
  })

  it('should list open orders', async () => {
    const openOrders = [
      {
        id: 'order-1',
        status: ORDER_STATUS.OPEN,
        lines: [],
        total: { amount: 50, currency: 'USD' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockRepo.listOpen = vi.fn(async () => openOrders)

    const orders = await service.listOpenOrders()
    expect(orders).toHaveLength(1)
    expect(orders[0]!.status).toBe(ORDER_STATUS.OPEN)
  })
})
