import Link from 'next/link'

const PRODUCT_LINKS = [
  { label: 'Checkout', href: '/pos/checkout' },
  { label: 'Inventory', href: '/app/inventory' },
  { label: 'Customers', href: '/app/customers' },
  { label: 'Reports', href: '/app/reports' },
]

const COMPANY_LINKS = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customer stories', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
]

const ACCOUNT_LINKS = [
  { label: 'Sign in', href: '/login' },
  { label: 'Create an account', href: '/signup' },
  { label: 'Set up your store', href: '/onboarding' },
]

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-sticky border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="h-8 w-8 rounded-[var(--radius-button)] bg-accent flex items-center justify-center text-accent-foreground font-display font-semibold">
              H
            </span>
            <span className="text-lg font-display font-semibold">Hearth POS</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-label">
            <a href="#features" className="text-foreground-muted hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-foreground-muted hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-foreground-muted hover:text-foreground transition-colors">
              Customer stories
            </a>
            <a href="#faq" className="text-foreground-muted hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-[var(--radius-button)] text-label font-medium text-foreground hover:bg-surface transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-10 px-4 rounded-[var(--radius-button)] text-label font-medium bg-accent text-accent-foreground hover:bg-accent-strong transition-colors"
            >
              Start free
            </Link>
          </div>
        </nav>
      </header>

      {children}

      <footer className="border-t border-border mt-auto bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-7 w-7 rounded-[var(--radius-button)] bg-accent flex items-center justify-center text-accent-foreground font-display font-semibold text-sm">
                H
              </span>
              <span className="font-display font-semibold">Hearth POS</span>
            </div>
            <p className="text-label text-foreground-muted max-w-xs">
              Local-first point of sale for independent shops, cafés, and multi-branch retailers.
              Rings up sales even when the internet doesn&apos;t show up for the shift.
            </p>
          </div>

          <div>
            <h3 className="text-label font-semibold text-foreground mb-3">Product</h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-label text-foreground-muted hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-label font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-label text-foreground-muted hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-label font-semibold text-foreground mb-3">Account</h3>
            <ul className="space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-label text-foreground-muted hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-caption text-foreground-muted">
            © 2026 Hearth POS. Built for counters that can&apos;t afford downtime.
          </div>
        </div>
      </footer>
    </div>
  )
}
