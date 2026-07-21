'use client'

import { Dialog } from '@shared/components/ui/dialog'
import { SHORTCUTS } from '../_lib/use-keyboard-shortcuts'

interface KeyboardShortcutsHelpProps {
  onClose: () => void
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        data-scan-exempt
      >
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-foreground hover:text-foreground/80"
              data-scan-exempt
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(SHORTCUTS).map(([_, shortcut]) => (
              <div
                key={shortcut.key}
                className="border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-background border border-border rounded px-2 py-1 text-sm font-mono font-bold text-foreground whitespace-nowrap">
                    {shortcut.key}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {shortcut.label}
                    </div>
                    <div className="text-sm text-foreground">
                      {shortcut.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-[var(--radius-button)] hover:bg-accent-strong font-semibold"
              data-scan-exempt
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
