import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hearth POS — Point of sale for counters that can’t afford downtime',
  description:
    'Local-first point of sale for independent shops, cafés, and multi-branch retailers. Ring up sales, manage inventory, and close shifts even when the internet drops.',
}

const TRUST_STATS = [
  { value: '12,400+', label: 'independent stores running Hearth' },
  { value: '$2.8M', label: 'processed at the counter, daily' },
  { value: '99.98%', label: 'checkout uptime, even offline' },
  { value: '11 min', label: 'median time from signup to first sale' },
]

const TRUSTED_BY = [
  'Marigold Coffee Roasters',
  'Pine & Pearl Hardware',
  'Thistle Bookshop Co.',
  'Copper Kettle Cafés',
  'Union Street Market',
  'Harlow General Store',
]

interface Feature {
  title: string
  description: string
  href: string
  cta: string
  icon: React.ReactNode
}

const FEATURES: Feature[] = [
  {
    title: 'Fast checkout, any way they pay',
    description:
      'Cash, card, or store credit in one tap. Split tenders, apply manager-approved discounts, and print or email the receipt before the next customer reaches the counter.',
    href: '/pos/checkout',
    cta: 'Open the register',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Inventory that stays honest',
    description:
      'Every sale, return, and stock count writes to a single ledger. Low-stock alerts and reorder thresholds mean you find out before a shelf goes empty, not after.',
    href: '/app/inventory',
    cta: 'View inventory',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 8l8 4 8-4M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'A catalog built for barcode speed',
    description:
      'Variants, SKUs, and barcodes organized by category with effective-dated price lists, so a Tuesday promotion never has to touch Wednesday’s price.',
    href: '/app/catalog',
    cta: 'Browse the catalog',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Customers who keep coming back',
    description:
      'Store credit, loyalty points, and purchase history live on every customer profile, so a returning regular never has to explain who they are.',
    href: '/app/customers',
    cta: 'See customer profiles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Purchasing that closes the loop',
    description:
      'Raise a purchase order, receive goods against it, and watch stock levels update automatically. No spreadsheet reconciling what actually showed up.',
    href: '/app/purchasing',
    cta: 'Open purchasing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M3 7h4l2 11h10l2-8H7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="10" cy="21" r="1.2" fill="currentColor" />
        <circle cx="17" cy="21" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Reports that close the shift for you',
    description:
      'Z-reports reconcile expected cash against counted cash automatically, with a full variance trail your accountant will actually thank you for.',
    href: '/app/reports',
    cta: 'View reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M4 20V10M11 20V4M18 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'A screen your customer can trust',
    description:
      'A dedicated customer-facing display mirrors the cart line by line, so every price and discount is visible before a card ever gets tapped.',
    href: '/pos/display',
    cta: 'Preview the display',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Built for more than one counter',
    description:
      'Branches, registers, and shift-level roles keep a five-location chain and a single corner shop equally organized, under one organization.',
    href: '/app/select-branch',
    cta: 'Manage branches',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="10" width="6" height="10" stroke="currentColor" strokeWidth="1.6" />
        <rect x="15" y="6" width="6" height="14" stroke="currentColor" strokeWidth="1.6" />
        <rect x="9" y="13" width="6" height="7" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Pick a username and password. No credit card, no sales call — you’re in within a minute.',
    href: '/signup',
    cta: 'Create an account',
  },
  {
    number: '02',
    title: 'Set up your store',
    description: 'Name your organization, add your first branch and register, and set your tax and currency defaults.',
    href: '/onboarding',
    cta: 'Start setup',
  },
  {
    number: '03',
    title: 'Ring up your first sale',
    description: 'Scan or search a product, take payment, and print the receipt. Your counter is live.',
    href: '/pos/checkout',
    cta: 'Open the register',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'We lost internet for four hours during our busiest Saturday of the year. Hearth kept ringing up sales the whole time and synced the second we were back online. Nobody in line even noticed.',
    name: 'Priya Anand',
    role: 'Owner, Marigold Coffee Roasters',
  },
  {
    quote:
      'Switching from three different spreadsheets to one system for inventory and purchasing paid for itself in the first month. We stopped over-ordering the things nobody was buying.',
    name: 'Devon Marsh',
    role: 'Operations Lead, Pine & Pearl Hardware',
  },
  {
    quote:
      'The Z-report alone is worth it. Closing a shift used to take twenty minutes of manual counting and arguing. Now it takes ninety seconds and the variance is right there in black and white.',
    name: 'Renata Souza',
    role: 'General Manager, Union Street Market',
  },
]

