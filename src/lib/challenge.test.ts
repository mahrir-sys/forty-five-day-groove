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
