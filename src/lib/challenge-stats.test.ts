import { describe, expect, it } from "vitest";
import { computeChallengeStats, type AppState } from "./challenge";

const state: AppState = {
  startDate: "2026-10-01",
  challenges: [{ id: "a", name: "Träna" }, { id: "b", name: "Läsa" }],
  log: {
    "2026-10-01": ["a", "b"],
    "2026-10-02": ["a", "b"],
    "2026-10-03": ["a"],
    "2026-10-04": ["b"],
    "2026-10-05": ["b"],
  },
};

describe("statistik per utmaning", () => {
  it("räknar avbockade dagar och procent av passerade dagar", () => {
    const [a, b] = computeChallengeStats(state, "2026-10-05");
    expect(a.checkedDays).toBe(3);
    expect(a.percent).toBe(60);
    expect(b.checkedDays).toBe(4);
    expect(b.percent).toBe(80);
  });

  it("nuvarande och bästa streak", () => {
    const [a, b] = computeChallengeStats(state, "2026-10-05");
    expect(a.currentStreak).toBe(0);
    expect(a.bestStreak).toBe(3);
    expect(b.currentStreak).toBe(2);
    expect(b.bestStreak).toBe(2);
  });

  it("dagens obockade dag bryter inte nuvarande streak", () => {
    const [, b] = computeChallengeStats(state, "2026-10-06");
    expect(b.currentStreak).toBe(2);
  });
});
