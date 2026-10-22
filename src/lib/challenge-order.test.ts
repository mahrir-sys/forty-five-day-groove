import { describe, expect, it } from "vitest";
import { moveChallenge, type AppState } from "./challenge";

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
