import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Hind_Siliguri } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { ServiceWorkerRegister } from './_components/service-worker-register'
import { TenantThemeStyle } from './_components/tenant-theme-style'
import { TenantThemeProvider } from './_components/tenant-theme-provider'
import { getCurrentSession } from '@domains/auth/actions/session'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { resolveTenantTheme, deriveBrandTokens } from '@domains/organization/services/theme-resolver'
import type { ResolvedTheme, DerivedBrandTokens } from '@domains/organization/services/theme-resolver'
import { resolveSettings } from '@domains/organization/services/settings-resolver'
import { DEFAULT_SETTINGS } from '@domains/organization/entities/settings'
import type { ResolvedSettings } from '@domains/organization/entities/settings'
import { LocaleProvider, createTranslator, resolveLocale, getLocaleDir } from '@shared/i18n'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-bengali',
})

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Local-first Point of Sale System',
}

export const viewport: Viewport = {
  themeColor: '#CC785C',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let theme: ResolvedTheme = { colorScheme: 'system' }
  let derivedTokens: DerivedBrandTokens | null = null
  let localeSettings: ResolvedSettings = DEFAULT_SETTINGS

  const cookieStore = await cookies()
  const session = await getCurrentSession()
  if (session?.orgId) {
    const provider = await getServerStorageProvider()
    await provider.withTransaction(async (repos) => {
      const org = await repos.organization.findOrganizationById(session.orgId!)
      if (!org) return
      const branchId = cookieStore.get('current-branch-id')?.value
      const branch = branchId ? await repos.organization.findBranchById(branchId) : null
      theme = resolveTenantTheme(org, branch)
      localeSettings = resolveSettings(org, branch)
    })
  }

  if (theme.brandColor) {
    derivedTokens = deriveBrandTokens(theme.brandColor)
  }

  const localeOverride = cookieStore.get('locale')?.value
  const activeLocale = resolveLocale(localeOverride ?? localeSettings.locale)
  const t = createTranslator(activeLocale)

  return (
    <html
      lang={activeLocale}
      dir={getLocaleDir(activeLocale)}
      data-theme={theme.colorScheme === 'system' ? undefined : theme.colorScheme}
      className={`${fraunces.variable} ${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TenantThemeStyle colorScheme={theme.colorScheme} brandColor={theme.brandColor} derivedTokens={derivedTokens} />
        <TenantThemeProvider value={{ logoUrl: theme.logoUrl }}>
          <LocaleProvider
            defaultLocale={activeLocale}
            timezone={localeSettings.timezone}
            currency={localeSettings.currency}
            useNativeDigits={localeSettings.localization.useNativeDigits}
          >
            <a href="#content" className="sr-only focus:not-sr-only">
              {t('common.skipToContent')}
            </a>
            <main id="content" className="flex-1">
              {children}
            </main>
            <ServiceWorkerRegister />
          </LocaleProvider>
        </TenantThemeProvider>
      </body>
    </html>
  )
}
