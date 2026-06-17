/* Lightweight feedback sounds via the Web Audio API — no audio files. Synthesized
   on the fly, gated behind a persisted on/off setting. */

import { loadJSON, saveJSON } from './storage'

let enabled = loadJSON<boolean>('sound', true)
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq: number, duration: number, delay = 0, type: OscillatorType = 'sine', gain = 0.05) {
  const c = audio()
  if (!c) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(amp).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Short answer-feedback blip. */
export function ping(correct: boolean): void {
  if (!enabled) return
  if (correct) {
    tone(660, 0.1)
    tone(990, 0.12, 0.07)
  } else {
    tone(196, 0.2, 0, 'square', 0.04)
  }
}

/** Celebratory arpeggio for session completion. */
export function fanfare(): void {
  if (!enabled) return
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, i * 0.09, 'triangle', 0.05))
}

export const isSoundEnabled = (): boolean => enabled
export function setSoundEnabled(value: boolean): void {
  enabled = value
  saveJSON('sound', value)
  if (value) ping(true) // confirm it's on
}
