import { describe, it, expect } from "vitest";
import { buildPepSummary } from "./pep";
import type { AppState } from "./challenge";

const base: AppState = { startDate: "2026-11-01", challenges: [{ id: "a", name: "Read" }, { id: "b", name: "Walk" }], log: {} };
const days = (n: number) => Array.from({ length: n }, (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`);

describe("pep summary", () => {
  it("flags a challenge missed on 3+ of the last 7 days as struggling", () => {
    const log = Object.fromEntries(days(8).map((d) => [d, ["a"]]));
    const s = buildPepSummary({ ...base, log }, "2026-11-09")!;
    expect(s.mood).toBe("struggling");
    expect(s.challenges[1]!.missedLast7).toBe(7);
  });
  it("is on track when every challenge is done every passed day", () => {
    const log = Object.fromEntries(days(8).map((d) => [d, ["a", "b"]]));
    expect(buildPepSummary({ ...base, log }, "2026-11-09")!.mood).toBe("onTrack");
  });
  it("never includes reflections", () => {
    const s = buildPepSummary({ ...base, reflections: { "2026-11-01": "secret" } }, "2026-11-02");
    expect(JSON.stringify(s)).not.toContain("secret");
  });
  it("returns nothing without a period", () => expect(buildPepSummary({ ...base, startDate: null }, "2026-11-02")).toBeNull());
});

import { isStruggling as _isStruggling } from "./pep";
describe("isStruggling thresholds", () => {
  const base = { name: "x", checkedDays: 0, elapsedDays: 10, currentStreak: 0, missedLast7: 3 };
  it("100% is never struggling", () => expect(_isStruggling({ ...base, percent: 100 })).toBe(false));
  it("90% with recent misses is strong", () => expect(_isStruggling({ ...base, percent: 90 })).toBe(false));
  it("81% with 3 recent misses is struggling", () => expect(_isStruggling({ ...base, percent: 81 })).toBe(true));
  it("below 70% is struggling", () => expect(_isStruggling({ ...base, percent: 60, missedLast7: 0 })).toBe(true));
});
