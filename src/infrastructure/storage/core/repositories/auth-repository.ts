// eslint-disable-next-line boundaries/no-unknown
import type { AuthRepository } from '@domains/auth/repository'
 
import type { User, Session } from '@domains/auth/entities/user'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreAuthRepository implements AuthRepository {
  private userCollection: Collection<User>
  private sessionCollection: Collection<Session>

  constructor(tx: DriverTransaction) {
    this.userCollection = new Collection<User>(tx, 'users')
    this.sessionCollection = new Collection<Session>(tx, 'sessions')
  }

  async saveUser(user: User): Promise<void> {
    await this.userCollection.put(user)
  }

  async findUserById(id: string): Promise<User | null> {
    return (await this.userCollection.get(id)) ?? null
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userCollection.find((u) => u.username === username)
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userCollection.find((u) => u.email === email)
  }

  async listUsers(): Promise<User[]> {
    return this.userCollection.getAll()
  }

  async saveSession(session: Session): Promise<void> {
    await this.sessionCollection.put(session)
  }

  async findSessionById(id: string): Promise<Session | null> {
    return (await this.sessionCollection.get(id)) ?? null
  }

  async revokeSession(id: string, at: Date): Promise<void> {
    const session = await this.findSessionById(id)
    if (!session) throw new Error(`Session ${id} not found`)
    session.revokedAt = at
    await this.sessionCollection.put(session)
  }

  async listActiveSessionsForUser(userId: string, now: Date): Promise<Session[]> {
    return this.sessionCollection.filter(
      (s) => s.userId === userId && s.expiresAt > now && !s.revokedAt,
    )
  }
}
