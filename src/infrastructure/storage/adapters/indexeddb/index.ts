import { registerEngine } from '../../core/engine-registry'
import { IndexedDBDriver } from './driver'
import { resolveDatabaseName, ephemeralDatabaseName } from './database-name'

// Register the production IndexedDB engine
registerEngine('indexeddb', () => new IndexedDBDriver({ databaseName: resolveDatabaseName() }))

// Export public API
export { IndexedDBDriver }
export { exportBackupToFile, importBackupFromFile } from './backup'
export {
  StorageQuotaError,
  StorageUpgradeBlockedError,
  StorageCloneError,
  StorageUnavailableError,
  mapIndexedDbError,
} from './errors'
export { ephemeralDatabaseName }
