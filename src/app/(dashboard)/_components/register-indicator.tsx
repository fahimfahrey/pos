import type { Persona } from '@domains/auth/services/role-context'
import type { Shift } from '@domains/sales/entities/shift'
import { Badge } from '@shared/components/ui/badge'

interface RegisterIndicatorProps {
  persona: Persona
  openShift?: Shift | null
}

export function RegisterIndicator({ persona, openShift }: RegisterIndicatorProps) {
  // Only show for cashier and manager; hide for owner and auditor
  if (persona === 'owner' || persona === 'auditor') {
    return null
  }

  if (!openShift) {
    return (
      <div className="text-label text-foreground-muted">
        No open shift
      </div>
    )
  }

  return (
    <Badge variant="success" className="text-label">
      Register • Open
    </Badge>
  )
}
