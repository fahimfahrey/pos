import type { ResolvedSettings } from '@domains/organization/entities/settings'
import {
  DEFAULT_SESSION_TIMEOUT_MINUTES,
  DEFAULT_PIN_REAUTH_TIMEOUT_MINUTES,
} from '@constants/auth'

export function sessionTtlSeconds(settings: ResolvedSettings): number {
  const minutes =
    (settings.security?.sessionTimeoutMinutes ?? DEFAULT_SESSION_TIMEOUT_MINUTES)
  return minutes * 60
}

export function pinReauthTtlSeconds(settings: ResolvedSettings): number {
  const minutes =
    settings.security?.pinReauthTimeoutMinutes ?? DEFAULT_PIN_REAUTH_TIMEOUT_MINUTES
  return minutes * 60
}
