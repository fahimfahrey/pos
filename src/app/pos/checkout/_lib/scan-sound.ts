/**
 * Synthesized feedback tones using Web Audio API.
 * No binary asset required; works with prefers-reduced-motion.
 */

import { prefersReducedMotion } from '@shared/utils/motion'
import { isSoundMuted } from './use-sound-settings'

type FeedbackSoundType = 'success' | 'duplicate' | 'not-found' | 'error' | 'payment-complete'

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


export function playFeedbackSound(type: FeedbackSoundType): void {
  if (prefersReducedMotion() || isSoundMuted()) return

  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = type === 'payment-complete' ? 0.35 : 0.2

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

  switch (type) {
    case 'success': {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.linearRampToValueAtTime(1200, now + duration)
      break
    }
    case 'duplicate': {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)
      break
    }
    case 'not-found': {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.linearRampToValueAtTime(200, now + duration)
      break
    }
    case 'error': {
      osc.type = 'square'
      osc.frequency.setValueAtTime(150, now)
      break
    }
    case 'payment-complete': {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(500, now)
      osc.frequency.linearRampToValueAtTime(900, now + duration * 0.6)
      osc.frequency.linearRampToValueAtTime(900, now + duration)
      break
    }
  }

  osc.start(now)
  osc.stop(now + duration)
}
