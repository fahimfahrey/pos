import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { AuditRepository } from '@domains/audit/repository'
import type { AuditEntry } from '@domains/audit/entities/audit-entry'

export interface RecordAuditEntryInput {
  orgId: string
  branchId?: string
  actorId: string
  action: string
  entityType: string
  entityId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export async function recordAuditEntry(
  repos: { audit: AuditRepository },
  ids: IdGenerator,
  clock: Clock,
  input: RecordAuditEntryInput,
): Promise<AuditEntry> {
  const entry: AuditEntry = {
    id: ids.next(),
    orgId: input.orgId,
    branchId: input.branchId,
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    before: input.before,
    after: input.after,
    createdAt: clock.now(),
  }

  await repos.audit.append(entry)
  return entry
}

export interface ListAuditEntriesFilter {
  branchId?: string
  action?: string
  from?: Date
  to?: Date
}

export async function listAuditEntriesForOrg(
  repos: { audit: AuditRepository },
  orgId: string,
  retentionDays: number,
  clock: Clock,
  filter?: ListAuditEntriesFilter,
): Promise<AuditEntry[]> {
  const allEntries = await repos.audit.listByOrg(orgId)

  const cutoff = new Date(clock.now())
  cutoff.setDate(cutoff.getDate() - retentionDays)

  return allEntries.filter((entry) => {
    if (entry.createdAt < cutoff) return false
    if (filter?.branchId && entry.branchId !== filter.branchId) return false
    if (filter?.action && entry.action !== filter.action) return false
    if (filter?.from && entry.createdAt < filter.from) return false
    if (filter?.to && entry.createdAt > filter.to) return false
    return true
  })
}
