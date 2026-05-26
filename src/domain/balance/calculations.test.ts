import { describe, expect, it } from "vitest";

import { makePet, makeSession } from "../../test/factories";
import {
  calculateFocusCareImpact,
  calculateFocusReward,
  calculateFocusStartRequirements,
  calculateFoodEffects,
  calculateHonestyReward,
  calculateIdleCareImpact,
  calculateMoodForStats,
  calculateWakeUpEffects,
  canStartFocus,
} from "./calculations";
import { ACTIVE_BALANCE_PROFILE } from "./activeProfile";
import type { BalanceProfile } from "./types";

describe("metric calculations with the active balance profile", () => {
  it.each([
    { minutes: 5 },
    { minutes: 25 },
    { minutes: 90 },
  ])("keeps current fixed completion reward for $minutes minutes", ({ minutes }) => {
    expect(calculateFocusReward(minutes)).toEqual({
      xp: 25,
      coins: 10,
      happiness: 8,
      hunger: 0,
      energy: 0,
      streak: 1,
      honestyHearts: 0,
    });
  });

  it.each([
    {
      coinsEarned: 1,
      energyChanged: -1.4,
      hungerChanged: -1,
      minutes: 5,
    },
    {
      coinsEarned: 5,
      energyChanged: -7,
      hungerChanged: -5,
      minutes: 25,
    },
    {
      coinsEarned: 18,
      energyChanged: -25.2,
      hungerChanged: -18,
      minutes: 90,
    },
  ])(
    "calculates current focus care impact for $minutes minutes",
    ({ coinsEarned, energyChanged, hungerChanged, minutes }) => {
      expect(calculateFocusCareImpact(minutes)).toMatchObject({
        coinsEarned,
        elapsedMinutes: minutes,
        hungerChanged,
      });
      expect(calculateFocusCareImpact(minutes).energyChanged).toBeCloseTo(
        energyChanged,
      );
    },
  );

  it("keeps current focus start requirements disabled", () => {
    expect(calculateFocusStartRequirements(25)).toEqual({
      enabled: false,
      requiredEnergy: 0,
      requiredHunger: 0,
    });
    expect(canStartFocus(makePet({ energy: 0, hunger: 0 }), 180)).toBe(true);
  });

  it("supports profile-injected focus start requirements without activating them", () => {
    const profile = withStartRequirements({
      enabled: true,
      minEnergyBase: 5,
      minEnergyPerMinute: 0.8,
      minHungerBase: 8,
      minHungerPerMinute: 0.5,
    });

    expect(calculateFocusStartRequirements(25, profile)).toEqual({
      enabled: true,
      requiredEnergy: 20,
      requiredHunger: 13,
    });
    expect(canStartFocus(makePet({ energy: 19, hunger: 100 }), 25, profile)).toBe(
      false,
    );
    expect(canStartFocus(makePet({ energy: 20, hunger: 13 }), 25, profile)).toBe(
      true,
    );
  });

  it.each([
    {
      expectedHappiness: 48,
      expectedHunger: 0,
      from: "2026-05-22T08:00:00.000Z",
      hunger: 10,
      to: "2026-05-22T12:00:00.000Z",
    },
    {
      expectedHappiness: 50,
      expectedHunger: 100,
      from: "2026-05-22T12:00:00.000Z",
      hunger: 100,
      to: "2026-05-22T12:00:00.000Z",
    },
  ])(
    "calculates idle care impact from $from to $to",
    ({ expectedHappiness, expectedHunger, from, hunger, to }) => {
      const result = calculateIdleCareImpact(
        makePet({ happiness: 50, hunger, energy: 80 }),
        from,
        to,
      );

      expect(result.nextStats.hunger).toBe(expectedHunger);
      expect(result.nextStats.happiness).toBe(expectedHappiness);
      expect(result.nextStats.energy).toBe(80);
    },
  );

  it.each([
    {
      energyGained: 18,
      expectedEnergy: 38,
      expectedHappiness: 51,
      expectedHunger: 96,
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
      wakeAt: "2026-05-22T14:00:00.000Z",
    },
    {
      energyGained: 54,
      expectedEnergy: 74,
      expectedHappiness: 53,
      expectedHunger: 84,
      sleepStartedAt: "2026-05-22T13:00:00.000Z",
      wakeAt: "2026-05-22T17:00:00.000Z",
    },
  ])(
    "calculates wake effects from $sleepStartedAt to $wakeAt",
    ({
      energyGained,
      expectedEnergy,
      expectedHappiness,
      expectedHunger,
      sleepStartedAt,
      wakeAt,
    }) => {
      const result = calculateWakeUpEffects(
        makePet({ energy: 20, happiness: 50, hunger: 100 }),
        sleepStartedAt,
        wakeAt,
      );

      expect(result.energyGained).toBe(energyGained);
      expect(result.nextStats).toEqual({
        energy: expectedEnergy,
        happiness: expectedHappiness,
        hunger: expectedHunger,
      });
    },
  );

  it.each([
    {
      eligible: true,
      reason: null,
      session: makeSession({
        abandonmentReason: "honest_confirmation",
        status: "abandoned",
      }),
    },
    {
      eligible: false,
      reason: "not_honest_confirmation",
      session: makeSession({
        abandonmentReason: "cancelled",
        status: "abandoned",
      }),
    },
    {
      eligible: false,
      reason: "not_honest_confirmation",
      session: makeSession({ status: "completed" }),
    },
  ] as const)("calculates honesty reward eligibility", ({ eligible, reason, session }) => {
    const result = calculateHonestyReward(session);

    expect(result.eligible).toBe(eligible);
    expect(result.reason).toBe(reason);
    expect(result.reward).toEqual(
      eligible
        ? {
            xp: 0,
            coins: 0,
            happiness: 3,
            hunger: 0,
            energy: 0,
            streak: 0,
            honestyHearts: 1,
          }
        : {
            xp: 0,
            coins: 0,
            happiness: 0,
            hunger: 0,
            energy: 0,
            streak: 0,
            honestyHearts: 0,
          },
    );
  });

  it.each([
    { expectedMood: "hungry", happiness: 80, hunger: 20, energy: 80 },
    { expectedMood: "tired", happiness: 80, hunger: 80, energy: 10 },
    { expectedMood: "sad", happiness: 20, hunger: 80, energy: 80 },
    { expectedMood: "happy", happiness: 80, hunger: 80, energy: 80 },
    { expectedMood: "calm", happiness: 50, hunger: 80, energy: 80 },
  ] as const)(
    "calculates $expectedMood mood from care stats",
    ({ expectedMood, happiness, hunger, energy }) => {
      expect(calculateMoodForStats({ happiness, hunger, energy })).toBe(
        expectedMood,
      );
    },
  );

  it("honors display activity mood overrides", () => {
    expect(
      calculateMoodForStats(
        { happiness: 80, hunger: 20, energy: 10 },
        { isWorking: true, isSleeping: true },
      ),
    ).toBe("working");
    expect(
      calculateMoodForStats(
        { happiness: 80, hunger: 20, energy: 10 },
        { isSleeping: true },
      ),
    ).toBe("sleeping");
  });

  it.each([
    {
      energyGained: 0,
      foodId: "berry-bowl",
      happinessGained: 6,
      hungerGained: 12,
      nextCoins: 7,
    },
    {
      energyGained: 0,
      foodId: "warm-soup",
      happinessGained: 4,
      hungerGained: 22,
      nextCoins: 5,
    },
    {
      energyGained: 4,
      foodId: "honey-toast",
      happinessGained: 10,
      hungerGained: 14,
      nextCoins: 4,
    },
    {
      energyGained: 16,
      foodId: "moon-milk",
      happinessGained: 6,
      hungerGained: 8,
      nextCoins: 3,
    },
  ])(
    "calculates current food effects for $foodId",
    ({ energyGained, foodId, happinessGained, hungerGained, nextCoins }) => {
      const result = calculateFoodEffects(
        foodId,
        makePet({ coins: 10, hunger: 40, happiness: 30, energy: 20 }),
      );

      expect(result).toMatchObject({
        canAfford: true,
        energyGained,
        happinessGained,
        hungerGained,
        nextCoins,
      });
    },
  );
});

describe("target configurable v1 balance examples (inactive)", () => {
  it.todo("can make focus rewards duration-based without changing active profile");
  it.todo("can activate daily honesty limits without changing active profile");
});

function withStartRequirements(
  startRequirements: BalanceProfile["focus"]["startRequirements"],
): BalanceProfile {
  return {
    ...ACTIVE_BALANCE_PROFILE,
    focus: {
      ...ACTIVE_BALANCE_PROFILE.focus,
      startRequirements,
    },
  };
}
