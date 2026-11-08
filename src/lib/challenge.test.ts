import { describe, expect, it } from "vitest";
import { addDays, computeStats, dayNumber, endDate, periodStatus, type AppState } from "./challenge";

const start = "2026-10-01";
const base: AppState = {
  startDate: start,
  challenges: [
    { id: "a", name: "Träna" },
    { id: "b", name: "Läsa" },
  ],
  log: {},
};

describe("45-dagarsperiod", () => {
  it("startdatumet är dag 1", () => {
    expect(dayNumber(start, start)).toBe(1);
  });

  it("perioden är exakt 45 dagar lång", () => {
    expect(endDate(start)).toBe("2026-11-14");
    expect(dayNumber(start, endDate(start))).toBe(45);
    expect(periodStatus(start, endDate(start))).toBe("active");
    expect(periodStatus(start, addDays(start, 45))).toBe("finished");
  });

  it("en missad dag räknas i statistiken men stoppar inte perioden", () => {
    const state: AppState = {
      ...base,
      log: { "2026-10-01": ["a", "b"], "2026-10-02": ["a"], "2026-10-03": ["a", "b"] },
    };
    const stats = computeStats(state, "2026-10-04");
    expect(stats.currentDay).toBe(4);
    expect(stats.completedDays).toBe(2);
    expect(stats.missedDays).toBe(1);
    expect(periodStatus(start, "2026-10-04")).toBe("active");
  });

  it("dagens ofullständiga dag räknas inte som missad och bryter inte streaken", () => {
    const state: AppState = {
      ...base,
      log: { "2026-10-01": ["a", "b"], "2026-10-02": ["a", "b"] },
    };
    const stats = computeStats(state, "2026-10-03");
    expect(stats.missedDays).toBe(0);
    expect(stats.streak).toBe(2);
  });
});

import { computeChallengeStats, toggleCheck, toggleNotApplicable } from "./challenge";
describe("not applicable days", () => {
  const base: AppState = { startDate: "2026-01-01", challenges: [{ id: "a", name: "A" }, { id: "b", name: "B" }], log: {} };
  it("excludes N/A from percent and keeps the day complete", () => {
    let s = toggleCheck(base, "2026-01-01", "a");
    s = toggleNotApplicable(s, "2026-01-01", "b");
    const stats = computeStats(s, "2026-01-01");
    expect(stats.percent).toBe(100);
    expect(stats.completedDays).toBe(1);
  });
  it("N/A day neither counts nor breaks a challenge streak", () => {
    let s = toggleCheck(base, "2026-01-01", "b");
    s = toggleNotApplicable(s, "2026-01-02", "b");
    s = toggleCheck(s, "2026-01-03", "b");
    const b = computeChallengeStats(s, "2026-01-03").find((x) => x.id === "b")!;
    expect(b.elapsedDays).toBe(2);
    expect(b.percent).toBe(100);
    expect(b.currentStreak).toBe(2);
  });
  it("marking N/A clears an existing check", () => {
    const s = toggleNotApplicable(toggleCheck(base, "2026-01-01", "a"), "2026-01-01", "a");
    expect(s.log["2026-01-01"]).toEqual([]);
  });
});
