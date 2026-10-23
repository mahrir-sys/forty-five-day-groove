// Pure rules for the evening reminder. Shared by the app (what to send) and the server job (when to remind).
import { addDays, dayNumber, isDayComplete, TOTAL_DAYS, type AppState } from "./challenge";

/** Reminder goes out around 21:00 in the phone's local time zone. */
export const REMINDER_HOURS: readonly number[] = [21];

export type ReminderSnapshot = {
  startDate: string | null;
  challengeCount: number;
  /** Period days where at least one current challenge is checked off. */
  checkedDates: string[];
  /** All current challenges checked; optional only for legacy clients. */
  completedDates?: string[] | null;
};

export type DeviceReminderState = ReminderSnapshot & { lastRemindedOn: string | null };

/** What the server needs to know about the challenge to decide on reminders. */
export function reminderSnapshot(state: AppState): ReminderSnapshot {
  if (!state.startDate) return { startDate: null, challengeCount: 0, checkedDates: [], completedDates: [] };
  const ids = new Set(state.challenges.map((c) => c.id));
  const checkedDates: string[] = [];
  const completedDates: string[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = addDays(state.startDate, i);
    if ((state.log[date] ?? []).some((id) => ids.has(id))) checkedDates.push(date);
    if (isDayComplete(state, date)) completedDates.push(date);
  }
  return { startDate: state.startDate, challengeCount: state.challenges.length, checkedDates, completedDates };
}

/** Local calendar date ("YYYY-MM-DD") and hour (0–23) at `now` in the given time zone. */
export function localDateHour(now: Date, timeZone: string): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) % 24 };
}

/** Remind once per day at 21 during an active period when any challenge remains. */
export function shouldRemind(device: DeviceReminderState, local: { date: string; hour: number }): boolean {
  if (!device.startDate || device.challengeCount <= 0) return false;
  if (!REMINDER_HOURS.includes(local.hour)) return false;
  const n = dayNumber(device.startDate, local.date);
  if (n < 1 || n > TOTAL_DAYS) return false;
  if (device.lastRemindedOn === local.date) return false;
  // Legacy snapshots cannot distinguish partial and full completion; wait for a sync
  // before reminding on dates with any checks to avoid a false reminder.
  return !(device.completedDates ?? device.checkedDates).includes(local.date);
}
