/**
 * Deterministic ULID generator for conformance tests.
 * Generates monotonic 26-char strings that preserve order (lexicographic == chronological).
 * Format: "TTTTTTTTTT" (timestamp, 10 chars) + "CCCCCCCCCCCCCCCC" (counter, 16 chars)
 */

export function createUlidGenerator(seedTimestamp: number = 1609459200): () => string {
  let counter = 0

  return () => {
    const ms = seedTimestamp + Math.floor(counter / 1000)
    const ctr = counter % 1000
    counter++

    // 26-char format: 10-char timestamp + 16-char counter (left-padded with zeros)
    const timeStr = ms.toString().padStart(10, '0')
    const ctrStr = ctr.toString().padStart(16, '0')
    const ulid = timeStr + ctrStr
    return ulid.slice(0, 26).padEnd(26, '0')
  }
}
