'use client'

import React, { useTransition } from 'react'
import { Combobox } from '@shared/components/ui/combobox'
import type { Branch } from '@domains/organization/entities/branch'
import { switchBranch } from '@domains/organization/actions/switch-branch'

interface BranchSwitcherProps {
  branches: Branch[]
  currentBranchId: string | null
}

export function BranchSwitcher({ branches, currentBranchId }: BranchSwitcherProps) {
  const [isPending, startTransition] = useTransition()

  const currentBranch = branches.find((b) => b.id === currentBranchId)

  // If only one branch, show a static label (no switcher)
  if (branches.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-input)] bg-surface border border-border text-foreground text-body">
        <span className="text-foreground-muted text-label">Branch:</span>
        <span className="font-medium">{currentBranch?.name || 'Unknown'}</span>
      </div>
    )
  }

  const options = branches.map((b) => ({
    value: b.id,
    label: b.name || b.id,
  }))

  const handleBranchChange = (branchId: string) => {
    startTransition(async () => {
      await switchBranch(branchId)
    })
  }

  return (
    <div className="w-full max-w-xs">
      <Combobox
        options={options}
        value={currentBranchId ?? ''}
        onValueChange={handleBranchChange}
        placeholder="Search branches..."
        disabled={isPending}
        aria-label="Select branch"
      />
    </div>
  )
}
