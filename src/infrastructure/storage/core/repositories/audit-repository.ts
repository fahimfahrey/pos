// eslint-disable-next-line boundaries/no-unknown
import type { AuditRepository } from '@domains/audit/repository'
 
import type { AuditEntry } from '@domains/audit/entities/audit-entry'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreAuditRepository implements AuditRepository {
  private collection: Collection<AuditEntry>

  constructor(tx: DriverTransaction) {
    this.collection = new Collection<AuditEntry>(tx, 'auditEntries')
  }

  async append(entry: AuditEntry): Promise<void> {
    await this.collection.put(entry)
  }

  async findById(id: string): Promise<AuditEntry | null> {
    return (await this.collection.get(id)) ?? null
  }

  async listByEntity(type: string, id: string): Promise<AuditEntry[]> {
    return this.collection.filter((e) => e.entityType === type && e.entityId === id)
  }

  async listByActor(actorId: string): Promise<AuditEntry[]> {
    return this.collection.filter((e) => e.actorId === actorId)
  }

  async listByDateRange(from: Date, to: Date): Promise<AuditEntry[]> {
    return this.collection.filter((e) => e.createdAt >= from && e.createdAt <= to)
  }

  async listByOrg(orgId: string): Promise<AuditEntry[]> {
    return this.collection.filter((e) => e.orgId === orgId)
  }
}
