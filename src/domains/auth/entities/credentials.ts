import { z } from 'zod'

export const SignupInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignupInput = z.infer<typeof SignupInputSchema>

export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof LoginInputSchema>

export const PinReauthInputSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
})

export type PinReauthInput = z.infer<typeof PinReauthInputSchema>

export const SetPinInputSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
})

export type SetPinInput = z.infer<typeof SetPinInputSchema>
