import { describe, expect, it } from "vitest";

import { makePet } from "../test/factories";

import {
  buyFoodForPet,
  FOOD_NOT_FOUND_ERROR,
  INSUFFICIENT_COINS_ERROR,
} from "./shop";

const now = "2026-05-22T13:00:00.000Z";

describe("feeding shop domain logic", () => {
  it("spends coins and applies food stat boosts", () => {
    const pet = makePet({ coins: 10, hunger: 40, happiness: 30, energy: 20 });

    const result = buyFoodForPet(pet, "honey-toast", now);

    expect(result.pet).toMatchObject({
      coins: 4,
      hunger: 54,
      happiness: 40,
      energy: 24,
      updatedAt: now,
      lastHungerUpdatedAt: now,
    });
    expect(result.summary).toMatchObject({
      coinsSpent: 6,
      previousCoins: 10,
      nextCoins: 4,
      hungerGained: 14,
      happinessGained: 10,
      energyGained: 4,
    });
    expect(pet.coins).toBe(10);
  });

  it("clamps boosted stats at the pet maximum", () => {
    const result = buyFoodForPet(
      makePet({ coins: 10, hunger: 98, happiness: 99, energy: 97 }),
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
      makePet({ coins: 10, hunger: 20, happiness: 70, energy: 70 }),
      "warm-soup",
      now,
    );

    expect(result.pet.mood).toBe("happy");
  });

  it("rejects purchases when coins are too low without mutating input", () => {
    const pet = makePet({ coins: 2, hunger: 20 });

    expect(() => buyFoodForPet(pet, "berry-bowl", now)).toThrow(
      INSUFFICIENT_COINS_ERROR,
    );
    expect(pet).toMatchObject({ coins: 2, hunger: 20 });
  });

  it("rejects unknown food ids", () => {
    expect(() => buyFoodForPet(makePet({ coins: 10 }), "star-cake", now)).toThrow(
      FOOD_NOT_FOUND_ERROR,
    );
  });
});
