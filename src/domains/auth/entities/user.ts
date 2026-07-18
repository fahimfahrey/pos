export interface User {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  active: boolean
  roles: string[]
  createdAt: Date
  updatedAt: Date
  pinHash?: string
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  revokedAt?: Date
  createdAt: Date
}
