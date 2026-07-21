/**
 * Synthesized scan feedback tones using Web Audio API.
 * No binary asset required; works with prefers-reduced-motion.
 */

type ScanSoundType = 'success' | 'duplicate' | 'not-found'

let audioContextRef: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioContextRef) return audioContextRef

  try {
    audioContextRef = new (window.AudioContext || (window as any).webkitAudioContext)()
    return audioContextRef
  } catch {
    return null
  }
}

function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function playScanSound(type: ScanSoundType): void {
  if (shouldReduceMotion()) return

  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.2

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

  switch (type) {
    case 'success': {
      // Rising tone: 800Hz → 1200Hz
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.linearRampToValueAtTime(1200, now + duration)
      break
    }
    case 'duplicate': {
      // Flat middle tone: 600Hz
      osc.frequency.setValueAtTime(600, now)
      break
    }
    case 'not-found': {
      // Falling tone: 300Hz → 200Hz
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.linearRampToValueAtTime(200, now + duration)
      break
    }
  }

  osc.type = 'sine'
  osc.start(now)
  osc.stop(now + duration)
}
