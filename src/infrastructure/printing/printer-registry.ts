import type { Printer } from '@shared/ports/printer'
import { PrinterNotRegisteredError } from './errors'

export type PrinterFactory = () => Printer

const registry = new Map<string, PrinterFactory>()

export function registerPrinter(id: string, factory: PrinterFactory): void {
  registry.set(id, factory)
}

export function resolvePrinter(id: string): Printer {
  const factory = registry.get(id)
  if (!factory) {
    const available = Array.from(registry.keys()).join(', ')
    throw new PrinterNotRegisteredError(
      `Printer '${id}' not registered. Available: ${available}`,
    )
  }
  return factory()
}

export function getRegisteredPrinters(): string[] {
  return Array.from(registry.keys())
}
