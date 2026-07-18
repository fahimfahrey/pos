# Authentication Guide

This document describes the authentication system for the POS application, including both server-side and offline variants.

## Overview

The auth system implements two session transports over a **single shared token verification code path**:

1. **Server variant** (default) — JWT in an `HttpOnly` cookie
2. **Local/offline variant** — JWT in localStorage for pure-offline PWA/terminal builds

Both use `bcryptjs`-hashed credentials and `jose`-signed JWT (HS256).

## Server-Side Authentication (Default)

### Session Transport

- Tokens are issued as JWTs signed with HS256 using `AUTH_SECRET`
- Stored in an `HttpOnly` cookie (`pos_session`) — never accessible to JavaScript
- Cookie is `Secure` in production, `SameSite=Lax` always
- TTL configurable via `ResolvedSettings.security.sessionTimeoutMinutes` (default: 480 minutes = 8 hours)

### Verification Path

The shared `verifyToken` function (in `services/token.ts`) is used everywhere:

- **Proxy guard** (`src/proxy.ts`) — verifies on each request for protected routes
- **Server DAL** (`actions/session.ts`) — `getCurrentSession()`, `requireSession()` helpers
- **Server actions** — implicit via the DAL

### Checking Session in Server Components

```typescript
import { requireSession, getCurrentUser } from '@domains/auth/actions/session'

export default async function ProtectedPage() {
  const session = await requireSession()  // Redirects to /login if no valid session
  const user = await getCurrentUser()     // Loads user from session

  return <div>Logged in as {user?.email}</div>
}
```

### Logging In and Out

- `signUpAction` — creates new user with bcrypt-hashed password, issues JWT, sets cookie
- `logInAction` — verifies password, issues new JWT, sets cookie, honors `returnTo` param
- `logOutAction` — revokes session server-side, clears cookie, redirects to `/login`

### Rate Limiting

Auth attempts are rate-limited at the service layer:

- Max 5 login attempts per 15-minute window per email + IP
- Max 5 PIN attempts per user per 15-minute window
- Configurable via `ResolvedSettings.security.maxAuthAttempts` and `authWindowMinutes`
- Behind a `RateLimiter` port — `InMemoryRateLimiter` in place, `RedisRateLimiter` can swap in later

### Settings

Auth configuration lives in `ResolvedSettings.security`:

```typescript
{
  sessionTimeoutMinutes: 480,          // Session TTL
  pinReauthTimeoutMinutes: 15,         // PIN re-auth token TTL
  maxAuthAttempts: 5,                   // Rate limit attempts
  authWindowMinutes: 15,                // Rate limit window
}
```

Defaults are in `DEFAULT_SETTINGS`; override via organization or branch settings.

## Local/Offline Variant

For pure-offline PWA or terminal deployments:

```typescript
import { offlineLogin, offlineGetSession } from '@domains/auth/client/offline-auth'

// After user authenticates (e.g., via QR code, biometric)
await offlineLogin(token, expiresAt)

// On app load
const session = await offlineGetSession(env.AUTH_SECRET)
if (!session) {
  // Show login UI
}
```

**Key point:** The offline variant reuses the **same** `verifyToken` function. Token validation is identical: expiry, signature, and payload structure are verified by the shared path, not by transport-specific code.

### Storage

- Token persisted in `localStorage`
- Expiry checked on retrieval (auto-clear if expired)
- Both stored in IndexedDB `sessions` collection for offline access (if needed)

## Architecture Notes

### Proxy is an Optimistic Guard

`src/proxy.ts` (Next 16 `proxy`, not `middleware`) verifies the JWT signature and expiry on each request to `/app/*` and `/admin/*`. If invalid or missing, it redirects to `/login?returnTo=<path>`.

**It is not the sole authz layer.** Real protection:

- Server components call `requireSession()` for defense in depth
- Services check roles with `authorization-service` (e.g., `requireRole`)
- If proxy is misconfigured, server DAL still validates

### Services Don't Know About Cookies

Services depend only on ports (`Hasher`, `TokenSigner`, `RateLimiter`) and the `AuthRepository`. No cookie logic. Actions wire up the concrete adapters and handle the transport (cookie set/delete).

### Single Node Server Limitation

The server-side `getServerStorageProvider()` caches a single in-memory `StorageProvider` for the Node.js process. This works for single-instance servers but **not horizontally scaled clusters**. For multi-instance deployments, use a shared engine (e.g., connect multiple indexeddb adapters to a Redis-backed driver).

## Credential Storage

- User passwords stored as **bcrypt hashes** in the `password` field (kept for fixture compatibility)
- PIN hashes stored in optional `pinHash` field
- No plaintext passwords ever persisted

## Error Handling

- `UnauthorizedError` — invalid credentials, rate-limited, session expired
- `ForbiddenError` — insufficient role
- Errors bubble up to actions and are returned to the client for display

## Testing

### Unit Tests

- `auth-service.test.ts` — signup, login, PIN, expiry, rate limiting (fakes + real adapters)
- `token.test.ts` — sign → verify, tampering, expiry
- `in-memory-rate-limiter.test.ts` — blocking and reset

### Repository Round-Trip

`credentials-roundtrip.test.ts` — proves credentials survive storage on both `memory` and `indexeddb` engines without engine-specific code.

### E2E Tests

`auth.spec.ts` (Playwright) — signup → login → logout, expiry + returnTo, rate limiting, invalid cookie clearing, redirect-off-auth-pages.

## Debugging

Set `LOG_LEVEL=debug` to see auth token verification logs. Check the cookie:

```javascript
document.cookie  // Browser DevTools console
// Should NOT contain a visible token (HttpOnly) unless NEXT_PUBLIC_AUTH_MODE=local
```

Inspect JWT payloads at [jwt.io](https://jwt.io) (offline; does not transmit your secret).
