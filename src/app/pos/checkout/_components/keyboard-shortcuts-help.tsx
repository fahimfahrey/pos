'use client'

import { Dialog, DialogContent, DialogTitle } from '@shared/components/ui/dialog'
import { useTranslations } from '@shared/i18n'
import { SHORTCUTS } from '../_lib/use-keyboard-shortcuts'

interface KeyboardShortcutsHelpProps {
  onClose: () => void
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const t = useTranslations()

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6" data-scan-exempt>
        <div className="flex items-center justify-between mb-6">
          <DialogTitle className="text-2xl font-bold text-foreground">{t('checkout.keyboardShortcuts.title')}</DialogTitle>
          <button
            onClick={onClose}
            aria-label={t('checkout.keyboardShortcuts.closeAria')}
            className="text-2xl font-bold text-foreground hover:text-foreground/80 leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(SHORTCUTS).map(([name, shortcut]) => (
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
                    {t(`checkout.shortcuts.${name}.label`)}
                  </div>
                  <div className="text-sm text-foreground">
                    {t(`checkout.shortcuts.${name}.description`)}
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
          >
            {t('checkout.keyboardShortcuts.close')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
