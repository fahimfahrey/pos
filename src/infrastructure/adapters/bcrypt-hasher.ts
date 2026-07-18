import { hash, compare } from 'bcryptjs'
import type { Hasher } from '@shared/ports/password-hasher'

const BCRYPT_ROUNDS = 10

export class BcryptHasher implements Hasher {
  async hash(plain: string): Promise<string> {
    return hash(plain, BCRYPT_ROUNDS)
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
