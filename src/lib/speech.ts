/* Optional Japanese text-to-speech using the Web Speech API. No-op where the
   browser has no Japanese voice. */

let cachedVoice: SpeechSynthesisVoice | null | undefined

function jaVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    cachedVoice = null
    return null
  }
  const voices = window.speechSynthesis.getVoices()
  cachedVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('ja')) ?? null
  return cachedVoice
}

// Voices load asynchronously in some browsers; refresh the cache when they do.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined
  }
}

/** True if Japanese speech synthesis is available. */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Speak a Japanese string (best effort). */
export function speak(text: string): void {
  if (!canSpeak() || !text) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    const v = jaVoice()
    if (v) u.voice = v
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}
