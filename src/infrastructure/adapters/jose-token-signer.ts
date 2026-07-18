import type { TokenSigner } from '@shared/ports/token-signer'
import type { SessionClaims } from '@domains/auth/entities/session-claims'
import { signToken, verifyToken } from '@domains/auth/services/token'

export class JoseTokenSigner implements TokenSigner {
  constructor(private secret: string) {}

  async sign(
    claims: Omit<SessionClaims, 'iat' | 'exp'>,
    options?: { ttlSeconds?: number },
  ): Promise<string> {
    return signToken(claims, this.secret, options)
  }

  async verify(token: string): Promise<SessionClaims | null> {
    return verifyToken(token, this.secret)
  }
}
