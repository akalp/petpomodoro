import { describe, expect, it } from "vitest";

import {
  createTranslator,
  languageLocale,
  localizeErrorMessage,
  normalizeLanguage,
} from "./index";

describe("offline translations", () => {
  it("uses English by default and detects Turkish locales", () => {
    expect(normalizeLanguage(undefined)).toBe("en");
    expect(normalizeLanguage("en-US")).toBe("en");
    expect(normalizeLanguage("tr-TR")).toBe("tr");
    expect(languageLocale("tr")).toBe("tr-TR");
  });

  it("serves bundled Turkish copy with interpolation", () => {
    const t = createTranslator("tr");

    expect(t("startTitle")).toBe("Birlikte odaklanmaya hazır mısın?");
    expect(t("durationMinutes", { minutes: 25 })).toBe("25 dk");
    expect(t("confirmationTitle")).toContain("gerçekten tamamladın mı");
  });

  it("localizes known persisted store error messages", () => {
    const t = createTranslator("tr");

    expect(
      localizeErrorMessage("Your pet needs a small name to answer to.", t),
    ).toContain("Dostunun");
  });
});
