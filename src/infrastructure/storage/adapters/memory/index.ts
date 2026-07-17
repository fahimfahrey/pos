import { MemoryStorageDriver } from './memory-driver'
import { registerEngine } from '../../core/engine-registry'

registerEngine('memory', () => new MemoryStorageDriver())

export { MemoryStorageDriver }
