'use client'

interface ChangeDisplayProps {
  changeDue: number
  shortBy?: number
}

export function ChangeDisplay({ changeDue, shortBy }: ChangeDisplayProps) {
  const formatMoney = (cents: number) => {
    const dollars = Math.abs(cents) / 100
    return `$${dollars.toFixed(2)}`
  }

  if (shortBy && shortBy > 0) {
    return (
      <div className="bg-danger text-surface p-4 rounded-[var(--radius-card)] text-center">
        <div className="text-sm font-semibold mb-2">Short by</div>
        <div className="font-display text-display-2xl tabular-nums font-bold">
          {formatMoney(shortBy)}
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-foreground text-surface p-4 rounded-[var(--radius-card)] text-center"
      aria-live="polite"
      aria-label={`Change due: ${formatMoney(changeDue)}`}
    >
      <div className="text-sm font-semibold mb-2">Change Due</div>
      <div className="font-display text-display-2xl tabular-nums font-bold">
        {formatMoney(changeDue)}
      </div>
    </div>
  )
}
