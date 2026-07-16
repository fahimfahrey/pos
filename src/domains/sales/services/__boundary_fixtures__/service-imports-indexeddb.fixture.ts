// INTENTIONAL boundary violation used by tests/boundaries/boundaries.test.ts.
// A domain service must NEVER import a storage engine directly.
import { openDB } from 'idb'

export async function badService() {
  const db = await openDB('pos', 1)
  return db.get('orders', '1')
}
