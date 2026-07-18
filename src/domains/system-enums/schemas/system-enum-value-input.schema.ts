import { z } from 'zod'
import { ENUM_REGISTRY_KEY } from '@constants/enums'

const registryKeys = Object.values(ENUM_REGISTRY_KEY) as [string, ...string[]]

export const systemEnumValueInputSchema = z.object({
  orgId: z.string().min(1),
  registryKey: z.enum(registryKeys),
  value: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_]+$/, 'value must be lowercase snake_case'),
  label: z.string().trim().min(1).max(60),
})

export type SystemEnumValueInput = z.infer<typeof systemEnumValueInputSchema>
