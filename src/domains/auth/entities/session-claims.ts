export interface SessionClaims {
  sub: string // user ID
  sessionId: string
  orgId?: string
  roles: string[]
  iat: number // issued at
  exp: number // expiration
}

export interface SessionInput {
  userId: string
  sessionId: string
  orgId?: string
  roles: string[]
}
