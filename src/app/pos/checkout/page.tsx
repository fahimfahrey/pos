import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireSession, requireUser } from '@domains/auth/actions/session'
import { RegisterShell } from './_components/register-shell'

export default async function CheckoutPage() {
  // Gate the route to authenticated users
  const session = await requireSession('/pos/checkout')
  const user = await requireUser('/pos/checkout')

  // Read the current branch ID from cookies
  const cookieStore = await cookies()
  const branchId = cookieStore.get('current-branch-id')?.value

  if (!branchId || !session.orgId) {
    redirect('/app')
  }

  return (
    <RegisterShell
      orgId={session.orgId}
      cashierId={user.id}
      cashierName={`${user.firstName} ${user.lastName}`}
      branchId={branchId}
    />
  )
}
