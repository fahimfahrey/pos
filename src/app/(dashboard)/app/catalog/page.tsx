import { requireActiveBranch, requireSession } from '@domains/auth/actions/session'
import { resolveRoleContext } from '@domains/auth/services/role-context'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { RouteError } from '@shared/components/ui/route-error'
import { createTranslator, resolveLocale } from '@shared/i18n'
import { cookies } from 'next/headers'

export default async function CatalogPage() {
  const session = await requireSession()
  const branchId = await requireActiveBranch()
  const locale = resolveLocale((await cookies()).get('locale')?.value)
  const t = createTranslator(locale)

  try {
    const provider = await getServerStorageProvider()

    const { products, roleContext } = await provider.withTransaction(async (repos) => {

      // Check role
      const membership = await repos.organization.findMembership(session.orgId!, session.sub)
      const roleContext = resolveRoleContext(session, membership)

      // Cashier cannot access catalog
      if (roleContext.isCashier) {
        return { products: [], roleContext }
      }

      // Get products
      const products = await repos.catalog.listProductsByOrg(session.orgId!)

      return {
        products,
        roleContext,
      }
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2xl font-display font-semibold text-foreground mb-2">
            {t('catalog.title')}
          </h1>
          <p className="text-body text-foreground-muted">
            {t('catalog.subtitle')}
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold text-foreground">{t('catalog.columnProduct')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-foreground">{t('catalog.columnSku')}</th>
                  <th className="px-4 py-3 text-start font-semibold text-foreground">{t('catalog.columnStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-foreground-muted">
                      {t('catalog.empty')}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 text-foreground">{product.name}</td>
                      <td className="px-4 py-3 text-foreground-muted text-label">{product.id}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-label font-semibold bg-success text-[var(--on-success)]">
                          {t('catalog.statusActive')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Catalog error:', error)
    return (
      <RouteError
        title={t('catalog.errorTitle')}
        message={t('catalog.errorMessage')}
        kind="system"
      />
    )
  }
}
