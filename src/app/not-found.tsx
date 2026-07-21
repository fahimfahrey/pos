'use client'

import Link from 'next/link'
import { EmptyState } from '@shared/components/ui/empty-state'
import { Button } from '@shared/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <EmptyState
        icon="🔍"
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        action={
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        }
      />
    </div>
  )
}
