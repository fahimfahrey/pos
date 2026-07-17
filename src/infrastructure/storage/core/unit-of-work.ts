import type { RepositorySet } from './repository-set'
import type { StorageDriver, CollectionName } from './driver'
import { buildRepositorySet } from './repositories/build-repository-set'

export interface UnitOfWork {
  readonly repositories: RepositorySet
  commit(): Promise<void>
  rollback(): Promise<void>
}

class InternalUnitOfWork implements UnitOfWork {
  private committed = false
  private rolledBack = false
  readonly repositories: RepositorySet

  constructor(
    private driver: StorageDriver,
    private collections: CollectionName[],
    repositories: RepositorySet,
  ) {
    this.repositories = repositories
  }

  async commit(): Promise<void> {
    if (this.committed) throw new Error('UnitOfWork already committed')
    if (this.rolledBack) throw new Error('UnitOfWork already rolled back')
    this.committed = true
  }

  async rollback(): Promise<void> {
    if (this.committed) throw new Error('UnitOfWork already committed')
    if (this.rolledBack) throw new Error('UnitOfWork already rolled back')
    this.rolledBack = true
  }
}

export async function withTransaction<T>(
  driver: StorageDriver,
  collections: CollectionName[],
  fn: (repositories: RepositorySet) => Promise<T>,
): Promise<T> {
  return driver.transaction(collections, 'readwrite', async (tx) => {
    const repositories = buildRepositorySet(tx)
    return fn(repositories)
  })
}
