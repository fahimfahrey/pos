import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  AUTH_SECRET: z.string().min(32).default('dev-secret-this-must-be-changed-in-production-12345'),
})
const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('POS'),
  NEXT_PUBLIC_STORAGE_ENGINE: z.string().min(1).default('indexeddb'),
  NEXT_PUBLIC_AUTH_MODE: z.enum(['server', 'local']).default('server'),
})

const parsedServer = serverSchema.safeParse(process.env)
const parsedClient = clientSchema.safeParse(process.env)
if (!parsedServer.success || !parsedClient.success) {
  const issues = [
    ...(parsedServer.success ? [] : parsedServer.error.issues),
    ...(parsedClient.success ? [] : parsedClient.error.issues),
  ]
  throw new Error(
    `Invalid environment variables:\n${issues
      .map(i => ` - ${i.path.join('.')}: ${i.message}`)
      .join('\n')}`,
  )
}
export const env = { ...parsedServer.data, ...parsedClient.data } as const
