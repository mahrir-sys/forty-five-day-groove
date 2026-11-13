/**
 * Kärnlogiken för 45-dagarsutmaningen: datum, dagnummer, avbockningar, 'Hoppa över idag' (N/A), statistik och ordning. Alla funktioner är rena (ändrar inget utanför sig själva) och testas i challenge.test.ts.
 */
// Pure logic for the 45-day challenge. All dates are local "YYYY-MM-DD" strings.

/** Hur många dagar en utmaningsperiod är. */
export const TOTAL_DAYS = 45;

export type Challenge = { id: string; name: string };

export type AppState = {
  startDate: string | null;
  firstName?: string;
  challenges: Challenge[];
  /** date -> ids of challenges completed that day */
  log: Record<string, string[]>;
  /** Optional private daily reflections; never included in shared snapshots. */
  reflections?: Record<string, string>;
  /** date -> ids of challenges marked not applicable that day (excluded from stats). */
  na?: Record<string, string[]>;
};

/** Startläget innan användaren har skapat något. */
export const emptyState: AppState = { startDate: null, challenges: [], log: {} };

export type PeriodStatus = "upcoming" | "active" | "finished";

/** Gör om ett Date-objekt till texten ÅÅÅÅ-MM-DD i lokal tid. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Gör om ÅÅÅÅ-MM-DD till ett Date-objekt (lokal midnatt). */
export function parseISODate(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function utc(iso: string): number {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Antal hela dagar mellan två datum. */
export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** Lägger till (eller drar ifrån) n dagar på ett datum. */
export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Local day stays on yesterday until 05:00. */
/** Appens 'logiska' dag: före kl. 05:00 räknas det fortfarande som gårdagen. */
export function challengeDate(now: Date): string {
 const date = toISODate(now);
 return now.getHours() < 5 ? addDays(date, -1) : date;
}

/** Day number in the period (1 = start date). Can be <1 or >45. */
/** Vilken dag i perioden (1–45) ett datum motsvarar. */
export function dayNumber(startDate: string, date: string): number {
  return daysBetween(startDate, date) + 1;
}

/** Periodens sista dag. */
export function endDate(startDate: string): string {
  return addDays(startDate, TOTAL_DAYS - 1);
}

/** Om perioden inte har börjat, pågår eller är avslutad. */
export function periodStatus(startDate: string, today: string): PeriodStatus {
  const n = dayNumber(startDate, today);
  if (n < 1) return "upcoming";
  if (n > TOTAL_DAYS) return "finished";
  return "active";
}

/** Sant om utmaningen är markerad som 'Hoppa över' den dagen. */
export function isNotApplicable(state: AppState, date: string, id: string): boolean {
  return (state.na?.[date] ?? []).includes(id);
}

/** Not-applicable challenges are removed from both done and total. */
/** Hur många utmaningar som är klara av hur många som gäller den dagen (överhoppade räknas inte). */
export function dayProgress(state: AppState, date: string): { done: number; total: number } {
  const ids = new Set(state.log[date] ?? []);
  const active = state.challenges.filter((c) => !isNotApplicable(state, date, c.id));
  const done = active.filter((c) => ids.has(c.id)).length;
  return { done, total: active.length };
}

/** A day where every challenge is not applicable still counts as complete (protects streaks). */
/** Sant om alla gällande utmaningar är avbockade. */
export function isDayComplete(state: AppState, date: string): boolean {
  if (state.challenges.length === 0) return false;
  const { done, total } = dayProgress(state, date);
  return done === total;
}

/** Bockar av eller avmarkerar en utmaning. Returnerar ett nytt state. */
export function toggleCheck(state: AppState, date: string, challengeId: string): AppState {
  const current = state.log[date] ?? [];
  const next = current.includes(challengeId)
    ? current.filter((id) => id !== challengeId)
    : [...current, challengeId];
  const na = (state.na?.[date] ?? []).filter((id) => id !== challengeId);
  return { ...state, log: { ...state.log, [date]: next }, na: { ...state.na, [date]: na } };
}

/** Toggles "not applicable" for one challenge on one day; clears any check for it. */
/** Slår på/av 'Hoppa över idag' för en utmaning; tar även bort ev. avbockning. */
export function toggleNotApplicable(state: AppState, date: string, challengeId: string): AppState {
  const current = state.na?.[date] ?? [];
  const on = !current.includes(challengeId);
  const na = on ? [...current, challengeId] : current.filter((id) => id !== challengeId);
  const log = on ? (state.log[date] ?? []).filter((id) => id !== challengeId) : (state.log[date] ?? []);
  return { ...state, log: { ...state.log, [date]: log }, na: { ...state.na, [date]: na } };
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

/** Total statistik: klara dagar, streaks, procent m.m. */
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
  let possible = 0;
  for (let n = 1; n <= currentDay; n++) {
    const date = addDays(start, n - 1);
    const complete = isDayComplete(state, date);
    if (complete) completedDays++;
    // Today is not missed until it has passed.
    else if (n < todayN) missedDays++;
    const p = dayProgress(state, date);
    doneChecks += p.done;
    possible += p.total;
  }

  // Streak: consecutive complete days ending today (or yesterday if today isn't done yet).
  let streak = 0;
  let n = currentDay;
  if (n >= 1 && n === todayN && !isDayComplete(state, addDays(start, n - 1))) n--;
  while (n >= 1 && isDayComplete(state, addDays(start, n - 1))) {
    streak++;
    n--;
  }

  const percent = possible === 0 ? 0 : Math.round((doneChecks / possible) * 100);

  return { currentDay, completedDays, missedDays, streak, percent };
}

export type ChallengeStats = {
  id: string;
  name: string;
  /** Days this challenge was checked, within the period up to today */
  checkedDays: number;
  /** Elapsed days in the period (including today) */
  elapsedDays: number;
  /** checkedDays / elapsedDays, 0..100 */
  percent: number;
  currentStreak: number;
  bestStreak: number;
};

/** Statistik per utmaning (streak, andel klara dagar). */
export function computeChallengeStats(state: AppState, today: string): ChallengeStats[] {
  const start = state.startDate;
  return state.challenges.map((c) => {
    if (!start) {
      return { id: c.id, name: c.name, checkedDays: 0, elapsedDays: 0, percent: 0, currentStreak: 0, bestStreak: 0 };
    }
    const todayN = dayNumber(start, today);
    const elapsed = Math.max(0, Math.min(TOTAL_DAYS, todayN));
    const has = (n: number) => (state.log[addDays(start, n - 1)] ?? []).includes(c.id);
    const skip = (n: number) => isNotApplicable(state, addDays(start, n - 1), c.id);
    let checked = 0;
    let best = 0;
    let run = 0;
    let counted = 0;
    for (let n = 1; n <= elapsed; n++) {
      if (skip(n)) continue;
      counted++;
      if (has(n)) {
        checked++;
        run++;
        best = Math.max(best, run);
      } else run = 0;
    }
    let current = 0;
    let n = elapsed;
    if (n >= 1 && n === todayN && !has(n)) n--;
    while (n >= 1 && (has(n) || skip(n))) {
      if (has(n)) current++;
      n--;
    }
    return {
      id: c.id,
      name: c.name,
      checkedDays: checked,
      elapsedDays: counted,
      percent: counted === 0 ? 0 : Math.round((checked / counted) * 100),
      currentStreak: current,
      bestStreak: best,
    };
  });
}

/** Moves a challenge one step up (-1) or down (+1); ids and log are untouched. */
/** Flyttar en utmaning ett steg upp (-1) eller ner (1). */
export function moveChallenge(state: AppState, id: string, dir: -1 | 1): AppState {
  const i = state.challenges.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= state.challenges.length) return state;
  const challenges = [...state.challenges];
  const [moved] = challenges.splice(i, 1);
  if (!moved) return state;
  challenges.splice(j, 0, moved);
  return { ...state, challenges };
}

/** Reorder by stable ids; numbering is derived by the UI and history is untouched. */
/** Flyttar en utmaning till en annan plats (används vid dra-och-släpp). */
export function reorderChallenge(state: AppState, activeId: string, overId: string): AppState {
  const from = state.challenges.findIndex((c) => c.id === activeId);
  const to = state.challenges.findIndex((c) => c.id === overId);
  if (from < 0 || to < 0 || from === to) return state;
  const challenges = [...state.challenges];
  const [moved] = challenges.splice(from, 1);
  if (!moved) return state;
  challenges.splice(to, 0, moved);
  return { ...state, challenges };
}
