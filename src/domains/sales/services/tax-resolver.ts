import type { Category } from '@domains/catalog/entities/category'
import type { ResolvedSettings } from '@domains/organization/entities/settings'

// Pure helper to resolve tax rate for a category
export function resolveTaxRate(settings: ResolvedSettings, category: Category | null): number {
  if (!category) {
    return settings.taxRules[0]?.rate ?? 0
  }

  if (category.taxRuleId) {
    const rule = settings.taxRules.find((r) => r.id === category.taxRuleId)
    if (rule) {
      return rule.rate
    }
  }

  return settings.taxRules[0]?.rate ?? 0
}
