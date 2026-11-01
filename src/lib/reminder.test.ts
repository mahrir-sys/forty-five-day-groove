import { describe, expect, it } from "vitest";
import { localDateHour, reminderSnapshot, shouldRemind, shouldRemindLunch, reminderMessage, type DeviceReminderState } from "./reminder";

const device = (over: Partial<DeviceReminderState> = {}): DeviceReminderState => ({
  startDate: "2026-10-10",
  challengeCount: 2,
  checkedDates: [],
  completedDates: [],
  lastRemindedOn: null,
  ...over,
});
const today = "2026-10-21";

describe("evening reminder", () => {
  it("does not remind at 20:00", () => {
    expect(shouldRemind(device(), { date: today, hour: 20 })).toBe(false);
  });

  it("reminds at 21:00 when nothing is checked", () => {
    expect(shouldRemind(device(), { date: today, hour: 21 })).toBe(true);
  });

  it("does not remind before 21:00 or after 21:59", () => {
    expect(shouldRemind(device(), { date: today, hour: 19 })).toBe(false);
    expect(shouldRemind(device(), { date: today, hour: 22 })).toBe(false);
  });

  it("reminds at 21 when one of two challenges remains", () => {
    expect(shouldRemind(device({ checkedDates: [today], completedDates: [] }), { date: today, hour: 21 })).toBe(true);
  });

  it("does not remind when all challenges are complete", () => {
    expect(shouldRemind(device({ checkedDates: [today], completedDates: [today] }), { date: today, hour: 21 })).toBe(false);
  });

  it("handles legacy snapshots conservatively until the phone syncs", () => {
    expect(shouldRemind(device({ checkedDates: [today], completedDates: null }), { date: today, hour: 21 })).toBe(false);
    expect(shouldRemind(device({ completedDates: null }), { date: today, hour: 21 })).toBe(true);
  });

  it("reminds only once per evening", () => {
    expect(shouldRemind(device({ lastRemindedOn: today }), { date: today, hour: 21 })).toBe(false);
  });

  it("does not remind before the period starts or after day 45", () => {
    expect(shouldRemind(device({ startDate: "2026-10-22" }), { date: today, hour: 21 })).toBe(false);
    // Start 2026-09-06 → day 45 is 2026-10-20, so 2026-10-21 is day 46.
    expect(shouldRemind(device({ startDate: "2026-09-06" }), { date: today, hour: 21 })).toBe(false);
    expect(shouldRemind(device({ startDate: "2026-09-07" }), { date: today, hour: 21 })).toBe(true);
  });

  it("does not remind without challenges", () => {
    expect(shouldRemind(device({ challengeCount: 0 }), { date: today, hour: 21 })).toBe(false);
  });
});

describe("local time", () => {
  it("uses Swedish summer and winter time", () => {
    expect(localDateHour(new Date("2026-10-21T18:00:00Z"), "Europe/Stockholm")).toEqual({ date: "2026-10-21", hour: 20 });
    expect(localDateHour(new Date("2026-12-01T19:00:00Z"), "Europe/Stockholm")).toEqual({ date: "2026-12-01", hour: 20 });
  });
});

describe('lunch reminder',()=>{
 it('sends at noon only when no current challenge has been checked',()=>{
  expect(shouldRemindLunch(device(),{date:today,hour:12})).toBe(true);
  expect(shouldRemindLunch(device({checkedDates:[today]}),{date:today,hour:12})).toBe(false);
  expect(shouldRemindLunch(device(),{date:today,hour:11})).toBe(false);
  expect(shouldRemindLunch(device(),{date:today,hour:13})).toBe(false);
 });
 it('deduplicates lunch separately from evening',()=>{
  expect(shouldRemindLunch(device({lastLunchRemindedOn:today}),{date:today,hour:12})).toBe(false);
  expect(shouldRemind(device({lastLunchRemindedOn:today}),{date:today,hour:21})).toBe(true);
 });
 it('only sends during an active 45-day period',()=>{
  expect(shouldRemindLunch(device({startDate:'2026-10-22'}),{date:today,hour:12})).toBe(false);
  expect(shouldRemindLunch(device({startDate:'2026-09-06'}),{date:today,hour:12})).toBe(false);
 });
 it('syncs selected language and optional name without reflections',()=>{
  expect(reminderSnapshot({startDate:null,firstName:'Mahmud',challenges:[],log:{},reflections:{'2026-11-01':'private'}},'fr')).toEqual({startDate:null,challengeCount:0,checkedDates:[],completedDates:[],language:'fr',firstName:'Mahmud'});
 });
 it('localizes both push kinds to English, Swedish and French',()=>{
  expect(reminderMessage('evening',today,'en').body).toContain('You still have');
  expect(reminderMessage('evening',today,'sv').body).toContain('Du har');
  expect(reminderMessage('evening',today,'fr').body).toContain('Il vous reste');
  expect(reminderMessage('lunch',today,'en').title).toContain('midday');
  expect(reminderMessage('lunch',today,'sv').title).toContain('lunchpepp');
  expect(reminderMessage('lunch',today,'fr').title).toContain('midi');
 });
 it('personalizes only when a name exists and varies lunch wording',()=>{
  expect(reminderMessage('lunch',today,'sv','Mahmud').body).toMatch(/^Mahmud, /);
  expect(reminderMessage('evening',today,'fr','Mahmud').body).toMatch(/^Mahmud, /);
  expect(reminderMessage('lunch',today,'en').body).not.toContain('undefined');
  expect(reminderMessage('lunch',today,'en').body).not.toBe(reminderMessage('lunch','2026-10-22','en').body);
 });
});

describe("snapshot", () => {
  it("counts only days with a current challenge checked inside the period", () => {
    const snap = reminderSnapshot({
      startDate: "2026-10-10",
      challenges: [{ id: "a", name: "Löpning" }],
      log: { "2026-10-11": ["a"], "2026-10-12": ["removed"], "2026-10-13": [], "2026-10-01": ["a"] },
    });
    expect(snap).toEqual({ startDate: "2026-10-10", challengeCount: 1, checkedDates: ["2026-10-11"], completedDates: ["2026-10-11"] });
  });

  it("distinguishes partial checks from all current challenges being complete", () => {
    const snap = reminderSnapshot({
      startDate: "2026-10-10",
      challenges: [{ id: "a", name: "A" }, { id: "b", name: "B" }],
      log: { "2026-10-10": ["a"], "2026-10-11": ["a", "b", "removed"] },
    });
    expect(snap.checkedDates).toEqual(["2026-10-10", "2026-10-11"]);
    expect(snap.completedDates).toEqual(["2026-10-11"]);
  });
});
