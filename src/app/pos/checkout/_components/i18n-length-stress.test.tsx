import { render, screen } from '@testing-library/react'
import { LocaleProvider, getAllCatalogs, pseudoLocalizeCatalog } from '@shared/i18n'
import { VoidSaleModal } from './void-sale-modal'
import { OpenShiftPanel } from './open-shift-panel'
import { ManagerOverrideModal } from './manager-override-modal'
import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help'
import type { Register } from '@domains/organization/entities/register'

// Pseudo-localization + length-stress gate for the checkout components with the most
// overflow-prone layouts (fixed-width reason buttons, interpolated names). jsdom doesn't
// lay out real fonts, so this asserts on translation correctness and text-expansion — the
// pixel-level "no clipping" check runs against real Chromium in
// e2e/i18n-length-stress.spec.ts. Both gates matter: this one catches missing/broken
// translation keys immediately, before a browser run is even needed.

const en = getAllCatalogs()['en-US']
const pseudoCatalog = pseudoLocalizeCatalog(en)

function renderPseudoLocalized(children: React.ReactNode) {
  return render(
    <LocaleProvider defaultLocale="en-US" timezone="UTC" currency="USD" messagesOverride={pseudoCatalog}>
      {children}
    </LocaleProvider>
  )
}

// A translation key that never resolved renders as its own dotted path (see
// createTranslator's fallback) — this regex catches that leaking into the DOM.
const UNRESOLVED_KEY_PATTERN = /\b[a-zA-Z]+(\.[a-zA-Z]+){2,}\b/

function assertNoUnresolvedKeys(container: HTMLElement) {
  const text = container.textContent ?? ''
  expect(text).not.toMatch(UNRESOLVED_KEY_PATTERN)
}

const mockRegister: Register = {
  id: 'register-1',
  orgId: 'org-1',
  branchId: 'branch-1',
  number: '1',
  name: 'Front Counter',
  active: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

describe('pseudo-localized checkout modals', () => {
  it('VoidSaleModal: every reason and label resolves, and expands under pseudo-localization', () => {
    const { container: pseudoContainer } = renderPseudoLocalized(
      <VoidSaleModal onClose={() => {}} onConfirm={() => {}} />
    )
    assertNoUnresolvedKeys(pseudoContainer)
    expect(screen.getByText(/Void Sale/i, { selector: '[data-slot="dialog-title"], h2, [role="heading"]' }).textContent).toMatch(/~/)

    const { container: enContainer } = render(<VoidSaleModal onClose={() => {}} onConfirm={() => {}} />)
    expect(pseudoContainer.textContent!.length).toBeGreaterThan(enContainer.textContent!.length)
  })

  it('OpenShiftPanel: interpolated cashier name survives pseudo-localization intact', () => {
    const { container } = renderPseudoLocalized(
      <OpenShiftPanel register={mockRegister} cashierName="Alex Rivera" onShiftOpened={async () => {}} />
    )
    assertNoUnresolvedKeys(container)
    expect(container.textContent).toContain('Alex Rivera')
  })

  it('ManagerOverrideModal: all copy resolves under pseudo-localization', () => {
    const { container } = renderPseudoLocalized(<ManagerOverrideModal reason="test" onClose={() => {}} onApprove={() => {}} />)
    assertNoUnresolvedKeys(container)
  })

  it('KeyboardShortcutsHelp: every shortcut label/description resolves', () => {
    const { container } = renderPseudoLocalized(<KeyboardShortcutsHelp onClose={() => {}} />)
    assertNoUnresolvedKeys(container)
    // 9 shortcuts, each contributing a label + description
    expect(container.querySelectorAll('.font-mono').length).toBe(9)
  })
})

describe('bn-BD rendering', () => {
  function renderBengali(children: React.ReactNode) {
    return render(
      <LocaleProvider defaultLocale="bn-BD" timezone="Asia/Dhaka" currency="BDT">
        {children}
      </LocaleProvider>
    )
  }

  it('VoidSaleModal renders real Bengali copy with no missing keys', () => {
    const { container } = renderBengali(<VoidSaleModal onClose={() => {}} onConfirm={() => {}} />)
    assertNoUnresolvedKeys(container)
    expect(container.textContent).toContain('বিক্রয় বাতিল করুন')
  })
})
