'use server'

import { getCurrentSession } from '@domains/auth/actions/session'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { SystemClock } from '@infra/adapters/system-clock'
import type { ThemeSettings } from '../entities/settings'
import { MEMBERSHIP_ROLE } from '@constants/enums'

const BRAND_COLOR_HEX_REGEX = /^#[0-9a-fA-F]{6}$/

export interface UpdateThemeInput {
  orgId: string
  theme?: Partial<ThemeSettings>
  logoUrl?: string
  branchId?: string
  branchTheme?: Partial<ThemeSettings>
  branchLogoUrl?: string
}

export interface UpdateThemeResult {
  success: boolean
  error?: string
}

export async function updateTheme(input: UpdateThemeInput): Promise<UpdateThemeResult> {
  const session = await getCurrentSession()

  if (!session?.sub || !session?.orgId) {
    return { success: false, error: 'Unauthorized' }
  }

  // Validate brand color if provided
  if (input.theme?.brandColor && !BRAND_COLOR_HEX_REGEX.test(input.theme.brandColor)) {
    return { success: false, error: 'Invalid brand color format. Use #RRGGBB' }
  }

  if (input.branchTheme?.brandColor && !BRAND_COLOR_HEX_REGEX.test(input.branchTheme.brandColor)) {
    return { success: false, error: 'Invalid branch brand color format. Use #RRGGBB' }
  }

  const provider = await getServerStorageProvider()
  const clock = new SystemClock()

  const result = await provider.withTransaction(async (repos) => {
    // Check membership role - OWNER/ADMIN only
    const membership = await repos.organization.findMembership(session.orgId!, session.sub)
    if (!membership || (membership.role !== MEMBERSHIP_ROLE.OWNER && membership.role !== MEMBERSHIP_ROLE.ADMIN)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    // Load and update organization
    const org = await repos.organization.findOrganizationById(session.orgId!)
    if (!org) {
      return { success: false, error: 'Organization not found' }
    }

    if (input.theme || input.logoUrl) {
      if (input.theme) {
        org.settings.theme = input.theme
      }
      if (input.logoUrl) {
        org.logoUrl = input.logoUrl
      }
      org.updatedAt = clock.now()
      await repos.organization.saveOrganization(org)
    }

    // Load and update branch if provided
    if (input.branchId && (input.branchTheme || input.branchLogoUrl)) {
      const branch = await repos.organization.findBranchById(input.branchId)
      if (!branch) {
        return { success: false, error: 'Branch not found' }
      }

      if (input.branchTheme) {
        branch.settings.theme = input.branchTheme
      }
      if (input.branchLogoUrl) {
        branch.logoUrl = input.branchLogoUrl
      }
      branch.updatedAt = clock.now()
      await repos.organization.saveBranch(branch)
    }

    return { success: true }
  })

  return result
}
