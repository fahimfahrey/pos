'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireSession } from '@domains/auth/actions/session'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { ValidationError } from '@shared/errors'
import { MEMBERSHIP_ROLE } from '@constants/enums/membership-role'

/**
 * Server action to switch the active branch.
 * Validates that the requested branch is one the current user can access:
 * - Owner/Admin membership: any branch in the org
 * - Manager/Cashier: only branches in their BranchAssignment list
 *
 * Sets the 'current-branch-id' cookie and redirects to /app.
 */
export async function switchBranch(branchId: string): Promise<void> {
  const session = await requireSession()

  const provider = await getServerStorageProvider()

  // Validate the branch exists and the user can access it
  const permitted = await provider.withTransaction(async (tx) => {
    const repos = await provider.getRepositorySet(tx)

    // Check if branch exists
    const branch = await repos.organization.findBranchById(branchId)
    if (!branch) {
      throw new ValidationError(`Branch ${branchId} not found`)
    }

    // Check if user is in this org
    const membership = await repos.organization.findMembership(session.orgId!, session.sub)
    if (!membership) {
      throw new ValidationError(`User not a member of organization ${session.orgId}`)
    }

    // Owners and admins can access any branch in their org
    if (membership.role <= MEMBERSHIP_ROLE.ADMIN) {
      return true
    }

    // Others must have an explicit BranchAssignment
    const assignments = await repos.organization.listAssignmentsForMembership(membership.id)
    const hasAccess = assignments.some((a) => a.branchId === branchId)

    return hasAccess
  })

  if (!permitted) {
    throw new ValidationError(`User does not have access to branch ${branchId}`)
  }

  // Set the cookie
  const cookieStore = await cookies()
  cookieStore.set('current-branch-id', branchId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // No Max-Age: session cookie that expires when browser closes
  })

  redirect('/app')
}
