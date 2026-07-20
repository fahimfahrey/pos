import type { AuditEntry } from '@domains/audit/entities/audit-entry'

export interface AuditRepository {
  append(entry: AuditEntry): Promise<void>
  findById(id: string): Promise<AuditEntry | null>
  listByEntity(type: string, id: string): Promise<AuditEntry[]>
  listByActor(actorId: string): Promise<AuditEntry[]>
  listByDateRange(from: Date, to: Date): Promise<AuditEntry[]>
  listByOrg(orgId: string): Promise<AuditEntry[]>
}
