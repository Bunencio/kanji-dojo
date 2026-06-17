/* Daily study streak + goal. Consistency is half the battle in language
   learning, so the app tracks a per-day review count and a day streak. */

export interface DailyState {
  /** Day streak as of `lastDate`. */
  streak: number
  /** Last study day, local YYYY-MM-DD. */
  lastDate: string
  /** Reviews-per-day goal. */
  goal: number
  /** date → reviews that day (kept for the goal ring + recent history). */
  counts: Record<string, number>
}

export const defaultDaily = (): DailyState => ({ streak: 0, lastDate: '', goal: 20, counts: {} })

const DAY = 86_400_000
const pad = (n: number) => String(n).padStart(2, '0')

/** Local YYYY-MM-DD for an epoch ms. */
export function dateStr(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Record one review at `now`, updating today's count and the streak. */
export function recordStudy(state: DailyState, now: number): DailyState {
  const today = dateStr(now)
  const counts = { ...state.counts, [today]: (state.counts[today] ?? 0) + 1 }
  let streak = state.streak
  if (state.lastDate !== today) {
    streak = state.lastDate === dateStr(now - DAY) ? state.streak + 1 : 1
  }
  return { ...state, streak, lastDate: today, counts }
}

/** Reviews done today. */
export function todayCount(state: DailyState, now: number): number {
  return state.counts[dateStr(now)] ?? 0
}

/**
 * Streak as it stands *right now*: still alive if the last study day was today
 * or yesterday, otherwise broken (0).
 */
export function effectiveStreak(state: DailyState, now: number): number {
  if (!state.lastDate) return 0
  const today = dateStr(now)
  if (state.lastDate === today || state.lastDate === dateStr(now - DAY)) return state.streak
  return 0
}

/** Last `n` days as {date, count}, oldest first — for a mini activity bar. */
export function recentDays(state: DailyState, now: number, n: number): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = dateStr(now - i * DAY)
    out.push({ date: d, count: state.counts[d] ?? 0 })
  }
  return out
}
