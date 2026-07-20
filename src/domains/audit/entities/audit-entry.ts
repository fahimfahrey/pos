export interface AuditEntry {
  id: string
  orgId: string
  branchId?: string
  actorId: string
  action: string
  entityType: string
  entityId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  createdAt: Date
}
