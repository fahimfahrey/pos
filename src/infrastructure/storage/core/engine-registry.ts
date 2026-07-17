import type { DriverFactory } from './driver'

const registry = new Map<string, DriverFactory>()

export function registerEngine(name: string, factory: DriverFactory): void {
  registry.set(name, factory)
}

export function resolveEngine(name: string): DriverFactory {
  const factory = registry.get(name)
  if (!factory) {
    const available = Array.from(registry.keys())
    throw new Error(
      `Storage engine '${name}' not found. Registered engines: ${available.join(', ')}`,
    )
  }
  return factory
}

export function getRegisteredEngines(): string[] {
  return Array.from(registry.keys())
}
