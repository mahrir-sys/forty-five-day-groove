// Pure rules for the evening reminder. Shared by the app (what to send) and the server job (when to remind).
import { addDays, dayNumber, TOTAL_DAYS, type AppState } from "./challenge";

/** Local hours when a reminder may go out: 20:00, with 21:00 as a second chance if 20:00 was missed. */
export const REMINDER_HOURS: readonly number[] = [20, 21];

export type ReminderSnapshot = {
  startDate: string | null;
  challengeCount: number;
  /** Period days where at least one current challenge is checked off. */
  checkedDates: string[];
};

export type DeviceReminderState = ReminderSnapshot & { lastRemindedOn: string | null };

/** What the server needs to know about the challenge to decide on reminders. */
export function reminderSnapshot(state: AppState): ReminderSnapshot {
  if (!state.startDate) return { startDate: null, challengeCount: 0, checkedDates: [] };
  const ids = new Set(state.challenges.map((c) => c.id));
  const checkedDates: string[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = addDays(state.startDate, i);
    if ((state.log[date] ?? []).some((id) => ids.has(id))) checkedDates.push(date);
  }
  return { startDate: state.startDate, challengeCount: state.challenges.length, checkedDates };
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

/** Remind in the evening window, once per day, during an active period, when nothing is checked today. */
export function shouldRemind(device: DeviceReminderState, local: { date: string; hour: number }): boolean {
  if (!device.startDate || device.challengeCount <= 0) return false;
  if (!REMINDER_HOURS.includes(local.hour)) return false;
  const n = dayNumber(device.startDate, local.date);
  if (n < 1 || n > TOTAL_DAYS) return false;
  if (device.lastRemindedOn === local.date) return false;
  return !device.checkedDates.includes(local.date);
}
