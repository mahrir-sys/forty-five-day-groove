import { describe, expect, it } from "vitest";
import { dailyMotivation, motivationTheme } from "./motivation";
import type { AppState } from "./challenge";

const state: AppState = { startDate: "2026-10-01", challenges: [{ id: "a", name: "Call family" }, { id: "b", name: "Read" }], log: {} };
describe("daily motivation", () => {
  it('personalizes encouragement without showing a missing name',()=>{
    expect(dailyMotivation({...state,firstName:'Mahmud'},'2026-10-01',7,'en')?.inspiration).toMatch(/^Mahmud, /);
    expect(dailyMotivation(state,'2026-10-01',7,'en')?.inspiration).not.toContain('undefined');
  });
  it("offers morning inspiration tied to a current challenge", () => {
    expect(dailyMotivation(state, "2026-10-01", 7, "en")).toMatchObject({ theme: "relationships", challengeId: "a", recovery: null, celebration: null });
  });
  it("adds support next morning when at least one challenge was left yesterday", () => {
    expect(dailyMotivation({ ...state, log: { "2026-10-01": ["a"] } }, "2026-10-02", 7, "sv")?.recovery).not.toBeNull();
  });
  it("adds support even when no challenge was completed yesterday", () => {
    expect(dailyMotivation(state, "2026-10-02", 7, "en")?.recovery).not.toBeNull();
  });
  it("does not add recovery after a fully completed yesterday", () => {
    expect(dailyMotivation({ ...state, log: { "2026-10-01": ["a", "b"] } }, "2026-10-02", 7, "fr")?.recovery).toBeNull();
  });
  it("celebrates in the evening only when all today's challenges are checked", () => {
    const complete = { ...state, log: { "2026-10-01": ["a", "b"] } };
    expect(dailyMotivation(complete, "2026-10-01", 21, "en")?.celebration).not.toBeNull();
    expect(dailyMotivation(complete, "2026-10-01", 17, "en")?.celebration).toBeNull();
    expect(dailyMotivation(complete, "2026-10-01", 18, "en")?.celebration).not.toBeNull();
    expect(dailyMotivation({ ...state, log: { "2026-10-01": ["a"] } }, "2026-10-01", 21, "en")?.celebration).toBeNull();
  });
  it("does not show motivation outside the period or with no challenges", () => {
    expect(dailyMotivation(state, "2026-09-30", 7, "en")).toBeNull();
    expect(dailyMotivation(state, "2026-11-15", 7, "en")).toBeNull();
    expect(dailyMotivation({ ...state, challenges: [] }, "2026-10-01", 7, "en")).toBeNull();
  });
  it("keeps daily selection stable without changing progress when language changes", () => {
    const before = structuredClone(state);
    const en = dailyMotivation(state, "2026-10-03", 7, "en");
    const sv = dailyMotivation(state, "2026-10-03", 7, "sv");
    expect(en?.challengeId).toBe(sv?.challengeId);
    expect(en?.inspiration).not.toBe(sv?.inspiration);
    expect(state).toEqual(before);
    expect(en?.inspiration).not.toBe(dailyMotivation(state, "2026-10-01", 7, "en")?.inspiration);
  });
  it("recognizes challenge themes across supported languages", () => {
    expect(motivationTheme("Ring familjen")).toBe("relationships");
    expect(motivationTheme("Lire 10 pages")).toBe("growth");
    expect(motivationTheme("Drink water")).toBe("wellbeing");
    expect(motivationTheme("My custom commitment")).toBe("resolve");
  });
});