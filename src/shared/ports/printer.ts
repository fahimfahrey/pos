// NOTE: This port lives in shared but must not import @domains/* per boundaries rules.
// shared can only import shared and constants. The PrintJobPayload.document is typed
// as a structural shape (unknown at port level) to maintain this boundary. Infrastructure
// adapters (which CAN import entities/services) do the real typing and casting.
// This differs from PaymentGateway, which lives in @domains/payments/ports/ and can
// reference infrastructure types; Printer is cross-domain infra like EventBus and FileStore,
// so it takes the stricter shared/* boundary.

export interface PrintJobPayload {
  document: unknown
}

export interface PrinterCapabilities {
  supportsBrowserPrint: boolean
  supportsPdf: boolean
  supportsEscPos: boolean
}

export interface Printer {
  readonly id: string
  isAvailable(): Promise<boolean>
  print(payload: PrintJobPayload): Promise<{ jobId: string }>
}