const PRICING_TIERS = [
  {
    name: 'Counter',
    price: '$0',
    period: 'forever, one register',
    description: 'For a single shop finding its footing.',
    features: ['1 branch, 1 register', 'Unlimited products & customers', 'Offline-first checkout', 'Email receipts'],
    href: '/signup',
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$39',
    period: 'per register / month',
    description: 'For shops ready to add registers and staff.',
    features: ['Unlimited registers, 1 branch', 'Loyalty & store credit', 'Purchasing & receiving', 'Z-reports & variance tracking'],
    href: '/signup',
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Multi-Branch',
    price: 'Custom',
    period: 'volume pricing',
    description: 'For chains running more than one location.',
    features: ['Unlimited branches & registers', 'Role-based branch access', 'Consolidated reporting', 'Priority support'],
    href: '/signup',
    cta: 'Talk to sales',
    highlighted: false,
  },
]

const FAQS = [
  {
    question: 'Does Hearth work without an internet connection?',
    answer:
      'Yes. Checkout, inventory lookups, and cart building all run against a local-first data layer on the register itself. Once you’re back online, everything reconciles automatically — nothing gets lost mid-sale.',
  },
  {
    question: 'Can I try it without talking to sales?',
    answer:
      'Yes — create an account, and you’ll walk through a short setup wizard straight into a working register. No demo call, no credit card.',
  },
  {
    question: 'What payment methods can I accept?',
    answer:
      'Cash, card, and store credit out of the box, with split-tender support so a single sale can be paid across more than one method.',
  },
  {
    question: 'How does multi-branch billing work?',
    answer:
      'Growth plans are priced per active register. Multi-Branch plans are volume-priced across all branches under one organization — reach out and we’ll size it to your footprint.',
  },
  {
    question: 'Who reconciles the cash drawer at the end of a shift?',
    answer:
      'Hearth does the math for you. Closing a shift generates a Z-report that compares expected cash (float plus cash sales) against what was actually counted, with the variance called out explicitly.',
  },
]

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent/10 text-accent px-3 py-1 text-caption font-semibold tracking-wide uppercase">
      {children}
    </span>
  )
}

