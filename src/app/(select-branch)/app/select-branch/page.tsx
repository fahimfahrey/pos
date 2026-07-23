import { redirect } from 'next/navigation'
import { requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { Card, CardContent } from '@shared/components/ui/card'
import { EmptyState } from '@shared/components/ui/empty-state'
import { Button } from '@shared/components/ui/button'
import Link from 'next/link'
import { switchBranch } from '@domains/organization/actions/switch-branch'

export default async function SelectBranchPage() {
  const session = await requireSession()

  const provider = await getServerStorageProvider()

  const { branches, roleContext } = await provider.withTransaction(async (repos) => {

    // Get membership and resolve role context
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

    return {
      branches: accessibleBranches,
      roleContext,
    }
  })

  // If exactly one branch, auto-select it
  if (branches.length === 1) {
    await switchBranch(branches[0]!.id)
    redirect('/app')
  }

  // If no branches, show empty state
  if (branches.length === 0) {
    const hasOrganization = Boolean(session.orgId)

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <EmptyState
              title={hasOrganization ? 'No branch access' : 'No organization yet'}
              description={
                hasOrganization
                  ? 'Contact your organization owner to grant you access to a branch.'
                  : "You haven't set up a store yet. Create your organization, branch, and register to get started."
              }
              headingLevel="h1"
              action={
                !hasOrganization && (
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] text-label font-medium transition-colors h-10 px-4 bg-accent text-accent-foreground hover:bg-accent-strong"
                  >
                    Set up your store
                  </Link>
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Multiple branches: show selection UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-display-lg font-display font-semibold text-foreground mb-2">
            Select a Branch
          </h1>
          <p className="text-body text-foreground-muted mb-6">
            You have access to multiple branches. Choose which one to work in:
          </p>

          <div className="space-y-3">
            {branches.map((branch) => (
              <form key={branch.id} action={async () => {
                'use server'
                await switchBranch(branch.id)
              }}>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full justify-start text-left text-body py-3"
                >
                  <span>{branch.name || branch.id}</span>
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
