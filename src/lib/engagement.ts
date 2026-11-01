import { addDays, computeStats, dayNumber, dayProgress, isDayComplete, periodStatus, type AppState } from './challenge';
export const MILESTONES = [7, 23, 40, 45] as const;
export function canOpenDailyCoaching(localHour: number): boolean { return localHour >= 5; }
export function milestone(state: AppState, today: string): number | null {
  if (!state.startDate || !isDayComplete(state, today)) return null;
  const day = dayNumber(state.startDate, today);
  return MILESTONES.some(n => n === day) ? day : null;
}
export function coachingChallenge(state: AppState, today: string) {
  if (!state.startDate || periodStatus(state.startDate, today) !== 'active') return null;
  return state.challenges.find(c => {
    if ((state.log[today] ?? []).includes(c.id)) return false;
    return [1,2,3].every(offset => {
      const date = addDays(today, -offset);
      return date >= (state.startDate ?? today) && !(state.log[date] ?? []).includes(c.id);
    });
  }) ?? null;
}
export function partnerSnapshot(state: AppState, today: string) {
  const stats = computeStats(state, today);
  const progress = dayProgress(state, today);
  return { date: today, day: stats.currentDay, streak: stats.streak, done: progress.done, total: progress.total };
}
export function saveReflection(state: AppState, date: string, text: string): AppState {
  const reflections = { ...state.reflections };
  if (text.trim()) reflections[date] = text.slice(0, 1000); else delete reflections[date];
  return { ...state, reflections };
}
