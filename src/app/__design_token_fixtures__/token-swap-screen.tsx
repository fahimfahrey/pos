'use client';

/**
 * Token swap screen fixture: renders every semantic role via Tailwind utilities.
 * Used by token-swap-screen.test.tsx to verify theme colors swap correctly at runtime.
 */
export function TokenSwapScreen() {
  return (
    <div className="w-screen min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-display-lg font-display text-foreground">Token Swap Fixture</h1>

        {/* Background / Foreground */}
        <div className="bg-background text-foreground p-4 rounded-radius-card border border-border">
          <p className="font-body">
            Background + Foreground: This text is primary foreground on background.
          </p>
        </div>

        {/* Background / Foreground-Muted */}
        <div className="bg-background text-muted p-4 rounded-radius-card">
          <p className="font-body text-label">
            Background + Muted: Secondary text in muted color.
          </p>
        </div>

        {/* Surface / Foreground */}
        <div className="bg-surface text-foreground p-4 rounded-radius-card shadow-card">
          <h2 className="text-display-lg font-display mb-2">Surface Card</h2>
          <p className="font-body">This is a surface element with primary text.</p>
        </div>

        {/* Primary Action (Accent) */}
        <div className="flex gap-3">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-radius-button font-body font-semibold transition-colors duration-fast hover:bg-primary-strong focus:outline-2 focus:outline-offset-2 focus:outline-primary">
            Primary Action
          </button>

          {/* Accent Strong */}
          <button className="bg-accent-strong text-accent-foreground px-4 py-2 rounded-radius-button font-body font-semibold transition-colors duration-fast hover:bg-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent">
            Accent Strong
          </button>
        </div>

        {/* Success, Danger, Warning Indicators */}
        <div className="flex gap-3 flex-wrap">
          <div className="inline-flex items-center bg-success bg-opacity-20 text-success px-3 py-2 rounded-radius-button font-label">
            ✓ Success State
          </div>
          <div className="inline-flex items-center bg-danger bg-opacity-20 text-danger px-3 py-2 rounded-radius-button font-label">
            ✕ Danger State
          </div>
          <div className="inline-flex items-center bg-warning bg-opacity-20 text-warning px-3 py-2 rounded-radius-button font-label">
            ⚠ Warning State
          </div>
        </div>

        {/* Focus Ring Test */}
        <div>
          <label className="block text-label font-body font-semibold mb-2">Focusable Element (observe ring on focus):</label>
          <button className="bg-surface text-foreground border border-border px-4 py-2 rounded-radius-button font-body transition-colors duration-fast hover:bg-background focus:outline-2 focus:outline-offset-2 focus:outline-accent">
            Focus Ring Test
          </button>
        </div>

        {/* Overlay Scrim Demo */}
        <div className="relative w-full h-32 bg-surface rounded-radius-card overflow-hidden">
          <div className="absolute inset-0 bg-overlay flex items-center justify-center">
            <p className="text-surface font-body font-semibold">Overlay Scrim</p>
          </div>
        </div>

        {/* Elevation Examples */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface text-foreground p-4 rounded-radius-card shadow-card">
            <p className="text-label font-body font-semibold">shadow-card (subtle)</p>
          </div>
          <div className="bg-surface text-foreground p-4 rounded-radius-card shadow-elevated">
            <p className="text-label font-body font-semibold">shadow-elevated (standard)</p>
          </div>
        </div>

        {/* Typographic Scale */}
        <div className="space-y-2">
          <h2 className="text-display-2xl font-display text-foreground">Display 2XL</h2>
          <h2 className="text-display-xl font-display text-foreground">Display XL</h2>
          <h2 className="text-display-lg font-display text-foreground">Display LG</h2>
          <p className="text-body font-body text-foreground">Body text for reading.</p>
          <label className="text-label font-body text-foreground">Label text smaller.</label>
          <p className="text-caption font-body text-foreground">Caption text smallest.</p>
        </div>

        {/* Motion Example */}
        <div className="bg-surface rounded-radius-card p-4">
          <p className="text-label font-body font-semibold text-foreground mb-2">Motion durations:</p>
          <div className="flex gap-2">
            <div className="inline-block bg-accent text-white px-3 py-1 rounded transition-all duration-fast hover:bg-accent-strong">
              duration-fast (150ms)
            </div>
            <div className="inline-block bg-accent text-white px-3 py-1 rounded transition-all duration-base hover:bg-accent-strong">
              duration-base (300ms)
            </div>
          </div>
        </div>

        {/* Z-Index Note */}
        <div className="bg-surface text-foreground p-4 rounded-radius-card text-caption font-body">
          Z-index utilities (z-modal, z-toast, etc.) are applied via classes and define stacking context.
        </div>
      </div>
    </div>
  );
}
