import { describe, expect, it } from "vitest";
import { getSuggestions, resolveLanguage } from "./i18n";

describe("Language settings", () => {
  it("defaults to English without a saved selection", () => {
    expect(resolveLanguage(null)).toBe("en");
    expect(resolveLanguage("de")).toBe("en");
  });
  it("accepts Swedish", () => { expect(resolveLanguage("sv")).toBe("sv"); });
  it("accepts French", () => { expect(resolveLanguage("fr")).toBe("fr"); });
  it("offers English challenge suggestions", () => {
    expect(getSuggestions("en")).toEqual(["Exercise for 45 min", "Drink 3 litres of water", "Read 10 pages", "No sugar", "Go for a walk outdoors", "Meditate for 10 min"]);
  });
  it("offers Swedish challenge suggestions", () => {
    expect(getSuggestions("sv")).toEqual(["Träna 45 min", "Drick 3 liter vatten", "Läs 10 sidor", "Inget socker", "Promenad utomhus", "Meditera 10 min"]);
  });
  it("offers French challenge suggestions", () => {
    expect(getSuggestions("fr")).toEqual(["Faire du sport pendant 45 min", "Boire 3 litres d’eau", "Lire 10 pages", "Pas de sucre", "Marcher en plein air", "Méditer pendant 10 min"]);
  });
});