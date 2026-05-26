import { describe, expect, it } from "vitest";

import { makeDailyFocusState, makePet } from "../test/factories";
import { canPetStartFocus } from "./pet";
import {
  EMERGENCY_SNACK_DAILY_LIMIT_ERROR,
  EMERGENCY_SNACK_NOT_NEEDED_ERROR,
  MAX_EMERGENCY_SNACKS_PER_DAY,
  MAX_POWER_NAPS_PER_DAY,
  POWER_NAP_COOLDOWN_ACTIVE_ERROR,
  POWER_NAP_DAILY_LIMIT_ERROR,
  applyEmergencySnack,
  applyPowerNap,
  checkEmergencySnackEligibility,
} from "./rescue";

const now = "2026-05-26T12:00:00.000Z";

describe("power nap rescue action", () => {
  it("restores capped care stats without producing progress or economy rewards", () => {
    const pet = makePet({
      coins: 2,
      energy: 90,
      happiness: 100,
      honestyHearts: 3,
      hunger: 2,
      streak: 4,
      xp: 77,
    });

    const result = applyPowerNap(pet, makeDailyFocusState(), now);

    expect(result.pet).toMatchObject({
      coins: 2,
      energy: 100,
      happiness: 100,
      honestyHearts: 3,
      hunger: 0,
      streak: 4,
      xp: 77,
    });
    expect(result.summary).toMatchObject({
      energyGained: 10,
      happinessGained: 0,
      hungerChanged: -2,
    });
    expect(result.dailyFocusState).toMatchObject({
      powerNapsUsed: 1,
      lastPowerNapAt: now,
    });
  });

  it("enforces the daily usage limit and cooldown", () => {
    expect(() =>
      applyPowerNap(
        makePet({ energy: 10 }),
        makeDailyFocusState({ powerNapsUsed: MAX_POWER_NAPS_PER_DAY }),
        now,
      ),
    ).toThrow(POWER_NAP_DAILY_LIMIT_ERROR);

    expect(() =>
      applyPowerNap(
        makePet({ energy: 10 }),
        makeDailyFocusState({
          powerNapsUsed: 1,
          lastPowerNapAt: "2026-05-26T11:00:00.000Z",
        }),
        now,
      ),
    ).toThrow(POWER_NAP_COOLDOWN_ACTIVE_ERROR);
  });
});

describe("emergency snack rescue action", () => {
  it("restores hunger up to its cap without producing progress or economy rewards", () => {
    const pet = makePet({
      coins: 0,
      energy: 11,
      happiness: 42,
      honestyHearts: 2,
      hunger: 95,
      streak: 3,
      xp: 44,
    });

    const result = applyEmergencySnack(
      pet,
      makeDailyFocusState(),
      now,
      { hasOtherAntiDeadlockCondition: true },
    );

    expect(result.pet).toMatchObject({
      coins: 0,
      energy: 11,
      happiness: 42,
      honestyHearts: 2,
      hunger: 100,
      streak: 3,
      xp: 44,
    });
    expect(result.summary.hungerGained).toBe(5);
    expect(result.dailyFocusState.emergencySnacksUsed).toBe(1);
  });

  it("only offers the free snack for low hunger when food is unaffordable", () => {
    expect(
      checkEmergencySnackEligibility(
        makePet({ coins: 0, hunger: 8 }),
        makeDailyFocusState(),
      ).canApply,
    ).toBe(true);
    expect(() =>
      applyEmergencySnack(
        makePet({ coins: 8, hunger: 8 }),
        makeDailyFocusState(),
        now,
      ),
    ).toThrow(EMERGENCY_SNACK_NOT_NEEDED_ERROR);
    expect(() =>
      applyEmergencySnack(
        makePet({ coins: 0, hunger: 40 }),
        makeDailyFocusState(),
        now,
      ),
    ).toThrow(EMERGENCY_SNACK_NOT_NEEDED_ERROR);
  });

  it("enforces the daily usage limit", () => {
    expect(() =>
      applyEmergencySnack(
        makePet({ coins: 0, hunger: 0 }),
        makeDailyFocusState({
          emergencySnacksUsed: MAX_EMERGENCY_SNACKS_PER_DAY,
        }),
        now,
      ),
    ).toThrow(EMERGENCY_SNACK_DAILY_LIMIT_ERROR);
  });

  it("recovers a no-coins low-hunger and low-energy pet enough for short focus", () => {
    const pet = makePet({ coins: 0, energy: 0, happiness: 40, hunger: 0 });
    const dailyState = makeDailyFocusState();
    const fed = applyEmergencySnack(pet, dailyState, now);
    const rested = applyPowerNap(
      fed.pet,
      fed.dailyFocusState,
      "2026-05-26T12:01:00.000Z",
    );

    expect(rested.pet).toMatchObject({
      coins: 0,
      energy: 18,
      hunger: 9,
      streak: 0,
      xp: 0,
    });
    expect(canPetStartFocus(rested.pet, 15)).toBe(true);
  });
});
