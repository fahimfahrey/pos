import { SignJWT, jwtVerify } from 'jose'
import type { SessionClaims } from '../entities/session-claims'

const getSecret = (secret: string) => new TextEncoder().encode(secret)

export async function signToken(
  claims: Omit<SessionClaims, 'iat' | 'exp'>,
  secret: string,
  options?: { ttlSeconds?: number },
): Promise<string> {
  const ttlSeconds = options?.ttlSeconds ?? 3600

  const token = await new SignJWT(claims as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(getSecret(secret))

  return token
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<SessionClaims | null> {
  try {
    const verified = await jwtVerify(token, getSecret(secret))
    return verified.payload as SessionClaims
  } catch {
    return null
  }
}
