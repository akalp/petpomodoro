import { describe, expect, it } from "vitest";

import {
  FOOD_NOT_FOUND_ERROR,
  INSUFFICIENT_COINS_ERROR,
  EMERGENCY_SNACK_DAILY_LIMIT_ERROR,
  EMERGENCY_SNACK_NOT_NEEDED_ERROR,
  PET_ALREADY_SLEEPING_ERROR,
  PET_FOCUS_NEEDS_CARE_ERROR,
  PET_NOT_SLEEPING_ERROR,
  PET_SLEEPING_CANNOT_EAT_ERROR,
  PET_SLEEPING_CANNOT_FOCUS_ERROR,
  POWER_NAP_COOLDOWN_ACTIVE_ERROR,
  POWER_NAP_DAILY_LIMIT_ERROR,
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
    expect(t("sleepHungerLabel")).toBe("Tokluk");
    expect(t("foodMoonMilk")).toBe("Ay sütü");
    expect(t("foodCozyStew")).toBe("Sıcacık yahni");
    expect(t("speciesMoowiName")).toBe("Moowi");
    expect(t("speciesMoowiDescription")).toContain("küçük bir inek");
    expect(t("speciesMoowiSelectionLabel")).toBe("Moowi'yi seç");
    expect(t("petNameSupport")).toContain("kendi adını");
    expect(t("powerNapTitle")).toBe("Kısa uyku");
    expect(t("emergencySnackTitle")).toBe("Destek atıştırmalığı");
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
    expect(localizeErrorMessage(PET_FOCUS_NEEDS_CARE_ERROR, t)).toBe(
      "Dostunun odağa başlamadan önce biraz bakıma ihtiyacı var.",
    );
    expect(localizeErrorMessage(POWER_NAP_DAILY_LIMIT_ERROR, t)).toContain(
      "iki kısa uyku",
    );
    expect(localizeErrorMessage(POWER_NAP_COOLDOWN_ACTIVE_ERROR, t)).toContain(
      "biraz sonra",
    );
    expect(
      localizeErrorMessage(EMERGENCY_SNACK_DAILY_LIMIT_ERROR, t),
    ).toContain("zaten yedi");
    expect(localizeErrorMessage(EMERGENCY_SNACK_NOT_NEEDED_ERROR, t)).toContain(
      "daha aç",
    );
  });
});
