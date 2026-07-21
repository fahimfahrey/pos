'use client'

export function ErrorState({
  message,
  retry,
}: {
  message: string
  retry: () => void
}) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-4">
        <div className="text-6xl mb-4">⚠</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
        <p className="text-foreground mb-6">{message}</p>
        <button
          onClick={retry}
          className="px-6 py-3 bg-accent text-accent-foreground rounded-[var(--radius-button)] hover:bg-accent-strong font-semibold"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
