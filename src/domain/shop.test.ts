import { describe, expect, it } from "vitest";

import { makePet } from "../test/factories";

import {
  buyFoodForPet,
  FOOD_CATALOG,
  FOOD_NOT_FOUND_ERROR,
  INSUFFICIENT_COINS_ERROR,
  PET_SLEEPING_CANNOT_EAT_ERROR,
} from "./shop";

const now = "2026-05-22T13:00:00.000Z";

describe("feeding shop domain logic", () => {
  it("exposes the v1 catalog from centralized balance config", () => {
    expect(FOOD_CATALOG).toEqual([
      {
        id: "berry-bowl",
        category: "food",
        cost: 8,
        hunger: 10,
        happiness: 4,
        energy: 0,
      },
      {
        id: "warm-soup",
        category: "food",
        cost: 12,
        hunger: 22,
        happiness: 3,
        energy: 0,
      },
      {
        id: "honey-toast",
        category: "food",
        cost: 16,
        hunger: 14,
        happiness: 8,
        energy: 2,
      },
      {
        id: "moon-milk",
        category: "food",
        cost: 20,
        hunger: 6,
        happiness: 4,
        energy: 12,
      },
      {
        id: "cozy-stew",
        category: "food",
        cost: 28,
        hunger: 30,
        happiness: 6,
        energy: 4,
      },
    ]);
  });

  it("spends coins and applies food stat boosts", () => {
    const pet = makePet({ coins: 20, hunger: 40, happiness: 30, energy: 20 });

    const result = buyFoodForPet(pet, "honey-toast", now);

    expect(result.pet).toMatchObject({
      coins: 4,
      hunger: 54,
      happiness: 38,
      energy: 22,
      updatedAt: now,
      lastHungerUpdatedAt: now,
    });
    expect(result.summary).toMatchObject({
      coinsSpent: 16,
      previousCoins: 20,
      nextCoins: 4,
      hungerGained: 14,
      happinessGained: 8,
      energyGained: 2,
    });
    expect(pet.coins).toBe(20);
  });

  it("clamps boosted stats at the pet maximum", () => {
    const result = buyFoodForPet(
      makePet({ coins: 20, hunger: 98, happiness: 99, energy: 97 }),
      "moon-milk",
      now,
    );

    expect(result.pet.hunger).toBe(100);
    expect(result.pet.happiness).toBe(100);
    expect(result.pet.energy).toBe(100);
    expect(result.summary.hungerGained).toBe(2);
    expect(result.summary.happinessGained).toBe(1);
    expect(result.summary.energyGained).toBe(3);
  });

  it("recalculates mood after feeding", () => {
    const result = buyFoodForPet(
      makePet({ coins: 12, hunger: 20, happiness: 70, energy: 70 }),
      "warm-soup",
      now,
    );

    expect(result.pet.mood).toBe("happy");
  });

  it("rejects purchases when coins are too low without mutating input", () => {
    const pet = makePet({ coins: 7, hunger: 20 });

    expect(() => buyFoodForPet(pet, "berry-bowl", now)).toThrow(
      INSUFFICIENT_COINS_ERROR,
    );
    expect(pet).toMatchObject({ coins: 7, hunger: 20 });
  });

  it("rejects unknown food ids", () => {
    expect(() => buyFoodForPet(makePet({ coins: 28 }), "star-cake", now)).toThrow(
      FOOD_NOT_FOUND_ERROR,
    );
  });

  it("rejects purchases while the pet is sleeping", () => {
    const pet = makePet({
      coins: 20,
      sleepStartedAt: "2026-05-22T12:30:00.000Z",
    });

    expect(() => buyFoodForPet(pet, "moon-milk", now)).toThrow(
      PET_SLEEPING_CANNOT_EAT_ERROR,
    );
    expect(pet.coins).toBe(20);
  });
});
