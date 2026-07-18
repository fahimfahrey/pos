import type { SessionClaims } from '@domains/auth/entities/session-claims'

export interface TokenSigner {
  sign(claims: SessionClaims, options?: { ttlSeconds?: number }): Promise<string>
  verify(token: string): Promise<SessionClaims | null>
}
