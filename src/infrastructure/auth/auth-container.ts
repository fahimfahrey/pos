import { BcryptHasher } from '@infra/adapters/bcrypt-hasher'
import { JoseTokenSigner } from '@infra/adapters/jose-token-signer'
import { InMemoryRateLimiter } from '@infra/adapters/in-memory-rate-limiter'
import { CookieSessionStore } from './cookie-session-store'
import { LocalSessionStore } from './local-session-store'
import { env } from '@shared/env'

// Singletons for auth infrastructure
const hasher = new BcryptHasher()
const tokenSigner = new JoseTokenSigner(env.AUTH_SECRET)
const authRateLimiter = new InMemoryRateLimiter({
  maxAttempts: 5,
  windowMinutes: 15,
  lockoutMinutes: 15,
})
const cookieSessionStore = new CookieSessionStore()
const localSessionStore = new LocalSessionStore()

export { hasher, tokenSigner, authRateLimiter, cookieSessionStore, localSessionStore }
