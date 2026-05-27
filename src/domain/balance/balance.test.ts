import { describe, expect, it } from "vitest";

import { makePet, makeSession } from "../../test/factories";
import {
  APP_OPEN_HAPPINESS_DECAY_PER_HOUR,
  applyFocusSessionImpact,
  BASE_HAPPINESS_DECAY_PER_HOUR,
  CRITICAL_HUNGER_ENERGY_DECAY_PER_HOUR,
  CRITICAL_HUNGER_ENERGY_THRESHOLD,
  DEFAULT_HUNGER_DECAY_PER_HOUR,
  FOCUS_COIN_MINUTES,
  FOCUS_ENERGY_DECAY_PER_MINUTE,
  FOCUS_HUNGER_DECAY_PER_MINUTE,
  MAX_APP_OPEN_HAPPINESS_DECAY,
  MAX_PET_STAT,
  LOW_ENERGY_HAPPINESS_DECAY_PER_HOUR,
  LOW_ENERGY_HAPPINESS_THRESHOLD,
  LOW_HUNGER_HAPPINESS_DECAY_PER_HOUR,
  LOW_HUNGER_HAPPINESS_THRESHOLD,
  SLEEP_ENERGY_GAIN_PER_HOUR,
  SLEEP_HAPPINESS_MAX_GAIN,
  SLEEP_HUNGER_DECAY_PER_HOUR,
  SLEEP_HAPPINESS_ENERGY_STEP,
  XP_PER_LEVEL,
} from "../pet";
import {
  CUSTOM_DURATION_ADJUSTMENT_MINUTES,
  DEFAULT_FOCUS_DURATION_MINUTES,
  FOCUS_PRESET_DURATION_MINUTES,
  MAX_FOCUS_DURATION_MINUTES,
  MIN_FOCUS_DURATION_MINUTES,
} from "../settings";
import { PET_MOOD_RULES, resolvePetMood } from "../petMoodRules";
import {
  claimSessionReward,
  FOCUS_SESSION_COIN_REWARD,
  FOCUS_SESSION_ENERGY_REWARD,
  FOCUS_SESSION_HAPPINESS_REWARD,
  FOCUS_SESSION_HUNGER_REWARD,
  FOCUS_SESSION_XP_REWARD,
  HONESTY_ENERGY_REWARD,
  HONESTY_HAPPINESS_REWARD,
  HONESTY_HEART_REWARD,
  MAX_HONESTY_HEARTS_PER_DAY,
  MIN_HONESTY_SESSION_MINUTES,
} from "../rewards";
import { FOOD_CATALOG } from "../shop";
import {
  EMERGENCY_SNACK_ENERGY_GAIN,
  EMERGENCY_SNACK_HAPPINESS_GAIN,
  EMERGENCY_SNACK_HUNGER_GAIN,
  EMERGENCY_SNACK_MAX_HUNGER,
  MAX_EMERGENCY_SNACKS_PER_DAY,
  MAX_POWER_NAPS_PER_DAY,
  POWER_NAP_COOLDOWN_MINUTES,
  POWER_NAP_DURATION_MINUTES,
  POWER_NAP_ENERGY_GAIN,
  POWER_NAP_HAPPINESS_GAIN,
  POWER_NAP_HUNGER_COST,
} from "../rescue";
import { ACTIVE_BALANCE_PROFILE } from "./activeProfile";

