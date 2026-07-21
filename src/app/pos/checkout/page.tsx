import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireUser } from '@domains/auth/actions/session'
import { RegisterShell } from './_components/register-shell'

export default async function CheckoutPage() {
  // Gate the route to authenticated users
  const user = await requireUser('/pos/checkout')

  // Read the current branch ID from cookies
  const cookieStore = await cookies()
  const branchId = cookieStore.get('current-branch-id')?.value

  if (!branchId) {
    redirect('/app')
  }

  return (
    <RegisterShell
      orgId={user.orgId}
      cashierId={user.id}
      cashierName={user.name}
      branchId={branchId}
    />
  )
}
