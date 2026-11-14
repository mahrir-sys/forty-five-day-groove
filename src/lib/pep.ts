import { addDays, computeChallengeStats, computeStats, dayNumber, type AppState } from "./challenge";

export type PepChallenge = { name: string; checkedDays: number; elapsedDays: number; percent: number; currentStreak: number; missedLast7: number };
export type PepSummary = { day: number; streak: number; firstName: string | null; mood: "struggling" | "onTrack"; challenges: PepChallenge[] };
export type PepResult = { headline: string; message: string; tips: string[] };

/** Below this completion rate (or 3+ misses in the last 7 days) a challenge counts as hard. */
export const STRUGGLE_PERCENT = 70;

export function isStruggling(c: PepChallenge): boolean {
  if (c.elapsedDays <= 0) return false;
  // High overall completion (90%+) always counts as strong, even after a recent dip.
  if (c.percent >= 90) return false;
  return c.percent < STRUGGLE_PERCENT || c.missedLast7 >= 3;
}

/** Compact, name-and-number-only summary sent to the AI; reflections never leave the device. */
export function buildPepSummary(state: AppState, today: string): PepSummary | null {
  if (!state.startDate || !state.challenges.length) return null;
  const day = Math.max(0, Math.min(45, dayNumber(state.startDate, today)));
  const start = state.startDate;
  const challenges = computeChallengeStats(state, today).map((s) => {
    let missedLast7 = 0;
    // Count only fully passed days; today is still in progress.
    for (let i = 1; i <= 7; i++) {
      const date = addDays(today, -i);
      if (date < start || dayNumber(start, date) > 45) continue;
      if ((state.na?.[date] ?? []).includes(s.id)) continue; // skipped days are not misses
      if (!(state.log[date] ?? []).includes(s.id)) missedLast7++;
    }
    return { name: s.name.slice(0, 200), checkedDays: s.checkedDays, elapsedDays: s.elapsedDays, percent: s.percent, currentStreak: s.currentStreak, missedLast7 };
  });
  const mood = challenges.some(isStruggling) ? "struggling" : "onTrack";
  return { day, streak: computeStats(state, today).streak, firstName: state.firstName?.trim() || null, mood, challenges };
}

export const PEP_CACHE_KEY = "45days:pep";
