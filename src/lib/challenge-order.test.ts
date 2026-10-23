import { describe, expect, it } from "vitest";
import { moveChallenge, reorderChallenge, type AppState } from "./challenge";

const s: AppState = {
  startDate: "2026-01-01",
  challenges: [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }],
  log: { "2026-01-01": ["a"] },
};
const ids = (x: AppState) => x.challenges.map((c) => c.id).join("");

describe("moveChallenge", () => {
  it("moves down", () => expect(ids(moveChallenge(s, "a", 1))).toBe("bac"));
  it("moves up", () => expect(ids(moveChallenge(s, "c", -1))).toBe("acb"));
  it("ignores out of bounds", () => {
    expect(ids(moveChallenge(s, "a", -1))).toBe("abc");
    expect(ids(moveChallenge(s, "c", 1))).toBe("abc");
  });
  it("keeps the log", () => expect(moveChallenge(s, "a", 1).log).toEqual(s.log));
});

describe("drag ordering", () => {
  it("moves the top challenge to the bottom in a single drop", () => {
    expect(ids(reorderChallenge(s, "a", "c"))).toBe("bca");
  });
  it("moves the bottom challenge to position 1", () => {
    expect(ids(reorderChallenge(s, "c", "a"))).toBe("cab");
  });
  it("preserves challenge identity, names and checked days", () => {
    const result = reorderChallenge(s, "a", "c");
    expect(result.challenges[2]).toBe(s.challenges[0]);
    expect(result.log).toBe(s.log);
    expect(result.startDate).toBe(s.startDate);
  });
  it("ignores a cancelled or unknown destination", () => {
    expect(reorderChallenge(s, "a", "a")).toBe(s);
    expect(reorderChallenge(s, "a", "missing")).toBe(s);
  });
});
