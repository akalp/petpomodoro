import { describe, expect, it } from "vitest";

import {
  FOOD_NOT_FOUND_ERROR,
  INSUFFICIENT_COINS_ERROR,
  PET_ALREADY_SLEEPING_ERROR,
  PET_NOT_SLEEPING_ERROR,
  PET_SLEEPING_CANNOT_EAT_ERROR,
  PET_SLEEPING_CANNOT_FOCUS_ERROR,
} from "../domain";
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
    expect(t("moodWorking")).toBe("Odaklanıyor");
    expect(t("moodSleeping")).toBe("Uyuyor");
    expect(t("wakePet", { pet: "Momo" })).toBe("Momo uyansın");
    expect(t("foodMoonMilk")).toBe("Ay sütü");
  });

  it("localizes known persisted store error messages", () => {
    const t = createTranslator("tr");

    expect(
      localizeErrorMessage("Your pet needs a small name to answer to.", t),
    ).toContain("Dostunun");
    expect(localizeErrorMessage(PET_ALREADY_SLEEPING_ERROR, t)).toBe(
      "Dostun zaten dinleniyor.",
    );
    expect(localizeErrorMessage(PET_NOT_SLEEPING_ERROR, t)).toBe(
      "Dostun şu anda dinlenmiyor.",
    );
    expect(localizeErrorMessage(INSUFFICIENT_COINS_ERROR, t)).toBe(
      "Daha çok jeton gerekli",
    );
    expect(localizeErrorMessage(FOOD_NOT_FOUND_ERROR, t)).toBe(
      "Bu atıştırmalık şu anda kullanılamıyor.",
    );
    expect(localizeErrorMessage(PET_SLEEPING_CANNOT_EAT_ERROR, t)).toBe(
      "Atıştırmalıklar dostun uyanana kadar bekler.",
    );
    expect(localizeErrorMessage(PET_SLEEPING_CANNOT_FOCUS_ERROR, t)).toBe(
      "Dostun dinleniyor. Odağa başlamadan önce uyandır.",
    );
  });
});
