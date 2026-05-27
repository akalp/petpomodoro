import { describe, expect, it } from "vitest";

import {
  buildAchievementRules,
  evaluateAchievementRule,
  evaluateAchievementUnlocks,
  type AchievementId,
  type AchievementProgressSnapshot,
} from "./achievements";
import { ACTIVE_BALANCE_PROFILE } from "./balance";

const emptyProgress: AchievementProgressSnapshot = {
  totalFocusMinutes: 0,
  currentDailyStreak: 0,
  honestyHearts: 0,
  careEvents: [],
};

describe("achievement rules", () => {
  it("builds typed achievement rules from the active balance profile", () => {
    const rules = buildAchievementRules();

    expect(
      rules
        .filter((rule) => rule.category === "focus_minutes")
        .map((rule) => rule.id),
    ).toEqual(["focus_minutes_100", "focus_minutes_500", "focus_minutes_1000"]);
    expect(
      rules
        .filter((rule) => rule.category === "daily_streak")
        .map((rule) => rule.id),
    ).toEqual(["daily_streak_3", "daily_streak_7", "daily_streak_14", "daily_streak_30"]);
    expect(
      rules
        .filter((rule) => rule.category === "honesty_hearts")
        .map((rule) => rule.id),
    ).toEqual([
      "honesty_hearts_1",
      "honesty_hearts_5",
      "honesty_hearts_15",
      "honesty_hearts_30",
    ]);
    expect(
      rules
        .filter((rule) => rule.kind === "event")
        .map((rule) => rule.id),
    ).toEqual([
      "care_first_sleep",
      "rescue_first_power_nap",
      "rescue_first_emergency_snack",
      "care_first_happy_mood",
    ]);
  });

  it("keeps all achievement thresholds centralized in balance config", () => {
    expect(ACTIVE_BALANCE_PROFILE.achievements).toEqual({
      focusMinuteThresholds: [100, 500, 1000],
      dailyStreakThresholds: [3, 7, 14, 30],
      honestyHeartThresholds: [1, 5, 15, 30],
      careEvents: [
        "first_sleep",
        "first_power_nap",
        "first_emergency_snack",
        "first_happy_mood",
      ],
    });
  });

  it("evaluates focus minute thresholds without granting rewards", () => {
    const result = evaluateAchievementUnlocks({
      ...emptyProgress,
      totalFocusMinutes: 500,
    });

    expect(result.newlyUnlockedIds).toEqual([
      "focus_minutes_100",
      "focus_minutes_500",
    ]);
    expect(result.newlyUnlockedRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "focus_minutes",
          kind: "threshold",
          metric: "totalFocusMinutes",
          threshold: 500,
        }),
      ]),
    );
  });

  it("evaluates daily streak achievements from the current streak count", () => {
    const result = evaluateAchievementUnlocks({
      ...emptyProgress,
      currentDailyStreak: 7,
    });

    expect(result.newlyUnlockedIds).toEqual(["daily_streak_3", "daily_streak_7"]);
    expect(result.newlyUnlockedRules.every((rule) => rule.category === "daily_streak")).toBe(
      true,
    );
  });

  it("evaluates Honesty Heart achievements from earned hearts", () => {
    const result = evaluateAchievementUnlocks({
      ...emptyProgress,
      honestyHearts: 15,
    });

    expect(result.newlyUnlockedIds).toEqual([
      "honesty_hearts_1",
      "honesty_hearts_5",
      "honesty_hearts_15",
    ]);
    expect(result.newlyUnlockedRules.every((rule) => rule.category === "honesty_hearts")).toBe(
      true,
    );
  });

  it("evaluates care and rescue event achievements", () => {
    const result = evaluateAchievementUnlocks({
      ...emptyProgress,
      careEvents: ["first_sleep", "first_power_nap", "first_happy_mood"],
    });

    expect(result.newlyUnlockedIds).toEqual([
      "care_first_sleep",
      "rescue_first_power_nap",
      "care_first_happy_mood",
    ]);
  });

  it("returns only newly unlocked ids when previous unlocks are supplied", () => {
    const previous: AchievementId[] = ["daily_streak_3", "honesty_hearts_1"];
    const result = evaluateAchievementUnlocks(
      {
        ...emptyProgress,
        currentDailyStreak: 7,
        honestyHearts: 5,
      },
      previous,
    );

    expect(result.unlockedIds).toEqual([
      "daily_streak_3",
      "honesty_hearts_1",
      "daily_streak_7",
      "honesty_hearts_5",
    ]);
    expect(result.newlyUnlockedIds).toEqual([
      "daily_streak_7",
      "honesty_hearts_5",
    ]);
  });

  it("can evaluate an individual rule", () => {
    const rule = buildAchievementRules().find(
      (candidate) => candidate.id === "honesty_hearts_30",
    );

    expect(rule).toBeDefined();
    expect(
      evaluateAchievementRule(rule!, {
        ...emptyProgress,
        honestyHearts: 29,
      }),
    ).toBe(false);
    expect(
      evaluateAchievementRule(rule!, {
        ...emptyProgress,
        honestyHearts: 30,
      }),
    ).toBe(true);
  });
});
