/* Logic test for the SRS scheduler, review queue and daily streak. */
import { reviewState, isDue, srsLevel, dueCount, newCount, buildReviewQueue } from '/tmp/srs.mjs'
import { recordStudy, todayCount, effectiveStreak, dateStr } from '/tmp/daily.mjs'

const DAY = 86_400_000
const MIN = 60_000
let n = 0
let fail = 0
const ok = (cond, msg) => {
  n++
  if (!cond) {
    fail++
    console.error('  ✗ ' + msg)
  }
}

// --- SRS scheduling ---
const T = 1_000_000_000_000
let s = reviewState(undefined, true, T)
ok(s.reps === 1 && s.interval === 1, `new+correct → reps1 interval1 (got reps${s.reps} int${s.interval})`)
ok(s.due === T + DAY, 'due is +1 day')

s = reviewState(s, true, T + DAY)
ok(s.reps === 2 && s.interval === 3, `2nd correct → reps2 interval3 (got int${s.interval})`)

s = reviewState(s, true, T + 4 * DAY)
ok(s.reps === 3 && s.interval === 8, `3rd correct → interval ≈ 3*2.5=8 (got ${s.interval})`)

const lapsed = reviewState(s, false, T + 10 * DAY)
ok(lapsed.reps === 0 && lapsed.interval === 0, 'miss resets reps/interval')
ok(lapsed.due === T + 10 * DAY + 10 * MIN, 'miss → due in 10 min')
ok(lapsed.lapses === 1 && lapsed.ease < s.ease, 'miss → lapse++ and ease drops')

const rapid = reviewState(s, true, s.last + 1000) // <1 min later
ok(rapid.interval === s.interval, 'rapid re-review does not advance interval')

ok(isDue(lapsed, T + 11 * DAY) === true, 'overdue item is due')
ok(isDue(s, T + 5 * DAY) === false, 'not-yet-due item is not due')
ok(srsLevel(undefined) === 0 && srsLevel({ interval: 30 }) === 5, 'srsLevel bounds')

// --- review queue ---
const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))
const srs = {}
srs['kanji:1'] = { reps: 1, interval: 1, ease: 2.5, due: T - DAY, lapses: 0, last: T - 2 * DAY } // due
srs['kanji:2'] = { reps: 1, interval: 1, ease: 2.5, due: T + DAY, lapses: 0, last: T } // not due
const now = T
ok(dueCount(items, 'kanji', srs, now) === 1, `dueCount = 1 (got ${dueCount(items, 'kanji', srs, now)})`)
ok(newCount(items, 'kanji', srs) === 8, `newCount = 8 (got ${newCount(items, 'kanji', srs)})`)
const q = buildReviewQueue(items, 'kanji', srs, now, 5)
ok(q.length === 5, `queue capped to 5 (got ${q.length})`)
ok(q.some((k) => k.id === 1), 'queue includes the due item')
ok(!q.some((k) => k.id === 2), 'queue excludes the not-due item')

// --- daily streak ---
let d = { streak: 0, lastDate: '', goal: 20, counts: {} }
d = recordStudy(d, T)
ok(effectiveStreak(d, T) === 1, 'first study → streak 1')
ok(todayCount(d, T) === 1, 'today count 1')
d = recordStudy(d, T + 1000)
ok(effectiveStreak(d, T) === 1 && todayCount(d, T) === 2, 'same day → streak 1, count 2')
d = recordStudy(d, T + DAY)
ok(effectiveStreak(d, T + DAY) === 2, 'next day → streak 2')
const gap = recordStudy(d, T + 4 * DAY)
ok(effectiveStreak(gap, T + 4 * DAY) === 1, 'after a gap → streak resets to 1')
ok(effectiveStreak(d, T + 5 * DAY) === 0, 'stale streak (no study) reads as 0')
ok(typeof dateStr(T) === 'string', 'dateStr returns a string')

console.log(`\n${n} assertions, ${fail} failures`)
process.exit(fail ? 1 : 0)