describe("active balance profile", () => {
  it("mirrors current progression, care, focus, and sleep constants", () => {
    expect(DEFAULT_FOCUS_DURATION_MINUTES).toBe(
      ACTIVE_BALANCE_PROFILE.focus.defaultDurationMinutes,
    );
    expect(MIN_FOCUS_DURATION_MINUTES).toBe(
      ACTIVE_BALANCE_PROFILE.focus.minDurationMinutes,
    );
    expect(MAX_FOCUS_DURATION_MINUTES).toBe(
      ACTIVE_BALANCE_PROFILE.focus.maxDurationMinutes,
    );
    expect(FOCUS_PRESET_DURATION_MINUTES).toBe(
      ACTIVE_BALANCE_PROFILE.focus.presetDurationMinutes,
    );
    expect(CUSTOM_DURATION_ADJUSTMENT_MINUTES).toBe(
      ACTIVE_BALANCE_PROFILE.focus.customDurationAdjustmentMinutes,
    );
    expect(XP_PER_LEVEL).toBe(ACTIVE_BALANCE_PROFILE.progression.xpPerLevel);
    expect(MAX_PET_STAT).toBe(ACTIVE_BALANCE_PROFILE.progression.maxPetStat);
    expect(DEFAULT_HUNGER_DECAY_PER_HOUR).toBe(
      ACTIVE_BALANCE_PROFILE.care.hungerDecayPerHour,
    );
    expect(APP_OPEN_HAPPINESS_DECAY_PER_HOUR).toBe(
      ACTIVE_BALANCE_PROFILE.care.baseHappinessDecayPerHour,
    );
    expect(BASE_HAPPINESS_DECAY_PER_HOUR).toBe(0.25);
    expect(LOW_HUNGER_HAPPINESS_THRESHOLD).toBe(35);
    expect(LOW_HUNGER_HAPPINESS_DECAY_PER_HOUR).toBe(1);
    expect(LOW_ENERGY_HAPPINESS_THRESHOLD).toBe(25);
    expect(LOW_ENERGY_HAPPINESS_DECAY_PER_HOUR).toBe(0.5);
    expect(CRITICAL_HUNGER_ENERGY_THRESHOLD).toBe(20);
    expect(CRITICAL_HUNGER_ENERGY_DECAY_PER_HOUR).toBe(2);
    expect(BASE_HAPPINESS_DECAY_PER_HOUR).toBe(
      ACTIVE_BALANCE_PROFILE.care.baseHappinessDecayPerHour,
    );
    expect(MAX_APP_OPEN_HAPPINESS_DECAY).toBe(
      ACTIVE_BALANCE_PROFILE.care.maxAppOpenHappinessDecay,
    );
    expect(FOCUS_COIN_MINUTES).toBe(
      ACTIVE_BALANCE_PROFILE.focus.baseCoinIntervalMinutes,
    );
    expect(FOCUS_HUNGER_DECAY_PER_MINUTE).toBe(
      ACTIVE_BALANCE_PROFILE.focus.hungerDecayPerMinute,
    );
    expect(FOCUS_ENERGY_DECAY_PER_MINUTE).toBe(
      ACTIVE_BALANCE_PROFILE.focus.energyDecayPerMinute,
    );
    expect(SLEEP_ENERGY_GAIN_PER_HOUR).toBe(
      ACTIVE_BALANCE_PROFILE.sleep.energyGainPerHour,
    );
    expect(SLEEP_HUNGER_DECAY_PER_HOUR).toBe(
      ACTIVE_BALANCE_PROFILE.sleep.hungerDecayPerHour,
    );
    expect(SLEEP_HAPPINESS_ENERGY_STEP).toBe(
      ACTIVE_BALANCE_PROFILE.sleep.happinessEnergyStep,
    );
    expect(SLEEP_HAPPINESS_MAX_GAIN).toBe(
      ACTIVE_BALANCE_PROFILE.sleep.maxHappinessGain,
    );
  });

  it("uses sleep as energy recovery without turning it into a reward", () => {
    expect({
      energyGainPerHour: SLEEP_ENERGY_GAIN_PER_HOUR,
      hungerDecayPerHour: SLEEP_HUNGER_DECAY_PER_HOUR,
      happinessEnergyStep: SLEEP_HAPPINESS_ENERGY_STEP,
      maxHappinessGain: SLEEP_HAPPINESS_MAX_GAIN,
    }).toEqual({
      energyGainPerHour: 20,
      hungerDecayPerHour: 2,
      happinessEnergyStep: 20,
      maxHappinessGain: 8,
    });
  });

  it("mirrors current reward constants", () => {
    expect(FOCUS_SESSION_XP_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.focus.xpPerFocusMinute,
    );
    expect(FOCUS_SESSION_COIN_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.focus.completionBonusPer25Minutes,
    );
    expect(FOCUS_SESSION_HAPPINESS_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.focus.happinessPer5Minutes,
    );
    expect(FOCUS_SESSION_HUNGER_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.focus.completedReward.hunger,
    );
    expect(FOCUS_SESSION_ENERGY_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.focus.completedReward.energy,
    );
    expect(HONESTY_HAPPINESS_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.honesty.reward.happiness,
    );
    expect(HONESTY_ENERGY_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.honesty.reward.energy,
    );
    expect(HONESTY_HEART_REWARD).toBe(
      ACTIVE_BALANCE_PROFILE.honesty.reward.honestyHearts,
    );
    expect(HONESTY_HAPPINESS_REWARD).toBe(2);
    expect(HONESTY_HEART_REWARD).toBe(1);
    expect(MIN_HONESTY_SESSION_MINUTES).toBe(15);
    expect(MAX_HONESTY_HEARTS_PER_DAY).toBe(2);
  });

  it("uses the active profile for focus impact math", () => {
    const result = applyFocusSessionImpact(
      makePet(),
      makeSession(),
      "2026-05-22T12:25:00.000Z",
    );

    expect(result.pet.coins).toBe(
      Math.floor(25 / ACTIVE_BALANCE_PROFILE.focus.baseCoinIntervalMinutes),
    );
    expect(result.pet.hunger).toBe(
      100 - 25 * ACTIVE_BALANCE_PROFILE.focus.hungerDecayPerMinute,
    );
    expect(result.pet.energy).toBe(
      80 - 25 * ACTIVE_BALANCE_PROFILE.focus.energyDecayPerMinute,
    );
  });

  it("uses the active profile for reward values", () => {
    const result = claimSessionReward({
      pet: makePet(),
      session: makeSession({
        status: "completed",
        confirmedAt: "2026-05-22T12:30:00.000Z",
      }),
      existingRewards: [],
      now: "2026-05-22T12:31:00.000Z",
      rewardId: "reward-1",
    });

    expect(result.summary).toMatchObject({
      xpAwarded:
        25 * ACTIVE_BALANCE_PROFILE.focus.xpPerFocusMinute,
      coinsAwarded: ACTIVE_BALANCE_PROFILE.focus.completionBonusPer25Minutes,
      happinessAwarded: 5 * ACTIVE_BALANCE_PROFILE.focus.happinessPer5Minutes,
      streakAwarded: 1,
    });
  });

  it("uses the active profile for mood rules and shop catalog", () => {
    expect(
      PET_MOOD_RULES.map(({ mood, priority }) => ({ mood, priority })),
    ).toEqual(
      ACTIVE_BALANCE_PROFILE.mood.rules.map(({ mood, priority }) => ({
        mood,
        priority,
      })),
    );
    expect(resolvePetMood({ happiness: 80, hunger: 10, energy: 80 })).toBe(
      "hungry",
    );
    expect(FOOD_CATALOG).toBe(ACTIVE_BALANCE_PROFILE.shop.foodCatalog);
  });

  it("exposes the active rescue configuration", () => {
    expect({
      durationMinutes: POWER_NAP_DURATION_MINUTES,
      energyGain: POWER_NAP_ENERGY_GAIN,
      happinessGain: POWER_NAP_HAPPINESS_GAIN,
      hungerCost: POWER_NAP_HUNGER_COST,
      maxUses: MAX_POWER_NAPS_PER_DAY,
      cooldownMinutes: POWER_NAP_COOLDOWN_MINUTES,
    }).toEqual({
      durationMinutes: 15,
      energyGain: 18,
      happinessGain: 1,
      hungerCost: 3,
      maxUses: 2,
      cooldownMinutes: 120,
    });
    expect({
      hungerGain: EMERGENCY_SNACK_HUNGER_GAIN,
      happinessGain: EMERGENCY_SNACK_HAPPINESS_GAIN,
      energyGain: EMERGENCY_SNACK_ENERGY_GAIN,
      maxHunger: EMERGENCY_SNACK_MAX_HUNGER,
      maxUses: MAX_EMERGENCY_SNACKS_PER_DAY,
    }).toEqual({
      hungerGain: 15,
      happinessGain: 0,
      energyGain: 0,
      maxHunger: 25,
      maxUses: 1,
    });
  });
});
