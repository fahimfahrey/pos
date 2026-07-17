export interface AuditEntry {
  id: string
  entityType: string
  entityId: string
  action: string
  actorId: string
  changes?: Record<string, unknown>
  createdAt: Date
}