export default function MarketingPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-5xl mx-auto text-center">
          <SectionEyebrow>Trusted by 12,400+ independent retailers</SectionEyebrow>
          <h1 className="mt-6 text-display-xl sm:text-display-2xl font-display font-semibold text-foreground text-balance">
            Point of sale that keeps up with your counter, not the other way around.
          </h1>
          <p className="mt-6 text-body sm:text-lg text-foreground-muted max-w-2xl mx-auto text-balance">
            Hearth is a local-first POS for independent shops, cafés, and multi-branch retailers.
            Checkout, inventory, customers, and shift reporting in one system — and it keeps ringing up sales
            even when the internet doesn&apos;t show up for the shift.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-button)] text-base font-semibold bg-accent text-accent-foreground hover:bg-accent-strong transition-colors w-full sm:w-auto"
            >
              Start selling free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-button)] text-base font-semibold border border-border bg-surface text-foreground hover:bg-background transition-colors w-full sm:w-auto"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-caption text-foreground-muted">
            No credit card required &middot; Works offline &middot; Set up in about 10 minutes
          </p>
        </div>

        {/* Trust stats */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-display-lg font-display font-semibold text-foreground tabular-nums">{stat.value}</p>
              <p className="mt-1 text-label text-foreground-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted-by strip */}
      <section className="border-y border-border bg-surface py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-caption text-foreground-muted uppercase tracking-wide mb-6">
            Running the counter for shops like
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUSTED_BY.map((name) => (
              <span key={name} className="text-label font-display font-semibold text-foreground-muted">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <SectionEyebrow>Everything at the counter</SectionEyebrow>
            <h2 className="mt-4 text-display-lg font-display font-semibold text-foreground text-balance">
              One system, from the first scan to the closed shift
            </h2>
            <p className="mt-4 text-body text-foreground-muted text-balance">
              Every module below is live in your account the moment you sign up &mdash; explore any of them right now.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature) => (
              <div
                key={feature.href}
                className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
              >
                <div className="h-11 w-11 rounded-[var(--radius-button)] bg-accent/10 text-accent flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-body font-display font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-label text-foreground-muted flex-1">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center gap-1 text-label font-semibold text-accent hover:text-accent-strong transition-colors"
                >
                  {feature.cta}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <SectionEyebrow>From signup to first sale</SectionEyebrow>
            <h2 className="mt-4 text-display-lg font-display font-semibold text-foreground text-balance">
              Three steps between here and a working register
            </h2>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-start">
                <span className="text-display-lg font-display font-semibold text-accent/40">{step.number}</span>
                <h3 className="mt-2 text-body font-display font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-label text-foreground-muted flex-1">{step.description}</p>
                <Link
                  href={step.href}
                  className="mt-5 inline-flex items-center gap-1 text-label font-semibold text-accent hover:text-accent-strong transition-colors"
                >
                  {step.cta}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <SectionEyebrow>Customer stories</SectionEyebrow>
            <h2 className="mt-4 text-display-lg font-display font-semibold text-foreground text-balance">
              Shops that switched and never looked back
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"
              >
                <blockquote className="text-label text-foreground flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 pt-5 border-t border-border">
                  <p className="text-label font-semibold text-foreground">{t.name}</p>
                  <p className="text-caption text-foreground-muted">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-6 py-20 sm:py-28 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <h2 className="mt-4 text-display-lg font-display font-semibold text-foreground text-balance">
              Start on one register. Grow to a hundred.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6 items-start">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={
                  tier.highlighted
                    ? 'flex flex-col rounded-[var(--radius-card)] border-2 border-accent bg-background p-8 shadow-[var(--shadow-md)] relative'
                    : 'flex flex-col rounded-[var(--radius-card)] border border-border bg-background p-8 shadow-[var(--shadow-sm)]'
                }
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent text-accent-foreground text-caption font-semibold px-3 py-1">
                    Most popular
                  </span>
                )}
                <h3 className="text-body font-display font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-4 text-display-lg font-display font-semibold text-foreground">{tier.price}</p>
                <p className="text-caption text-foreground-muted">{tier.period}</p>
                <p className="mt-3 text-label text-foreground-muted">{tier.description}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-label text-foreground">
                      <span className="text-success mt-0.5" aria-hidden="true">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={
                    tier.highlighted
                      ? 'mt-8 inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-button)] text-label font-semibold bg-accent text-accent-foreground hover:bg-accent-strong transition-colors'
                      : 'mt-8 inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-button)] text-label font-semibold border border-border bg-surface text-foreground hover:bg-background transition-colors'
                  }
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="mt-4 text-display-lg font-display font-semibold text-foreground text-balance">
              Questions from the counter
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-[var(--radius-card)] border border-border bg-surface px-6 py-4"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-body font-semibold text-foreground">
                  {faq.question}
                  <span className="text-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-label text-foreground-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto rounded-[var(--radius-card)] bg-accent px-6 sm:px-16 py-16 text-center shadow-[var(--shadow-md)]">
          <h2 className="text-display-lg font-display font-semibold text-accent-foreground text-balance">
            Ready to run your counter better?
          </h2>
          <p className="mt-4 text-body text-accent-foreground/80 max-w-xl mx-auto text-balance">
            Create your account, set up your store, and ring up your first sale &mdash; all in about ten minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-button)] text-base font-semibold bg-background text-foreground hover:bg-surface transition-colors w-full sm:w-auto"
            >
              Start selling free
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[var(--radius-button)] text-base font-semibold border border-accent-foreground/30 text-accent-foreground hover:bg-accent-strong transition-colors w-full sm:w-auto"
            >
              Set up your store
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
