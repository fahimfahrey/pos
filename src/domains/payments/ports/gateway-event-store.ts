export interface GatewayWebhookEvent {
  id: string
  gateway: string
  externalEventId: string
  receivedAt: Date
}

export interface GatewayEventStore {
  hasProcessed(gateway: string, externalEventId: string): Promise<boolean>
  markProcessed(event: GatewayWebhookEvent): Promise<void>
}
