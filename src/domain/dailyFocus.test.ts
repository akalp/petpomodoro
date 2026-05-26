import { describe, expect, it } from "vitest";

import { DomainError } from "./errors";
import {
  MAX_STREAK_FREEZES_PER_MISSED_DAY,
  STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR,
  STREAK_FREEZE_COST_HONESTY_HEARTS,
  STREAK_FREEZE_DAILY_LIMIT_ERROR,
  STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR,
  applyStreakFreeze,
  checkStreakFreezeEligibility,
} from "./dailyFocus";
import { makeDailyFocusState, makePet } from "../test/factories";

describe("streak freeze", () => {
  const now = "2026-05-26T12:00:00.000Z";

  it("allows a missed day with enough honesty hearts and no cooldown", () => {
    const pet = makePet({ streak: 4, honestyHearts: 3 });
    const dailyFocusState = makeDailyFocusState({
      dateKey: "2026-05-25",
      completedFocusMinutes: 0,
      dailyGoalAwarded: false,
    });

    const eligibility = checkStreakFreezeEligibility(pet, dailyFocusState, now);

    expect(eligibility).toMatchObject({
      canApply: true,
      reasons: [],
      costHonestyHearts: STREAK_FREEZE_COST_HONESTY_HEARTS,
      maxFreezesPerMissedDay: MAX_STREAK_FREEZES_PER_MISSED_DAY,
    });
  });

  it("spends honesty hearts and records freeze metadata without increasing streak or focus rewards", () => {
    const pet = makePet({
      streak: 4,
      honestyHearts: 5,
      xp: 80,
      coins: 12,
      happiness: 60,
    });
    const dailyFocusState = makeDailyFocusState({
      dateKey: "2026-05-25",
      completedFocusMinutes: 10,
      dailyGoalAwarded: false,
    });

    const result = applyStreakFreeze(pet, dailyFocusState, now);

    expect(result.honestyHeartsSpent).toBe(STREAK_FREEZE_COST_HONESTY_HEARTS);
    expect(result.pet).toMatchObject({
      streak: 4,
      honestyHearts: 2,
      xp: 80,
      coins: 12,
      happiness: 60,
      lastFreezeUsedAt: now,
      updatedAt: now,
    });
    expect(result.dailyFocusState).toMatchObject({
      completedFocusMinutes: 10,
      dailyGoalAwarded: false,
      streakFreezesUsed: 1,
      lastStreakFreezeAt: now,
    });
  });

  it("blocks another freeze while the cooldown is active", () => {
    const pet = makePet({
      honestyHearts: 6,
      lastFreezeUsedAt: "2026-05-22T12:00:00.000Z",
    });
    const dailyFocusState = makeDailyFocusState({ dateKey: "2026-05-25" });

    const eligibility = checkStreakFreezeEligibility(pet, dailyFocusState, now);

    expect(eligibility.canApply).toBe(false);
    expect(eligibility.reasons).toContain(STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR);
    expect(() => applyStreakFreeze(pet, dailyFocusState, now)).toThrow(
      DomainError,
    );
    expect(() => applyStreakFreeze(pet, dailyFocusState, now)).toThrow(
      STREAK_FREEZE_COOLDOWN_ACTIVE_ERROR,
    );
  });

  it("blocks a freeze when honesty hearts are insufficient", () => {
    const pet = makePet({ honestyHearts: 2 });
    const dailyFocusState = makeDailyFocusState({ dateKey: "2026-05-25" });

    const eligibility = checkStreakFreezeEligibility(pet, dailyFocusState, now);

    expect(eligibility.canApply).toBe(false);
    expect(eligibility.reasons).toContain(
      STREAK_FREEZE_INSUFFICIENT_HEARTS_ERROR,
    );
  });

  it("blocks repeated freezes for the same missed day", () => {
    const pet = makePet({ honestyHearts: 6 });
    const dailyFocusState = makeDailyFocusState({
      dateKey: "2026-05-25",
      streakFreezesUsed: 1,
      lastStreakFreezeAt: "2026-05-26T09:00:00.000Z",
    });

    const eligibility = checkStreakFreezeEligibility(pet, dailyFocusState, now);

    expect(eligibility.canApply).toBe(false);
    expect(eligibility.reasons).toContain(STREAK_FREEZE_DAILY_LIMIT_ERROR);
  });
});
