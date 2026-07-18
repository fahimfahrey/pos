export interface SessionStore {
  set(token: string, expiresAt: Date): Promise<void>
  get(): Promise<string | null>
  clear(): Promise<void>
}
