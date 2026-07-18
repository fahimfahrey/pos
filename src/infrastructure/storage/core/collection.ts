import type { DriverTransaction, CollectionName } from './driver'

export class Collection<T extends { id: string }> {
  constructor(
    private tx: DriverTransaction,
    private name: CollectionName,
  ) {}

  get(id: string): Promise<T | undefined> {
    return this.tx.get<T>(this.name, id)
  }

  getAll(): Promise<T[]> {
    return this.tx.getAll<T>(this.name)
  }

  put(value: T): Promise<void> {
    return this.tx.put<T>(this.name, value)
  }

  delete(id: string): Promise<void> {
    return this.tx.delete(this.name, id)
  }

  async find(pred: (v: T) => boolean): Promise<T | null> {
    const all = await this.getAll()
    return all.find(pred) ?? null
  }

  async filter(pred: (v: T) => boolean): Promise<T[]> {
    const all = await this.getAll()
    return all.filter(pred)
  }

  async findByIndex(index: string, key: unknown, fallbackPred: (v: T) => boolean): Promise<T | null> {
    if (this.tx.getByIndex) {
      const result = await this.tx.getByIndex<T>(this.name, index, key)
      return result ?? null
    }
    const all = await this.getAll()
    return all.find(fallbackPred) ?? null
  }
}
