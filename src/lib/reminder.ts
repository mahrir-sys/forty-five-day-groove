/**
 * Regler för lunch- och kvällspåminnelser (pushnotiser). Servern kör ett jobb varje timme som använder dessa funktioner.
 */
// Pure rules for the evening reminder. Shared by the app (what to send) and the server job (when to remind).
import type { Language } from "./i18n";
import { personalText } from "./personalization";
import { addDays, dayNumber, isDayComplete, TOTAL_DAYS, type AppState } from "./challenge";

/** Reminder goes out around 21:00 in the phone's local time zone. */
/** Klockslag (lokal tid) då kvällspåminnelsen får skickas. */
export const REMINDER_HOURS: readonly number[] = [21];

export type ReminderSnapshot = {
  language?: Language; firstName?: string;
  startDate: string | null;
  challengeCount: number;
  /** Period days where at least one current challenge is checked off. */
  checkedDates: string[];
  /** All current challenges checked; optional only for legacy clients. */
  completedDates?: string[] | null;
};

export type DeviceReminderState = ReminderSnapshot & { lastRemindedOn: string | null; lastLunchRemindedOn?: string | null };

/** What the server needs to know about the challenge to decide on reminders. */
/** Minimal sammanfattning av framstegen som skickas till servern (aldrig reflektioner). */
export function reminderSnapshot(state: AppState, language?: Language): ReminderSnapshot {
  const personal = language ? {language, firstName: state.firstName?.trim() ?? ""} : {};
  if (!state.startDate) return { ...personal, startDate: null, challengeCount: 0, checkedDates: [], completedDates: [] };
  const ids = new Set(state.challenges.map((c) => c.id));
  const checkedDates: string[] = [];
  const completedDates: string[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = addDays(state.startDate, i);
    if ((state.log[date] ?? []).some((id) => ids.has(id))) checkedDates.push(date);
    if (isDayComplete(state, date)) completedDates.push(date);
  }
  return { ...personal, startDate: state.startDate, challengeCount: state.challenges.length, checkedDates, completedDates };
}

/** Local calendar date ("YYYY-MM-DD") and hour (0–23) at `now` in the given time zone. */
/** Datum och timme i användarens tidszon. */
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
/** Ska kvällspåminnelse skickas? Bara om något är oavbockat och inte redan skickat idag. */
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

/** Ska lunchpåminnelse skickas? Bara om inget alls är avbockat före kl. 12. */
export function shouldRemindLunch(device: DeviceReminderState, local: {date:string;hour:number}): boolean {
 if(!device.startDate || device.challengeCount<=0 || local.hour!==12 || device.lastLunchRemindedOn===local.date)return false;
 const day=dayNumber(device.startDate,local.date);
 return day>=1 && day<=TOTAL_DAYS && !device.checkedDates.includes(local.date);
}
const lunchWords = {
 en: ["A small start is enough. Is there one challenge you could check off this afternoon?", "No rush — one little step can get your day moving.", "A gentle midday nudge: choose the easiest challenge and begin small."],
 sv: ["En liten start räcker. Finns det en utmaning du kan bocka av i eftermiddag?", "Ingen stress — ett litet steg kan sätta dagen i rörelse.", "En snäll lunchpåminnelse: välj den enklaste utmaningen och börja smått."],
 fr: ["Un petit début suffit. Pourriez-vous valider un défi cet après-midi ?", "Sans pression : un petit pas peut donner de l’élan à votre journée.", "Un rappel bienveillant à midi : choisissez le défi le plus simple et commencez doucement."]
};
const eveningWords = {en:"You still have challenges left today. One step at a time — you have until 5 am.",sv:"Du har utmaningar kvar idag. Ett steg i taget — du har fram till kl. 05.",fr:"Il vous reste des défis aujourd’hui. Un pas à la fois : vous avez jusqu’à 5 h."};
/** Väljer en varierad notistext på användarens språk. */
export function reminderMessage(kind:'lunch'|'evening'|'test',date:string,language:Language,firstName='') {
 const index=Math.abs(dayNumber('2026-01-01',date))%3;
 const body=kind==='lunch' ? lunchWords[language][index] ?? '' : kind==='test' ? ({en:'It works! Your reminders are ready.',sv:'Det fungerar! Dina påminnelser är redo.',fr:'Cela fonctionne ! Vos rappels sont prêts.'})[language] : eveningWords[language];
 const title=kind==='lunch' ? ({en:'A little midday encouragement',sv:'Lite lunchpepp',fr:'Un encouragement à midi'})[language] : kind==='test' ? ({en:'Test notification',sv:'Testnotis',fr:'Notification de test'})[language] : ({en:'Time to check off your day',sv:'Dags att bocka av dagen',fr:'Un dernier pas pour aujourd’hui'})[language];
 return {title:`45 days – ${title}`,body:personalText(body,firstName),url:'/',tag:kind==='test'?'test':`${kind}-reminder`};
}
