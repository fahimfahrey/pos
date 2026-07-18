import type { AuthRepository } from '@domains/auth/repository'
import type { User, Session } from '@domains/auth/entities/user'
import type { SessionClaims } from '@domains/auth/entities/session-claims'
import type { SignupInput, LoginInput, SetPinInput } from '@domains/auth/entities/credentials'
import type { Hasher } from '@shared/ports/password-hasher'
import type { TokenSigner } from '@shared/ports/token-signer'
import type { RateLimiter } from '@shared/ports/rate-limiter'
import type { Clock } from '@shared/ports/clock'
import type { IdGenerator } from '@shared/ports/id-generator'
import type { ResolvedSettings } from '@domains/organization/entities/settings'
import { UnauthorizedError } from '@shared/errors'
import { sessionTtlSeconds, pinReauthTtlSeconds } from './session-timeout'

export class AuthService {
  constructor(
    private repo: AuthRepository,
    private hasher: Hasher,
    private signer: TokenSigner,
    private clock: Clock,
    private ids: IdGenerator,
    private limiter: RateLimiter,
  ) {}

  async signUp(
    input: SignupInput,
    settings: ResolvedSettings,
  ): Promise<{ token: string; session: Session; user: User }> {
    const existingByEmail = await this.repo.findUserByEmail(input.email)
    if (existingByEmail) {
      throw new UnauthorizedError('Email already taken')
    }

    const existingByUsername = await this.repo.findUserByUsername(input.username)
    if (existingByUsername) {
      throw new UnauthorizedError('Username already taken')
    }

    const passwordHash = await this.hasher.hash(input.password)
    const userId = this.ids.next()
    const now = this.clock.now()

    const user: User = {
      id: userId,
      username: input.username,
      email: input.email,
      password: passwordHash,
      firstName: '',
      lastName: '',
      active: true,
      roles: [],
      createdAt: now,
      updatedAt: now,
    }

    await this.repo.saveUser(user)

    const sessionId = this.ids.next()
    const ttlSeconds = sessionTtlSeconds(settings)
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)

    const claims: Omit<SessionClaims, 'iat' | 'exp'> = {
      sub: userId,
      sessionId,
      roles: [],
    }

    const token = await this.signer.sign(claims, { ttlSeconds })

    const session: Session = {
      id: sessionId,
      userId,
      token,
      expiresAt,
      createdAt: now,
    }

    await this.repo.saveSession(session)

    return { token, session, user }
  }

  async logIn(
    input: LoginInput,
    settings: ResolvedSettings,
    meta?: { ip?: string },
  ): Promise<{ token: string; session: Session; user: User }> {
    const emailKey = `login:${input.email.toLowerCase()}`
    const ipKey = meta?.ip ? `login:ip:${meta.ip}` : null

    const emailRateLimit = await this.limiter.check(emailKey)
    if (!emailRateLimit.allowed) {
      throw new UnauthorizedError(
        `Too many login attempts. Please try again in ${Math.ceil(emailRateLimit.retryAfterMs / 1000)} seconds`,
      )
    }

    if (ipKey) {
      const ipRateLimit = await this.limiter.check(ipKey)
      if (!ipRateLimit.allowed) {
        throw new UnauthorizedError('Too many login attempts from this IP')
      }
    }

    const user = await this.repo.findUserByEmail(input.email)
    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const passwordValid = await this.hasher.verify(input.password, user.password)
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const sessionId = this.ids.next()
    const ttlSeconds = sessionTtlSeconds(settings)
    const now = this.clock.now()
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)

    const claims: Omit<SessionClaims, 'iat' | 'exp'> = {
      sub: user.id,
      sessionId,
      roles: user.roles,
    }

    const token = await this.signer.sign(claims, { ttlSeconds })

    const session: Session = {
      id: sessionId,
      userId: user.id,
      token,
      expiresAt,
      createdAt: now,
    }

    await this.repo.saveSession(session)
    await this.limiter.reset(emailKey)
    if (ipKey) {
      await this.limiter.reset(ipKey)
    }

    return { token, session, user }
  }

  async verifySession(token: string): Promise<SessionClaims | null> {
    const claims = await this.signer.verify(token)
    if (!claims) return null

    const now = this.clock.now()
    if (claims.exp * 1000 < now.getTime()) {
      return null
    }

    const session = await this.repo.findSessionById(claims.sessionId)
    if (!session || session.revokedAt) {
      return null
    }

    return claims
  }

  async logOut(sessionId: string): Promise<void> {
    const now = this.clock.now()
    await this.repo.revokeSession(sessionId, now)
  }

  async setPin(userId: string, pin: string): Promise<void> {
    const user = await this.repo.findUserById(userId)
    if (!user) throw new UnauthorizedError('User not found')

    user.pinHash = await this.hasher.hash(pin)
    user.updatedAt = this.clock.now()
    await this.repo.saveUser(user)
  }

  async reauthWithPin(
    userId: string,
    pin: string,
    settings: ResolvedSettings,
  ): Promise<{ token: string; session: Session }> {
    const pinKey = `pin:${userId}`
    const rateLimit = await this.limiter.check(pinKey)

    if (!rateLimit.allowed) {
      throw new UnauthorizedError(
        `Too many PIN attempts. Please try again in ${Math.ceil(rateLimit.retryAfterMs / 1000)} seconds`,
      )
    }

    const user = await this.repo.findUserById(userId)
    if (!user || !user.pinHash) {
      throw new UnauthorizedError('PIN not set')
    }

    const pinValid = await this.hasher.verify(pin, user.pinHash)
    if (!pinValid) {
      throw new UnauthorizedError('Invalid PIN')
    }

    const sessionId = this.ids.next()
    const ttlSeconds = pinReauthTtlSeconds(settings)
    const now = this.clock.now()
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)

    const claims: Omit<SessionClaims, 'iat' | 'exp'> = {
      sub: user.id,
      sessionId,
      roles: user.roles,
    }

    const token = await this.signer.sign(claims, { ttlSeconds })

    const session: Session = {
      id: sessionId,
      userId,
      token,
      expiresAt,
      createdAt: now,
    }

    await this.repo.saveSession(session)
    await this.limiter.reset(pinKey)

    return { token, session }
  }
}
