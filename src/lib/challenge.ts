// Pure logic for the 45-day challenge. All dates are local "YYYY-MM-DD" strings.

export const TOTAL_DAYS = 45;

export type Challenge = { id: string; name: string };

export type AppState = {
  startDate: string | null;
  challenges: Challenge[];
  /** date -> ids of challenges completed that day */
  log: Record<string, string[]>;
};

export const emptyState: AppState = { startDate: null, challenges: [], log: {} };

export type PeriodStatus = "upcoming" | "active" | "finished";

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function utc(iso: string): number {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Day number in the period (1 = start date). Can be <1 or >45. */
export function dayNumber(startDate: string, date: string): number {
  return daysBetween(startDate, date) + 1;
}

export function endDate(startDate: string): string {
  return addDays(startDate, TOTAL_DAYS - 1);
}

export function periodStatus(startDate: string, today: string): PeriodStatus {
  const n = dayNumber(startDate, today);
  if (n < 1) return "upcoming";
  if (n > TOTAL_DAYS) return "finished";
  return "active";
}

export function dayProgress(state: AppState, date: string): { done: number; total: number } {
  const ids = new Set(state.log[date] ?? []);
  const done = state.challenges.filter((c) => ids.has(c.id)).length;
  return { done, total: state.challenges.length };
}

export function isDayComplete(state: AppState, date: string): boolean {
  const { done, total } = dayProgress(state, date);
  return total > 0 && done === total;
}

export function toggleCheck(state: AppState, date: string, challengeId: string): AppState {
  const current = state.log[date] ?? [];
  const next = current.includes(challengeId)
    ? current.filter((id) => id !== challengeId)
    : [...current, challengeId];
  return { ...state, log: { ...state.log, [date]: next } };
}

export type Stats = {
  /** Current day number clamped to 0..45 (0 = not started yet) */
  currentDay: number;
  completedDays: number;
  missedDays: number;
  streak: number;
  /** Share of all checks done in elapsed days, 0..100 */
  percent: number;
};

export function computeStats(state: AppState, today: string): Stats {
  if (!state.startDate) {
    return { currentDay: 0, completedDays: 0, missedDays: 0, streak: 0, percent: 0 };
  }
  const start = state.startDate;
  const todayN = dayNumber(start, today);
  const currentDay = Math.max(0, Math.min(TOTAL_DAYS, todayN));

  let completedDays = 0;
  let missedDays = 0;
  let doneChecks = 0;
  for (let n = 1; n <= currentDay; n++) {
    const date = addDays(start, n - 1);
    const complete = isDayComplete(state, date);
    if (complete) completedDays++;
    // Today is not missed until it has passed.
    else if (n < todayN) missedDays++;
    doneChecks += dayProgress(state, date).done;
  }

  // Streak: consecutive complete days ending today (or yesterday if today isn't done yet).
  let streak = 0;
  let n = currentDay;
  if (n >= 1 && n === todayN && !isDayComplete(state, addDays(start, n - 1))) n--;
  while (n >= 1 && isDayComplete(state, addDays(start, n - 1))) {
    streak++;
    n--;
  }

  const possible = currentDay * state.challenges.length;
  const percent = possible === 0 ? 0 : Math.round((doneChecks / possible) * 100);

  return { currentDay, completedDays, missedDays, streak, percent };
}
