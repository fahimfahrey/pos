import { DEFAULT_SETTINGS } from '../entities/settings'
import type { ResolvedSettings, OrganizationSettings, BranchSettings } from '../entities/settings'

export function resolveSettings(
  org: { settings: OrganizationSettings },
  branch?: { settings: BranchSettings } | null,
): ResolvedSettings {
  return { ...DEFAULT_SETTINGS, ...org.settings, ...(branch?.settings ?? {}) }
}

export function resolveSettingsFrom(
  orgSettings: OrganizationSettings,
  branchSettings?: BranchSettings | null,
): ResolvedSettings {
  return { ...DEFAULT_SETTINGS, ...orgSettings, ...(branchSettings ?? {}) }
}
