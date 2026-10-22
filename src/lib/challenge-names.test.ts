import { describe, expect, it } from "vitest";
import { displayChallengeName, mergeNameTranslations, standardNameTranslations } from "./challenge-names";
import { getSuggestions, LANGUAGES } from "./i18n";

describe("Challenge name translations", () => {
  it("translates every suggestion between English, Swedish and French", () => {
    for (const sourceLanguage of LANGUAGES) {
      getSuggestions(sourceLanguage).forEach((source, index) => {
        for (const targetLanguage of LANGUAGES) {
          expect(displayChallengeName(source, targetLanguage, {})).toBe(getSuggestions(targetLanguage)[index]);
        }
      });
    }
  });

  it("preserves unknown source names until their translation is available", () => {
    expect(standardNameTranslations("Run 7 kilometres")).toBeUndefined();
    expect(displayChallengeName("Run 7 kilometres", "fr", {})).toBe("Run 7 kilometres");
  });

  it("changes displayed custom names without changing challenge IDs or checked days", () => {
    const challenge = { id: "run-7", name: "Run 7 kilometres" };
    const state = { challenges: [challenge], log: { "2026-10-22": { "run-7": true } } };
    const original = structuredClone(state);
    const cache = mergeNameTranslations({}, [challenge.name], [{
      source: challenge.name, en: "Run 7 kilometres", sv: "Spring 7 kilometer", fr: "Courir 7 kilomètres",
    }]);
    expect(displayChallengeName(challenge.name, "sv", cache)).toBe("Spring 7 kilometer");
    expect(displayChallengeName(challenge.name, "fr", cache)).toBe("Courir 7 kilomètres");
    expect(displayChallengeName(challenge.name, "en", cache)).toBe("Run 7 kilometres");
    expect(state).toEqual(original);
    expect(state.log["2026-10-22"]["run-7"]).toBe(true);
  });

  it("rejects unrequested or incomplete translations without replacing the existing cache", () => {
    const existing = { Saved: { en: "Saved", sv: "Sparad", fr: "Enregistré" } };
    expect(mergeNameTranslations(existing, ["Run"], [
      { source: "Other", en: "Other", sv: "Annan", fr: "Autre" },
      { source: "Run", en: "Run", sv: "", fr: "Courir" },
    ])).toEqual(existing);
  });
});