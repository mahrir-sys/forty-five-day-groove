import { describe, expect, it } from "vitest";
import { localDateHour, reminderSnapshot, shouldRemind, type DeviceReminderState } from "./reminder";

const device = (over: Partial<DeviceReminderState> = {}): DeviceReminderState => ({
  startDate: "2026-10-10",
  challengeCount: 2,
  checkedDates: [],
  lastRemindedOn: null,
  ...over,
});
const today = "2026-10-21";

describe("evening reminder", () => {
  it("reminds at 20:00 when nothing is checked today", () => {
    expect(shouldRemind(device(), { date: today, hour: 20 })).toBe(true);
  });

  it("gives a second chance at 21:00 if 20:00 did not go out", () => {
    expect(shouldRemind(device(), { date: today, hour: 21 })).toBe(true);
  });

  it("does not remind before 20:00 or after 21:59", () => {
    expect(shouldRemind(device(), { date: today, hour: 19 })).toBe(false);
    expect(shouldRemind(device(), { date: today, hour: 22 })).toBe(false);
  });

  it("does not remind when at least one challenge is checked today", () => {
    expect(shouldRemind(device({ checkedDates: [today] }), { date: today, hour: 20 })).toBe(false);
  });

  it("reminds only once per evening", () => {
    expect(shouldRemind(device({ lastRemindedOn: today }), { date: today, hour: 21 })).toBe(false);
  });

  it("does not remind before the period starts or after day 45", () => {
    expect(shouldRemind(device({ startDate: "2026-10-22" }), { date: today, hour: 20 })).toBe(false);
    // Start 2026-09-06 → day 45 is 2026-10-20, so 2026-10-21 is day 46.
    expect(shouldRemind(device({ startDate: "2026-09-06" }), { date: today, hour: 20 })).toBe(false);
    expect(shouldRemind(device({ startDate: "2026-09-07" }), { date: today, hour: 20 })).toBe(true);
  });

  it("does not remind without challenges", () => {
    expect(shouldRemind(device({ challengeCount: 0 }), { date: today, hour: 20 })).toBe(false);
  });
});

describe("local time", () => {
  it("uses Swedish summer and winter time", () => {
    expect(localDateHour(new Date("2026-10-21T18:00:00Z"), "Europe/Stockholm")).toEqual({ date: "2026-10-21", hour: 20 });
    expect(localDateHour(new Date("2026-12-01T19:00:00Z"), "Europe/Stockholm")).toEqual({ date: "2026-12-01", hour: 20 });
  });
});

describe("snapshot", () => {
  it("counts only days with a current challenge checked inside the period", () => {
    const snap = reminderSnapshot({
      startDate: "2026-10-10",
      challenges: [{ id: "a", name: "Löpning" }],
      log: { "2026-10-11": ["a"], "2026-10-12": ["removed"], "2026-10-13": [], "2026-10-01": ["a"] },
    });
    expect(snap).toEqual({ startDate: "2026-10-10", challengeCount: 1, checkedDates: ["2026-10-11"] });
  });
});
