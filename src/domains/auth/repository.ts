import type { User, Session } from '@domains/auth/entities/user'

export interface AuthRepository {
  saveUser(user: User): Promise<void>
  findUserById(id: string): Promise<User | null>
  findUserByUsername(username: string): Promise<User | null>
  listUsers(): Promise<User[]>
  saveSession(session: Session): Promise<void>
  findSessionById(id: string): Promise<Session | null>
  revokeSession(id: string, at: Date): Promise<void>
  listActiveSessionsForUser(userId: string, now: Date): Promise<Session[]>
}
