import { describe, expect, it } from "vitest";
import { needsUpdate } from "./version";
import { QUOTES } from "./quotes";

describe("version check", () => {
  it("updates only when the server version differs", () => {
    expect(needsUpdate("a", "b")).toBe(true);
    expect(needsUpdate("a", "a")).toBe(false);
    expect(needsUpdate("a", "")).toBe(false);
    expect(needsUpdate("a", undefined)).toBe(false);
  });
  it("has 45 unique quotes so none repeats in a period", () => {
    expect(new Set(QUOTES.map(q => q.en)).size).toBe(45);
  });
});
