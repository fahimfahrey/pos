import { requireSession, getActiveBranch } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getNavItems } from './_components/nav-items'
import { AppShell } from './_components/app-shell'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  const provider = await getServerStorageProvider()

  const { roleContext, branches, currentBranchId, openShift } = await provider.withTransaction(
    async (repos) => {

      // Get the membership to resolve role context
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Get all branches for this org
      const allBranches = await repos.organization.listBranchesForOrg(session.orgId!)

      // Get accessible branches based on persona
      let accessibleBranches = allBranches
      if (!roleContext.isOwner && !roleContext.isManager) {
        // For cashier/auditor, filter by BranchAssignment
        if (membership) {
          const assignments = await repos.organization.listAssignmentsForMembership(membership.id)
          const assignedBranchIds = assignments.map((a) => a.branchId)
          accessibleBranches = allBranches.filter((b) => assignedBranchIds.includes(b.id))
        } else {
          accessibleBranches = []
        }
      }

      // Get current active branch from cookie
      const currentBranchId = await getActiveBranch()

      // Validate current branch is in accessible list
      let validBranchId = currentBranchId
      if (!validBranchId || !accessibleBranches.some((b) => b.id === validBranchId)) {
        validBranchId = null
      }

      // Get open shift for the user if they have a current branch
      let openShift = null
      if (validBranchId && (roleContext.isCashier || roleContext.isManager)) {
        const shifts = await repos.sales.listShiftsByBranch(validBranchId)
        openShift = shifts.find((s) => s.status === 'open' && s.cashierUserId === session.sub) || null
      }

      return {
        roleContext,
        branches: accessibleBranches,
        currentBranchId: validBranchId,
        openShift,
      }
    }
  )

  const navItems = getNavItems(roleContext.persona)

  return (
    <AppShell
      persona={roleContext.persona}
      navItems={navItems}
      branches={branches}
      currentBranchId={currentBranchId}
      openShift={openShift}
    >
      {children}
    </AppShell>
  )
}
