// Pure Crockford base32-encoded ULID generator.
// Format: 48-bit timestamp (milliseconds) + 80-bit randomness = 128 bits = 26 characters.
// Assumes 2-decimal currency (see money.ts for context).

const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function generateUlid(clock?: () => number): string {
  const now = clock ? clock() : Date.now()

  // Encode 48-bit timestamp (big-endian)
  const timeChars = new Array(10)
  let time = now
  for (let i = 9; i >= 0; i--) {
    timeChars[i] = CROCKFORD_ALPHABET[time & 0x1f]
    time >>>= 5
  }

  // Generate 80 bits of randomness (16 characters)
  const randomChars = new Array(16)
  const random = new Uint8Array(10)
  crypto.getRandomValues(random)

  let bits = 0
  let bitIndex = 0

  for (let i = 0; i < 16; i++) {
    if (bitIndex === 0) {
      bits = random[Math.floor(i * 10 / 16)]
      bitIndex = 8
    }
    randomChars[i] = CROCKFORD_ALPHABET[(bits >>> (bitIndex - 5)) & 0x1f]
    bitIndex -= 5
  }

  return timeChars.join('') + randomChars.join('')
}
